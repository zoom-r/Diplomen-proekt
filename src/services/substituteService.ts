const settings = getSettings(); // Взима настройките на системата.

/**
 * Връща масив от дати (YYYY-MM-DD) за текущата седмица (понеделник – петък).
 * Изчислява понеделника от текущата седмица и добавя следващите дни.
 * @returns Масив от дати за текущата седмица.
 */
function getCurrentWeekDates(): string[] {
    const today = new Date(); // Взима текущата дата.
    const day = today.getDay(); // Взима деня от седмицата (0 = неделя, 1 = понеделник, ..., 6 = събота).

    // Изчислява понеделника от текущата седмица.
    const monday = new Date(today);
    if (day === 0) {
        monday.setDate(today.getDate() - 6); // Ако е неделя, връща се 6 дни назад.
    } else {
        monday.setDate(today.getDate() - (day - 1)); // Връща се до понеделник.
    }

    const result: string[] = [];
    for (let i = 0; i < 5; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i); // Добавя дни към понеделника.
        result.push(d.toISOString().split('T')[0]); // Форматира датата като YYYY-MM-DD.
    }

    return result; // Връща масив от дати.
}

/**
 * Връща всички замествания и отсъствия за текущата седмица, агрегирани по ден и час.
 * @returns Обект с данни за заместванията, групирани по дни.
 */
function getSubstitutionGridForWeek() {
    const conn = getConnection_(); // Взима връзка към базата данни.
    const workspaceId = getCurrentUser_().workspace_id; // Взима ID на работното пространство на текущия потребител.

    const substituteKey = settings.substitute_key; // Взима ключа за таблицата substitute.

    // Подготвя SQL заявка за извличане на данни за заместванията.
    const stmt = conn.prepareStatement('SELECT monday, tuesday, wednesday, thursday, friday FROM substitute WHERE substitute_key = ?');
    stmt.setString(1, substituteKey); // Задава substitute_key като параметър.
    const rs = stmt.executeQuery(); // Изпълнява заявката.

    if (!rs.next()) return {}; // Ако няма резултати, връща празен обект.

    const grid = {}; // Обект за съхранение на данните за заместванията.
    const days = ["monday", "tuesday", "wednesday", "thursday", "friday"]; // Дни от седмицата.

    for (const day of days) {
        const weekDates = getCurrentWeekDates(); // Взима датите за текущата седмица.
        const rawJson = rs.getString(day); // Взима JSON данните за текущия ден.
        if (!rawJson) continue; // Пропуска, ако няма данни за деня.

        try {
            const entries: SubstitutionEntry[] = JSON.parse(rawJson); // Парсва JSON данните.
            if (!Array.isArray(entries)) continue; // Пропуска, ако данните не са масив.

            for (const entry of entries) {
                if (!weekDates.includes(entry.date)) continue; // Пропуска дати извън текущата седмица.
                if (!grid[day]) grid[day] = []; // Инициализира масив за деня, ако не съществува.

                // Добавя данните за заместването в масива за деня.
                grid[day].push(entry);
                // grid[day].push({
                //     time: entry.time,
                //     shift: entry.shift,
                //     group: entry.group,
                //     room: entry.room,
                //     absentTeacher: entry.absentTeacher,
                //     substitute: entry.substitute || null
                // });
            }
        } catch (e) {
            Logger.log(`Грешка при JSON парсване за ${day}: ` + e); // Логва грешка при парсване.
        }
    }

    return grid; // Връща обект с данни за заместванията.
}

/**
 * Връща дата (YYYY-MM-DD) за даден ден от седмицата.
 * @param day - Ден от седмицата (например "monday").
 * @returns Дата във формат "YYYY-MM-DD".
 */
function getDateForWeekday_(day: string): string {
    const map = {
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
    }; // Карта на дните от седмицата към индекси.

    const today = new Date(); // Взима текущата дата.
    const monday = new Date(today); // Копира текущата дата.
    const dayIndex = map[day]; // Взима индекса за дадения ден.
    const currentWeekday = today.getDay() || 7; // Ако е неделя, задава 7.

    monday.setDate(today.getDate() - currentWeekday + 1); // Връща понеделника от текущата седмица.

    const result = new Date(monday);
    result.setDate(monday.getDate() + dayIndex - 1); // Добавя разликата до желания ден.

    return Utilities.formatDate(result, Session.getScriptTimeZone(), "yyyy-MM-dd"); // Форматира датата.
}

/**
 * Създава записи в substitute таблицата за избран потребител и период.
 * @param userId - ID на потребителя.
 * @param fromDate - Начална дата.
 * @param toDate - Крайна дата.
 */
function createAbsentSubstitution(userId: string, fromDate: string, toDate: string) {
    const conn = getConnection_(); // Взима връзка към базата данни.
    const wsId = getCurrentUser_().workspace_id; // Взима ID на работното пространство на текущия потребител.
    const substituteKey = settings.substitute_key; // Взима substitute_key.

    // Подготвя SQL заявка за извличане на разписанието на потребителя.
    const stmt = conn.prepareStatement(`SELECT timetable, names, position FROM users WHERE id = ?`);
    stmt.setString(1, userId); // Задава userId като параметър.
    const rs = stmt.executeQuery(); // Изпълнява заявката.

    if (!rs.next()) return; // Ако няма резултати, прекратява изпълнението.

    const timetable: ClassEntry[] = JSON.parse(rs.getString("timetable") || '[]'); // Парсва разписанието.
    const name: string = rs.getString("names"); // Взима името на потребителя.
    const position: string = rs.getString("position"); // Взима позицията на потребителя.

    const substituteData: Record<string, SubstitutionEntry[]> = {
        monday: [], tuesday: [], wednesday: [], thursday: [], friday: []
    }; // Инициализира обект за заместванията.

    const dateMap = getDateDayMap_(fromDate, toDate); // Взима карта на дати и дни.

    for (const [date, day] of Object.entries(dateMap)) {
        if (!substituteData[day]) continue; // Пропуска, ако денят не е валиден.

        timetable.forEach(c => {
            if (c.day === day) {
                // Добавя запис за заместване.
                substituteData[day].push(new SubstitutionEntry(date, c.time, c.group, c.shift, c.room, {id: userId, name, position}, null));
                // substituteData[day].push({
                //     date,
                //     time: c.time,
                //     shift: c.shift,
                //     group: c.group,
                //     room: c.room,
                //     absentTeacher: { id: userId, name, position },
                //     substitute: null
                // });
            }
        });
    }

    // Подготвя SQL заявка за актуализиране на таблицата substitute.
    const up = conn.prepareStatement(`UPDATE substitute SET monday=?, tuesday=?, wednesday=?, thursday=?, friday=? WHERE substitute_key = ?`);
    up.setString(1, JSON.stringify(substituteData.monday));
    up.setString(2, JSON.stringify(substituteData.tuesday));
    up.setString(3, JSON.stringify(substituteData.wednesday));
    up.setString(4, JSON.stringify(substituteData.thursday));
    up.setString(5, JSON.stringify(substituteData.friday));
    up.setString(6, substituteKey);
    up.executeUpdate(); // Изпълнява заявката.
}

/**
 * Връща обект с дати и съответстващите им дни от седмицата.
 * @param from - Начална дата.
 * @param to - Крайна дата.
 * @returns Обект { "YYYY-MM-DD": "day" }.
 */
function getDateDayMap_(from: string, to: string): Record<string, string> {
    const result = {}; // Инициализира обект за резултатите.
    const start = new Date(from); // Начална дата.
    const end = new Date(to); // Крайна дата.

    while (start <= end) {
        const iso = Utilities.formatDate(start, Session.getScriptTimeZone(), 'yyyy-MM-dd'); // Форматира датата.
        const day = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][start.getDay()]; // Взима деня от седмицата.

        if (['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(day)) {
            result[iso] = day;
        }
        start.setDate(start.getDate() + 1);
    }
    return result;
}

/**
 * Премахва отсъствията на потребител за цялата седмица.
 * Изтрива всички записи за отсъствия на даден потребител от таблицата `substitute`.
 * @param userId - ID на потребителя.
 */
function removeAbsentFromWeek(userId: string) {
    const conn = getConnection_(); // Взима връзка към базата данни.
    const key = settings.substitute_key; // Взима substitute_key.

    const days = ["monday", "tuesday", "wednesday", "thursday", "friday"]; // Дни от седмицата.
    const selectStmt = conn.prepareStatement(`SELECT ${days.join(', ')} FROM substitute WHERE substitute_key = ?`);
    selectStmt.setString(1, key); // Задава substitute_key като параметър.
    const rs = selectStmt.executeQuery(); // Изпълнява заявката.

    if (!rs.next()) return; // Ако няма резултати, прекратява изпълнението.

    const data = {}; // Обект за съхранение на данните за заместванията.
    for (const day of days) {
        const raw = rs.getString(day); // Взима JSON данните за текущия ден.
        const entries: SubstitutionEntry[] = raw ? JSON.parse(raw) as SubstitutionEntry[] : []; // Парсва JSON данните или връща празен масив.
        data[day] = entries.filter(e => e.absentTeacher.id !== userId); // Премахва записи за дадения потребител.
    }

    // Подготвя SQL заявка за актуализиране на таблицата substitute.
    const updateStmt = conn.prepareStatement(
        `UPDATE substitute SET monday=?, tuesday=?, wednesday=?, thursday=?, friday=? WHERE substitute_key = ?`
    );
    days.forEach((day, i) => updateStmt.setString(i + 1, JSON.stringify(data[day]))); // Задава данните за всеки ден.
    updateStmt.setString(6, key); // Задава substitute_key.
    updateStmt.executeUpdate(); // Изпълнява заявката.
}

/**
 * Изпраща групирана заявка за заместване.
 * Записва заявката в таблицата `requests` със статус "pending".
 * @param schedule - Масив от записи за заместванията.
 */
function sendGroupedSubstituteRequest(schedule: {day: string, hour: number, shift: string, group: string}[]) { // FIXME
    const conn = getConnection_(); // Взима връзка към базата данни.
    const user = getCurrentUser_(); // Взима текущия потребител.

    // Създава съдържание за заявката.
    const content = {
        type: 'substitute-request', // Тип на заявката.
        from_id: user.id, // ID на потребителя, който изпраща заявката.
        fromName: user.names, // Име на потребителя.
        schedule, // График на заместванията.
        created_at: new Date().toISOString() // Дата и час на създаване на заявката.
    };

    // Подготвя SQL заявка за записване на заявката в таблицата `requests`.
    const stmt = conn.prepareStatement('INSERT INTO requests (id, workspace_id, status, content) VALUES (?, ?, "pending", ?)');
    stmt.setString(1, Utilities.getUuid()); // Генерира уникален ID за заявката.
    stmt.setString(2, user.workspace_id); // Задава workspace_id.
    stmt.setString(3, JSON.stringify(content)); // Задава съдържанието на заявката като JSON.
    stmt.executeUpdate(); // Изпълнява заявката.
}

/**
 * Одобрява заявка за заместване.
 * Генерира декларация, актуализира таблицата `substitute` и изпраща нотификация.
 * @param request - Обект с информация за заявката.
 * @param templateUrl - URL на шаблона за декларацията.
 */
function processSubstituteRequestApproval(request: any, templateUrl: string) {
    const conn = getConnection_(); // Взима връзка към базата данни.
    const user = getCurrentUser_(); // Взима текущия потребител.
    const substituteKey = settings.substitute_key; // Взима substitute_key.
    const grouped: Record<string, { day: string, absent: any, entries: SubstitutionEntry[] }> = {}; // Групира заявки по ден и отсъстващ учител.
    // Обхожда графика на заявката.
    for (const slot of request.schedule) {
        const absent = findAbsentTeacher_(slot.day, slot.hour, slot.shift, slot.group, substituteKey); // Намира отсъстващия учител.
        if (!absent) continue; // Пропуска, ако няма отсъстващ учител.

        const key = `${slot.day}-${absent.id}`; // Уникален ключ за групиране.
        if (!grouped[key]) grouped[key] = {
            day: slot.day,
            absent,
            entries: []
        };

        // Добавя информация за заместването.
        let newEntry = new SubstitutionEntry("", slot.hour, slot.group, slot.shift, slot.room, absent, {id: request.from_id, name: request.fromName, position: getUserById_(request.from_id).position});
        // newEntry.absentTeacher = absent;
        // newEntry.substitute = {
        //     id: request.from_id,
        //     name: request.fromName,
        //     position: getUserById_(request.from_id).position
        // }
        console.log('Slot', slot)
        console.log('newEntry', newEntry) // Взима новия запис за заместване.
        grouped[key].entries.push(newEntry); // Добавя новия запис в групата.
    }
    // Обработва всяка група.
    for (const key in grouped) {
        const { day, absent, entries } = grouped[key];

        // entries.forEach(e => {
        //     if (!e.absentTeacher) e.absentTeacher = absent; // Задава отсъстващия учител, ако липсва.
        // });

        addToSubstituteTable_(substituteKey, day, entries); // Актуализира таблицата `substitute`.

        // Генериране на декларация
        generateDeclarationDoc_(templateUrl, request.fromName, request.from_id, absent.name, day, entries);
    }

    // Нотификация
    createNotificationForUser_(request.from_id, "Заявката ти беше одобрена.", {
        type: "substitute-approved",
        from: `Одобрена от: ${user.names.split(" ").filter((_, i) => i != 1).join(" ")}`,
        schedule: request.schedule
    });

    // Маркираме заявката като одобрена
    const update = conn.prepareStatement("UPDATE requests SET status = 'approved' WHERE content LIKE ?");
    update.setString(1, `%${request.created_at}%`);
    update.executeUpdate();
}

/**
 * Намира отсъстващ учител за даден ден, час, смяна и група.
 * @param day - Ден от седмицата (например "monday").
 * @param hour - Час от разписанието.
 * @param shift - Смяна ("first" или "second").
 * @param group - Група (например "10A").
 * @param substituteKey - Ключ за таблицата `substitute`.
 * @returns Обект с информация за отсъстващия учител или null, ако не е намерен.
 */
function findAbsentTeacher_(day: string, hour: number, shift: string, group: string, substituteKey: string) {
    const conn = getConnection_(); // Взима връзка към базата данни.
    const stmt = conn.prepareStatement(`SELECT ${day} FROM substitute WHERE substitute_key = ?`); // Подготвя SQL заявка.
    stmt.setString(1, substituteKey); // Задава substitute_key като параметър.
    const rs = stmt.executeQuery(); // Изпълнява заявката.

    if (!rs.next()) return null; // Ако няма резултати, връща null.

    const raw = rs.getString(day);
    if (raw == '[]') return null; // Ако няма данни, връща null.

    const data: SubstitutionEntry[] = JSON.parse(raw); // Парсва JSON данните.
    console.log('data', data) // Взима масив от записи за заместванията.
    // Търси запис, който съвпада с деня, часа, смяната и групата.
    for (const entry of data) {
        if (
            entry.time == hour &&
            entry.shift === shift &&
            entry.group === group &&
            !entry.substitute // Само ако няма заместник.
        ) {
            return entry.absentTeacher; // очакваме структура { id, name, position }
        }
    }

    return null; // Ако няма съвпадение, връща null.
}

/**
 * Добавя или актуализира записи в таблицата `substitute` за даден ден.
 * @param conn - Връзка към базата данни.
 * @param substituteKey - Ключ за таблицата `substitute`.
 * @param day - Ден от седмицата (например "monday").
 * @param newEntries - Нови записи за добавяне или актуализиране.
 */
function addToSubstituteTable_(substituteKey: string, day: string, newEntries: SubstitutionEntry[]) {
    const conn = getConnection_(); // Взима връзка към базата данни.
    const select = conn.prepareStatement(`SELECT ${day} FROM substitute WHERE substitute_key = ?`); // Подготвя SQL заявка за извличане на данните за деня.
    select.setString(1, substituteKey); // Задава substituteKey като параметър.
    const rs = select.executeQuery(); // Изпълнява заявката.

    let current: SubstitutionEntry[] = []; // Масив за съхранение на текущите записи.
    if (rs.next()) {
        const raw = rs.getString(day); // Взима JSON данните за деня.
        if (raw) current = JSON.parse(raw); // Парсва JSON данните, ако съществуват.
    }
    console.log('current', current) // Взима текущите записи.
    // Обхожда новите записи и ги добавя или актуализира.
    for (const newEntry of newEntries) {
        const index = current.findIndex(e =>
            e.time == newEntry.time &&
            e.shift == newEntry.shift &&
            e.group == newEntry.group
        );
        console.log('newEntry', newEntry) // Взима новия запис.
        console.log('index', index) // Взима индекса на съществуващия запис.
        if (index >= 0) {
            current[index].substitute = newEntry.substitute; // Актуализира съществуващ запис.
        } else {
            current.push(newEntry); // Добавя нов запис.
        }
    }

    // Подготвя SQL заявка за актуализиране на таблицата `substitute`.
    const update = conn.prepareStatement(`UPDATE substitute SET ${day} = ? WHERE substitute_key = ?`);
    update.setString(1, JSON.stringify(current)); // Задава актуализираните данни като JSON.
    update.setString(2, substituteKey); // Задава substituteKey.
    update.executeUpdate(); // Изпълнява заявката.
}

/**
 * Връща данни за страницата за замествания за администратор.
 * Включва настройки, дати за седмицата, потребители и таблица за замествания.
 * @returns Обект с данни за страницата.
 */
function getSubstitutePageDataForAdmin() {
    return {
        settings: settings, // Взима настройките на системата.
        weekDates: getCurrentWeekDates(), // Взима датите за текущата седмица.
        users: getAllUsersWithSchedule_(), // Взима всички потребители с разписания.
        grid: getSubstitutionGridForWeek() // Взима данните за заместванията за текущата седмица.
    };
}

/**
 * Връща данни за страницата за замествания за учител.
 * Включва настройки, разписание на текущия потребител, дати за седмицата и таблица за замествания.
 * @returns Обект с данни за страницата.
 */
function getSubstitutePageDataForTeacher() {
    return {
        settings: settings, // Взима настройките на системата.
        timetable: getCurrentUser_().timetable || [], // Взима разписанието на текущия потребител или празен масив, ако няма разписание.
        weekDates: getCurrentWeekDates(), // Взима датите за текущата седмица.
        grid: getSubstitutionGridForWeek() // Взима данните за заместванията за текущата седмица.
    };
}