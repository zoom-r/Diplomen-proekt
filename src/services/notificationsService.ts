/**
 * Връща всички заявки за заместване за администратор.
 * Извлича заявки със статус "pending" от базата данни.
 * @returns Масив от заявки за заместване.
 */
function getSubstituteRequestsForAdmin_() {
    const conn = getConnection_(); // Взима връзка към базата данни.
    const user = getCurrentUser_(); // Взима текущия потребител.
    console.log(1)
    if (user.role != 'admin') return []; // Ако потребителят не е администратор, връща празен масив.
    console.log(2)
    // Подготвя SQL заявка за извличане на заявки със статус "pending".
    const stmt = conn.prepareStatement(`SELECT content FROM requests WHERE workspace_id = ? AND status = 'pending'`);
    stmt.setString(1, user.workspace_id); // Задава workspace_id като параметър.
    const rs = stmt.executeQuery(); // Изпълнява заявката.

    const result = []; // Масив за съхранение на резултатите.

    while (rs.next()) {
        console.log("in")
        try {
            const content = JSON.parse(rs.getString('content')); // Парсва JSON съдържанието на заявката.
            result.push(content); // Добавя заявката в резултатите.
        } catch (e) {
            Logger.log("Грешка при парсване на заявка: " + e); // Логва грешка при парсване.
        }
    }
    console.log(3)
    console.log("result: ", result)
    return result; // Връща масив от заявки.
}

/**
 * Създава нотификация за потребител.
 * Записва нотификацията в базата данни.
 * @param userId - ID на потребителя, за когото е нотификацията.
 * @param message - Съобщение за нотификацията.
 * @param options - Допълнителни опции за нотификацията (тип, източник, график и т.н.).
 */
function createNotificationForUser_(userId: string, message: string, options?: Partial<any>) {
    const conn = getConnection_(); // Взима връзка към базата данни.
    const user = getUserById_(userId); // Взима информация за потребителя по неговото ID.
    if (!user) return; // Ако потребителят не съществува, прекратява изпълнението.

    // Създава обект за нотификацията.
    const notification = {
        id: Utilities.getUuid(), // Генерира уникално ID за нотификацията.
        type: options?.type || "info", // Тип на нотификацията (по подразбиране "info").
        text: message, // Текст на нотификацията.
        from: options?.from || null, // Източник на нотификацията (ако е зададен).
        schedule: options?.schedule || [], // График, свързан с нотификацията (ако е зададен).
        timestamp: new Date().toISOString() // Време на създаване на нотификацията.
    };

    // Подготвя SQL заявка за записване на нотификацията в базата данни.
    const stmt = conn.prepareStatement(
        "INSERT INTO notifications (id, notifications_key, content) VALUES (?, ?, ?)"
    );
    stmt.setString(1, notification.id); // Задава ID на нотификацията.
    stmt.setString(2, user.notifications_key); // Задава ключа за нотификациите на потребителя.
    stmt.setString(3, JSON.stringify(notification)); // Задава съдържанието на нотификацията като JSON.
    stmt.executeUpdate(); // Изпълнява заявката.
}

/**
 * Връща всички нотификации за текущия потребител.
 * Ако потребителят е администратор, връща заявките за заместване.
 * @returns Масив от нотификации.
 */
function getUserNotifications_(): any[] {
    const user = getCurrentUser_(); // Взима текущия потребител.
    if (user.role == "admin") return getSubstituteRequestsForAdmin_(); // Ако потребителят е администратор, връща заявките за заместване.

    const conn = getConnection_(); // Взима връзка към базата данни.
    const stmt = conn.prepareStatement('SELECT content FROM notifications WHERE notifications_key = ?'); // Подготвя SQL заявка за извличане на нотификациите.
    stmt.setString(1, user.notifications_key); // Задава ключа за нотификациите на потребителя.
    const rs = stmt.executeQuery(); // Изпълнява заявката.

    const result: any[] = []; // Масив за съхранение на резултатите.
    while (rs.next()) {
        console.log("in")
        try {
            result.push(JSON.parse(rs.getString("content"))); // Парсва JSON съдържанието на нотификацията и го добавя в резултатите.
        } catch (_) {
            // Игнорира грешки при парсване.
        }
    }
    return result; // Връща масив от нотификации.
}

/**
 * Изтрива нотификация от базата данни.
 * @param id - ID на нотификацията.
 */
function deleteNotification(id: string) {
    const conn = getConnection_(); // Взима връзка към базата данни.

    // Подготвя SQL заявка за изтриване на нотификацията.
    const stmt = conn.prepareStatement('DELETE FROM notifications WHERE id = ?');
    stmt.setString(1, id); // Задава ID на нотификацията.
    stmt.executeUpdate(); // Изпълнява заявката.
}

/**
 * Отказва заявка за заместване.
 * Създава нотификация за отказаната заявка и актуализира статуса ѝ в базата данни.
 * @param request - Обект с информация за заявката.
 */
function declineSubstituteRequest(request: any) {
    const conn = getConnection_(); // Взима връзка към базата данни.
    const user = getCurrentUser_(); // Взима текущия потребител.

    // Създава нотификация за отказаната заявка.
    createNotificationForUser_(request.from_id, "Заявката ти беше отказана.", {
        type: "substitute-declined", // Тип на нотификацията.
        from: `Отказана от: ${user.names.split(" ").filter((_, i) => i != 1).join(" ")}`, // Източник на нотификацията.
        schedule: request.schedule // График, свързан със заявката.
    });

    // Подготвя SQL заявка за актуализиране на статуса на заявката.
    const update = conn.prepareStatement(`UPDATE requests SET status = 'declined' WHERE content LIKE ?`);
    update.setString(1, `%${request.created_at}%`); // Търси заявката по дата на създаване.
    update.executeUpdate(); // Изпълнява заявката.
}

/**
 * Връща нотификациите и настройките за текущия потребител.
 * @returns Обект с нотификациите и настройките.
 */
function getNotificationsAndSettings() {
    console.log(getUserNotifications_())
    return {
        notifications: getUserNotifications_(), // Взима нотификациите за текущия потребител.
        settings: getSettings() // Взима настройките на системата.
    };
}