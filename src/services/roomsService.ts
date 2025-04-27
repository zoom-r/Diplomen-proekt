/**
 * Връща мрежа с използването на стаите за текущата седмица.
 * Извлича разписанията на потребителите и групира данните по дни, смени и стаи.
 * @returns Обект с мрежата за използване на стаите и настройките.
 */
function getRoomUsageGrid(): any {
    const user = getCurrentUser_(); // Взима текущия потребител.
    const settings = getSettings(); // Взима настройките на системата.
    const conn = getConnection_(); // Взима връзка към базата данни.

    // Подготвя SQL заявка за извличане на разписанията на потребителите.
    const stmt = conn.prepareStatement("SELECT timetable FROM users WHERE workspace_id = ? AND timetable IS NOT NULL AND timetable != '[]'");
    stmt.setString(1, user.workspace_id); // Задава workspace_id като параметър.
    const rs = stmt.executeQuery(); // Изпълнява заявката.

    // Инициализира обект за съхранение на данните за използването на стаите.
    const result: any = {
        monday: { first: {}, second: {} },
        tuesday: { first: {}, second: {} },
        wednesday: { first: {}, second: {} },
        thursday: { first: {}, second: {} },
        friday: { first: {}, second: {} }
    };

    const rooms = settings.rooms; // Взима списъка със стаи от настройките.
    const shifts = settings.shift === "second" ? ["first", "second"] : ["first"]; // Определя смените (една или две).

    // Обхожда резултатите от заявката.
    while (rs.next()) {
        const timetable: ClassEntry[] = JSON.parse(rs.getString("timetable")); // Парсва разписанието на потребителя.
        timetable.forEach((entry) => {
            const { day, time, shift, room, group } = entry; // Извлича данните за деня, часа, смяната, стаята и групата.
            if (!result[day] || !result[day][shift]) return; // Пропуска, ако денят или смяната не са валидни.
            if (!result[day][shift][room]) result[day][shift][room] = []; // Инициализира масив за стаята, ако не съществува.
            result[day][shift][room].push({ time, group }); // Добавя данните за часа и групата в стаята.
        });
    }

    // Добавя празни стаи, ако няма данни за тях.
    for (const day of Object.keys(result)) {
        for (const shift of shifts) {
            rooms.forEach(room => {
                if (!result[day][shift][room]) result[day][shift][room] = []; // Инициализира празен масив за стаята.
            });
        }
    }

    return { grid: result, settings }; // Връща мрежата за използване на стаите и настройките.
}