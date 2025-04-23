/**
 * Обрабтва GET заявката за страницата за замествания
 * @param req 
 * @param res 
 */
function getSubstitutePage_(req, res) {
    res.set('Content-Type', 'text/html');
    const role = getCurrentUser_().role;
    let html;
    if (role == 'admin') {
        html = HtmlService.createTemplateFromFile('public/html/admin/substitute');
        html.url = req.url;
    } else if (role == 'teacher') {
        html = HtmlService.createTemplateFromFile('public/html/teacher/substitute');
        html.url = req.url;
    }
    res.send(html.evaluate().setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL).getContent());
    res.end();
}

// Връща масив от дати (YYYY-MM-DD) за текущата седмица (понеделник – петък)
function getCurrentWeekDates(): string[] {
    const today = new Date();
    const day = today.getDay(); // 0 = неделя, 1 = понеделник, ..., 6 = събота

    // Изчисляваме понеделника от текущата седмица
    const monday = new Date(today);
    if (day === 0) {
        // Неделя → връщаме се 6 дни назад
        monday.setDate(today.getDate() - 6);
    } else {
        // Всеки друг ден → връщаме се с разлика до понеделник
        monday.setDate(today.getDate() - (day - 1));
    }

    const result: string[] = [];
    for (let i = 0; i < 5; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        result.push(d.toISOString().split('T')[0]);
    }

    return result;
}

// Връща всички замествания и отсъствия за текущата седмица,
// агрегирани по ден и час
function getSubstitutionGridForWeek() {
    const conn = getConnection_();
    const workspaceId = getCurrentUser_().workspace_id;

    // 1. Взимаме substitute_key от workspace
    const settings = getSettings(); // ти използваш getSettings()
    const substituteKey = settings.substitute_key;

    // 2. Взимаме всички записи от таблицата substitute по този ключ
    const stmt = conn.prepareStatement(`
      SELECT monday, tuesday, wednesday, thursday, friday
      FROM substitute
      WHERE substitute_key = ?
    `);
    stmt.setString(1, substituteKey);
    const rs = stmt.executeQuery();

    if (!rs.next()) return {};

    const grid = {};

    const days = ["monday", "tuesday", "wednesday", "thursday", "friday"];
    for (const day of days) {
        const weekDates = getCurrentWeekDates();
        const rawJson = rs.getString(day);
        if (!rawJson) continue;

        try {
            const entries = JSON.parse(rawJson);
            if (!Array.isArray(entries)) continue;
            for (const entry of entries) {
                if (!weekDates.includes(entry.date)) continue; // пропускаме дати извън текущата седмица
                if (!grid[day]) grid[day] = [];
                grid[day].push({
                    time: entry.time,
                    shift: entry.shift,
                    group: entry.group,
                    room: entry.room,
                    absentTeacher: entry.absentTeacher,
                    substitute: entry.substitute || null
                });
            }

        } catch (e) {
            Logger.log(`Грешка при JSON парсване за ${day}: ` + e);
        }
    }

    return grid;
}

function getDateForWeekday(day: string): string {
    const map = {
        monday: 1,
        tuesday: 2,
        wednesday: 3,
        thursday: 4,
        friday: 5,
    };
    const today = new Date();
    const monday = new Date(today);
    const dayIndex = map[day];
    const currentWeekday = today.getDay() || 7; // ако е неделя, става 7
    monday.setDate(today.getDate() - currentWeekday + 1); // връща понеделник

    const result = new Date(monday);
    result.setDate(monday.getDate() + dayIndex - 1); // добавяме разликата

    return Utilities.formatDate(result, Session.getScriptTimeZone(), "yyyy-MM-dd");
}

// Връща всички потребители с разписание
function getAllUsersWithSchedule() {
    const conn = getConnection_();
    const wsId = getCurrentUser_().workspace_id;
    const stmt = conn.prepareStatement(`
      SELECT id, names, role, timetable FROM users
      WHERE workspace_id = ? AND timetable IS NOT NULL AND timetable != '[]'
    `);
    stmt.setString(1, wsId);
    const rs = stmt.executeQuery();

    const result = [];
    while (rs.next()) {
        const timetable = JSON.parse(rs.getString("timetable") || '[]');
        if (timetable && timetable.length > 0) {
            result.push({
                id: rs.getString("id"),
                names: rs.getString("names"),
                role: rs.getString("role"),
                timetable
            });
        }
    }
    return result;
}

// Създава записи в substitute таблицата за избран потребител и период
function createAbsentSubstitution(userId: string, fromDate: string, toDate: string) {
    const conn = getConnection_();
    const wsId = getCurrentUser_().workspace_id;
    const settings = getSettings();
    const substituteKey = settings.substitute_key;

    const stmt = conn.prepareStatement(`SELECT timetable, names, position FROM users WHERE id = ?`);
    stmt.setString(1, userId);
    const rs = stmt.executeQuery();
    if (!rs.next()) return;

    const timetable = JSON.parse(rs.getString("timetable") || '[]');
    const name = rs.getString("names");
    const position = rs.getString("position");

    const substituteData = {
        monday: [], tuesday: [], wednesday: [], thursday: [], friday: []
    };

    const dateMap = getDateDayMap(fromDate, toDate);

    for (const [date, day] of Object.entries(dateMap)) {
        if (!substituteData[day]) continue;
        timetable.forEach(c => {
            if (c.day === day) {
                substituteData[day].push({
                    date,
                    time: c.time,
                    shift: c.shift,
                    group: c.group,
                    room: c.room,
                    absentTeacher: { id: userId, name, position },
                    substitute: null
                });
            }
        });
    }

    const up = conn.prepareStatement(`UPDATE substitute SET monday=?, tuesday=?, wednesday=?, thursday=?, friday=? WHERE substitute_key = ?`);
    up.setString(1, JSON.stringify(substituteData.monday));
    up.setString(2, JSON.stringify(substituteData.tuesday));
    up.setString(3, JSON.stringify(substituteData.wednesday));
    up.setString(4, JSON.stringify(substituteData.thursday));
    up.setString(5, JSON.stringify(substituteData.friday));
    up.setString(6, substituteKey);
    up.executeUpdate();
}

// Връща обект { "2024-04-23": "tuesday", ... } за всички дати в диапазона
function getDateDayMap(from: string, to: string): Record<string, string> {
    const result = {};
    const start = new Date(from);
    const end = new Date(to);

    while (start <= end) {
        const iso = Utilities.formatDate(start, Session.getScriptTimeZone(), 'yyyy-MM-dd');
        const day = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][start.getDay()];
        if (['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(day)) {
            result[iso] = day;
        }
        start.setDate(start.getDate() + 1);
    }
    return result;
}

function removeAbsent(userId: string, day: string) {
    const conn = getConnection_();
    const settings = getSettings();
    const key = settings._substitute_key;

    const stmt = conn.prepareStatement(`SELECT ${day} FROM substitute WHERE substitute_key = ?`);
    stmt.setString(1, key);
    const rs = stmt.executeQuery();

    if (!rs.next()) return;

    const json = JSON.parse(rs.getString(day) || '[]');
    const filtered = json.filter(entry => entry.absentTeacher?.id !== userId);

    const update = conn.prepareStatement(`UPDATE substitute SET ${day} = ? WHERE substitute_key = ?`);
    update.setString(1, JSON.stringify(filtered));
    update.setString(2, key);
    update.executeUpdate();
}

function removeAbsentFromWeek(userId: string) {
    const conn = getConnection_();
    const settings = getSettings();
    const key = settings.substitute_key;

    const days = ["monday", "tuesday", "wednesday", "thursday", "friday"];
    const selectStmt = conn.prepareStatement(`SELECT ${days.join(', ')} FROM substitute WHERE substitute_key = ?`);
    selectStmt.setString(1, key);
    const rs = selectStmt.executeQuery();
    if (!rs.next()) return;

    const data = {};
    for (const day of days) {
        const raw = rs.getString(day);
        const entries = raw ? JSON.parse(raw) : [];
        data[day] = entries.filter(e => e.absentTeacher?.id !== userId);
    }

    const updateStmt = conn.prepareStatement(
        `UPDATE substitute SET monday=?, tuesday=?, wednesday=?, thursday=?, friday=? WHERE substitute_key = ?`
    );
    days.forEach((day, i) => updateStmt.setString(i + 1, JSON.stringify(data[day])));
    updateStmt.setString(6, key);
    updateStmt.executeUpdate();
}

// // Записва заявка за заместване от учител в таблицата notifications
// function sendSubstituteRequest(day: string, hour: number, shift: string, group: string) {
//     const conn = getConnection_();
//     const user = getCurrentUser_();
//     const requestId = Utilities.getUuid();

//     const content = {
//         type: 'substitute-request',
//         from_id: user.id,
//         fromName: user.names,
//         day,
//         hour,
//         shift,
//         group,
//         created_at: new Date().toISOString()
//     };
//     console.log("workspaceID: ", user.workspace_id)
//     const stmt = conn.prepareStatement(`
//       INSERT INTO requests (id, workspace_id, status, content)
//       VALUES (?, ?, 'pending', ?)
//     `);
//     stmt.setString(1, requestId);
//     stmt.setString(2, user.workspace_id);
//     stmt.setString(3, JSON.stringify(content));
//     stmt.executeUpdate();
// }

function getSubstituteRequestsForAdmin() {
    const conn = getConnection_();
    const user = getCurrentUser_();

    if (user.role !== 'admin') return [];

    const stmt = conn.prepareStatement(`
      SELECT content
      FROM requests
      WHERE workspace_id = ? AND status = 'pending'
    `);
    stmt.setString(1, user.workspace_id);
    const rs = stmt.executeQuery();

    const result = [];

    while (rs.next()) {
        try {
            const content = JSON.parse(rs.getString('content'));
            result.push(content);
        } catch (e) {
            Logger.log("Грешка при парсване на заявка: " + e);
        }
    }

    return result;
}

function sendGroupedSubstituteRequest(schedule: any[]) {
    const conn = getConnection_();
    const user = getCurrentUser_();

    const content = {
        type: 'substitute-request',
        from_id: user.id,
        fromName: user.names,
        schedule,
        created_at: new Date().toISOString()
    };

    const stmt = conn.prepareStatement(`
      INSERT INTO requests (id, workspace_id, status, content)
      VALUES (?, ?, 'pending', ?)
    `);
    stmt.setString(1, Utilities.getUuid());
    stmt.setString(2, user.workspace_id);
    stmt.setString(3, JSON.stringify(content));
    stmt.executeUpdate();
}

function processSubstituteRequestApproval(request: any, templateUrl: string) {
    const conn = getConnection_();
    const user = getCurrentUser_();
    const settings = getSettings();
    const substituteKey = settings.substitute_key;

    const grouped: Record<string, { day: string, absent: any, entries: any[] }> = {};

    for (const slot of request.schedule) {
        const absent = findAbsentTeacher(slot.day, slot.hour, slot.shift, slot.group, substituteKey);
        if (!absent) continue;

        const key = `${slot.day}-${absent.id}`;
        if (!grouped[key]) grouped[key] = {
            day: slot.day,
            absent,
            entries: []
        };

        grouped[key].entries.push({
            time: slot.hour,
            shift: slot.shift,
            group: slot.group,
            room: absent.room,
            date: slot.date,
            absentTeacher: absent,
            substitute: {
                id: request.from_id,
                name: request.fromName,
                position: getUserById_(request.from_id).position
            }
        });
    }

    for (const key in grouped) {
        const { day, absent, entries } = grouped[key];

        entries.forEach(e => {
            if (!e.absentTeacher) e.absentTeacher = absent;
        });

        addToSubstituteTable(conn, substituteKey, day, entries);

        // 1. Генериране на декларация
        const { docId, url, title, date } = generateDeclarationDoc(templateUrl, request.fromName, absent.name, day, entries);
        const declarationContent = {
            doc_id: docId,
            url,
            title,
            date,
            submitted: false
        }; 
        // 2. Запис в таблицата declarations
        const stmt = conn.prepareStatement("INSERT INTO declarations (id, workspace_id, substitute_id, content) VALUES (?, ?, ?, ?)");
        stmt.setString(1, Utilities.getUuid());
        stmt.setString(2, user.workspace_id);
        stmt.setString(3, request.from_id);
        stmt.setString(4, JSON.stringify(declarationContent));
        stmt.executeUpdate();

        // 3. Споделяне с учителя
        const teacher = getUserById_(request.from_id);
        if (teacher?.email) {
            DriveApp.getFileById(docId).addEditor(teacher.email);
        }
    }

    // 4. Нотификация
    createNotificationForUser(request.from_id, "Заявката ти беше одобрена.", {
        type: "substitute-approved",
        from: `Одобрена от: ${user.names.split(" ").filter((_, i) => i != 1).join(" ")}`,
        schedule: request.schedule
      });
      
    // 5. Маркираме заявката като одобрена
    const update = conn.prepareStatement("UPDATE requests SET status = 'approved' WHERE content LIKE ?");
    update.setString(1, `%${request.created_at}%`);
    update.executeUpdate();
}

function createNotificationForUser(userId: string, message: string, options?: Partial<any>) {
    const conn = getConnection_();
    const user = getUserById_(userId);
    if (!user) return;
  
    const notification = {
      id: Utilities.getUuid(),
      type: options?.type || "info",
      text: message,
      from: options?.from || null,
      schedule: options?.schedule || [],
      timestamp: new Date().toISOString()
    };
  
    const stmt = conn.prepareStatement(
      "INSERT INTO notifications (id, notifications_key, content) VALUES (?, ?, ?)"
    );
    stmt.setString(1, notification.id);
    stmt.setString(2, user.notifications_key);
    stmt.setString(3, JSON.stringify(notification));
    stmt.executeUpdate();
  }
  


function findAbsentTeacher(day: string, hour: number, shift: string, group: string, substituteKey: string) {
    const conn = getConnection_();
    const stmt = conn.prepareStatement(`SELECT ${day} FROM substitute WHERE substitute_key = ?`);
    stmt.setString(1, substituteKey);
    const rs = stmt.executeQuery();

    if (!rs.next()) return null;

    const raw = rs.getString(day);
    if (!raw) return null;

    const data = JSON.parse(raw);

    for (const entry of data) {
        if (
            entry.time == hour &&
            entry.shift === shift &&
            entry.group === group &&
            !entry.substitute // само ако още няма заместник
        ) {
            return entry.absentTeacher; // очакваме структура { id, name, position }
        }
    }

    return null;
}

function getOrCreateDateFolder(templateId: string, dateStr: string): GoogleAppsScript.Drive.Folder {
    const templateFile = DriveApp.getFileById(templateId);
    const parentFolders = templateFile.getParents();

    if (!parentFolders.hasNext()) {
        throw new Error("Template file has no parent folder.");
    }

    const parentFolder = parentFolders.next();
    const existingFolders = parentFolder.getFoldersByName(dateStr);

    if (existingFolders.hasNext()) {
        return existingFolders.next();
    }

    return parentFolder.createFolder(dateStr);
}


function addToSubstituteTable(conn: GoogleAppsScript.JDBC.JdbcConnection, substituteKey: string, day: string, newEntries: any[]) {
    const select = conn.prepareStatement(`SELECT ${day} FROM substitute WHERE substitute_key = ?`);
    select.setString(1, substituteKey);
    const rs = select.executeQuery();

    let current = [];
    if (rs.next()) {
        const raw = rs.getString(day);
        if (raw) current = JSON.parse(raw);
    }

    for (const newEntry of newEntries) {
        const index = current.findIndex(e =>
            e.time == newEntry.time &&
            e.shift === newEntry.shift &&
            e.group === newEntry.group
        );

        if (index >= 0) {
            current[index].substitute = newEntry.substitute; // само подменяме
        } else {
            current.push(newEntry); // добавяме нов запис
        }
    }

    const update = conn.prepareStatement(`UPDATE substitute SET ${day} = ? WHERE substitute_key = ?`);
    update.setString(1, JSON.stringify(current));
    update.setString(2, substituteKey);
    update.executeUpdate();
}


function generateDeclarationDoc(templateUrl: string, substituteName: string, absentName: string, day: string, entries: any[]) {
    const fileId = extractFileIdFromUrl(templateUrl);
    const template = DriveApp.getFileById(fileId);

    const date = getDateForWeekday(day);
    const folder = getOrCreateFolderByDate(fileId, new Date(date));
    const copy = template.makeCopy(`Декларация - ${substituteName}`, folder);

    const doc = DocumentApp.openById(copy.getId());
    const body = doc.getBody();

    const currentUser = getCurrentUser_();
    const settings = getSettings();

    body.replaceText("{{names}}", substituteName);
    body.replaceText("{{absent}}", absentName);
    body.replaceText("{{position}}", currentUser.position || "");
    body.replaceText("{{names_admin}}", getCurrentUser_().names || "");
    body.replaceText("{{date}}", formatDateForDocument(new Date(date)));

    const tables = body.getTables();
    if (tables.length > 0) {
        const table = tables[0];
        const modelRow = table.getRow(1);

        // добави толкова редове, колкото са entries
        for (let i = 1; i < entries.length; i++) {
            table.appendTableRow(modelRow.copy());
        }

        entries.forEach((e, i) => {
            const row = table.getRow(i + 1);
            if (row.getNumCells() >= 3) {
                const subject = (e.substitute?.position === e.absentTeacher?.position) ? "" : "Гражданско образование";
                console.log(e.substitute?.position, e.absentTeacher?.position, subject)
                row.getCell(0).setText(String(e.time)); // час
                row.getCell(1).setText(subject);        // предмет
                row.getCell(2).setText(e.group);        // клас
                row.getCell(3).setText("1");            // брой часове
            }
        });
    }

    doc.saveAndClose();
    return {
        docId: copy.getId(),
        url: copy.getUrl(),
        title: `Декларация - ${substituteName} - ${formatDateForDocument(new Date(date))}`,
        date: formatDateForDocument(new Date(date))
    };
}

//   function getDateForWeekday(day: string): Date {
//     const today = new Date();
//     const dayMap = { monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5 };
//     const monday = new Date(today);
//     monday.setDate(today.getDate() - today.getDay() + 1);
//     const date = new Date(monday);
//     date.setDate(monday.getDate() + (dayMap[day] - 1));
//     return date;
//   }

function formatDateForDocument(date: Date): string {
    return Utilities.formatDate(date, Session.getScriptTimeZone(), "dd.MM.yyyy");
}

function getOrCreateFolderByDate(templateId: string, date: Date): GoogleAppsScript.Drive.Folder {
    const folderName = formatDateForDocument(date);

    const templateFile = DriveApp.getFileById(templateId);
    const parents = templateFile.getParents();

    if (!parents.hasNext()) throw new Error("Шаблонът няма родителска папка.");

    const parentFolder = parents.next();
    const folders = parentFolder.getFoldersByName(folderName);

    return folders.hasNext() ? folders.next() : parentFolder.createFolder(folderName);
}


function extractFileIdFromUrl(url: string): string {
    const match = url.match(/[-\w]{25,}/);
    return match ? match[0] : "";
}


function formatDateLabel(day: string): string {
    const map = {
        monday: "Понеделник",
        tuesday: "Вторник",
        wednesday: "Сряда",
        thursday: "Четвъртък",
        friday: "Петък"
    };
    return map[day] || day;
}

function getUserNotifications(): any[] {
    const user = getCurrentUser_();
    if (user.role == "admin") return getSubstituteRequestsForAdmin();
    const conn = getConnection_();
    const stmt = conn.prepareStatement("SELECT content FROM notifications WHERE notifications_key = ?");
    stmt.setString(1, user.notifications_key);
    const rs = stmt.executeQuery();
  
    const result: any[] = [];
    while (rs.next()) {
      try {
        result.push(JSON.parse(rs.getString("content")));
      } catch (_) {}
    }
    return result;
  }
  
  function deleteNotification(id: string) {
    const conn = getConnection_();
    const stmt = conn.prepareStatement("DELETE FROM notifications WHERE id = ?");
    stmt.setString(1, id);
    stmt.executeUpdate();
  }

  function declineSubstituteRequest(request: any) {
    const conn = getConnection_();
    const user = getCurrentUser_();
    createNotificationForUser(request.from_id, "Заявката ти беше отказана.", {
        type: "substitute-declined",
        from: `Отказана от: ${user.names.split(" ").filter((_, i) => i != 1).join(" ")}`,
        schedule: request.schedule
      });
    const update = conn.prepareStatement("UPDATE requests SET status = 'declined' WHERE content LIKE ?");
    update.setString(1, `%${request.created_at}%`);
    update.executeUpdate();
  }
  