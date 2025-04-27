// @ts-ignore
// const userStore = ObjectStore.create('user', { manual: true });
/**
 * Проверява дали текущия потребител съществува, дали е запазен в Propeties и дали е актуален - ако не е, го актуализира.
 * @returns {boolean} Връща true, ако операцията е успешна, в противен случай - false.
 * @throws {Error} Ако възникне грешка при работа с базата данни.
 */
function checkCurrentUser_(): boolean {
    const conn = getConnection_();
    let success = false;
    try {
        const userData = userStore.get('user');
        let user;
        if (!userData) {
            user = null;
        } else {
            user = new User(userData.id, userData.email, userData.names, userData.phone, userData.role, userData.position, userData.timetable, userData.workspace_id, userData.notifications_key, userData.declarations_key);
        }
        const stmt = conn.prepareStatement('SELECT * FROM users WHERE email = ?'); // Използва проверка с email, защото потребителят може да бъде изтрит и добавен отново (тогава id-то ще е различно, но email-ът - същият)
        if (!user) {
            stmt.setString(1, getUserEmail_());
            const rs = stmt.executeQuery();
            if (rs.next()) {
                user = User.createFromResultSet(rs);
                console.log('User from DB:', user);
                userStore.set('user', user);
                success = true;
                userStore.persist(false);
            }
        } else {
            stmt.setString(1, getUserEmail_());
            const rs = stmt.executeQuery();
            if (rs.next()) {
                const newUser = User.createFromResultSet(rs);
                if (!_.isEqual(user, newUser)) {
                    userStore.set('user', newUser);
                    userStore.persist(false);
                }
                success = true;
            }
        }
        closeConnection_();
        return success;
    }
    catch (e) {
        throw new Error('Error while checking current user: ' + e.message);
    }
}

/**
 * Връща текущия потребител.
 * @returns {User} Текущият потребител.
 */
function getCurrentUser_(): User {
    const data = userStore.get('user');
    return new User(data.id, data.email, data.names, data.phone, data.role, data.position, data.timetable, data.workspace_id, data.notifications_key, data.declarations_key);
}

/**
 * userObj идва от фронтенда и съдържа:
 * {
 *   email, firstName, middleName, lastName,
 *   phone, position, role, timetable: Timetable
 * }
 */
function createUser(userObj: User): boolean {
    const wsId = getCurrentUser_().workspace_id;

    // Валидация за конфликт
    if (userObj.timetable) {
        userObj.timetable.forEach(t => {
            if (!isTimeSlotFree_(wsId, t.day, t.time, t.shift, t.group, t.room)) {
                throw new Error(`Конфликт – ${t.day} ${t.time}ч., смяна ${t.shift == 'second' ? 'втора' : 'първа'}`);
            }
        });
    }

    const conn = getConnection_();
    const st = conn.prepareStatement(`
      INSERT INTO users(id,email,names,phone,role,position,timetable,workspace_id,declarations_key,notifications_key)
      VALUES(?,?,?,?,?,?,?,?,?,?)
    `);
    st.setString(1, Utilities.getUuid());
    st.setString(2, userObj.email);
    st.setString(3, userObj.names);
    st.setString(4, userObj.phone);
    st.setString(5, userObj.role);
    st.setString(6, userObj.position);
    st.setString(7, JSON.stringify(userObj.timetable || []));
    st.setString(8, wsId);
    st.setString(9, Utilities.getUuid());
    st.setString(10, Utilities.getUuid());

    const rowsAffected = st.executeUpdate(); // Returns the number of affected rows -> if 0, no new row was added
    closeConnection_();
    if (rowsAffected > 0) {
        return true;
    } else {
        return false;
    }
}

/**
 * Изтрива потребителя от базата данни.
 * @param {string} id ID на потребителя, който ще бъде изтрит.
 * @returns {boolean} Връща true, ако потребителят е изтрит успешно, в противен случай - false.
 * @throws {Error} Ако възникне грешка при работа с базата данни.
 */
function deleteUser(id: string): boolean {
    const conn = getConnection_();
    let success = false;
    try {
        let affectedRows;

        const stmtDeleteUser = conn.prepareStatement('DELETE FROM users WHERE id = ?');
        stmtDeleteUser.setString(1, id);
        affectedRows = stmtDeleteUser.executeUpdate();

        if (affectedRows > 0) success = true;

        closeConnection_();
        return success;
    } catch (e) {
        throw new Error('Error during database query for deleting a user: ' + e.message);
    }
}

/**
 * Взима профилната снимка на потребителя. 
 * Ако не съществува такава или се изхвърли грешка, връща стандартна снимка.
 * @returns {string} URL на профилната снимка на потребителя или стандартна снимка.
 */
function getUserPictureUrl(): string {
    const defaultPictureUrl = 'https://lh3.googleusercontent.com/a-/AOh14Gj-cdUSUVoEge7rD5a063tQkyTDT3mripEuDZ0v=s100';
    let userPictureUrl: string = null;
    try {
        const people = People.People.searchDirectoryPeople({
            query: getUserEmail_(),
            readMask: 'photos',
            sources: 'DIRECTORY_SOURCE_TYPE_DOMAIN_PROFILE'
        });
        userPictureUrl = people?.people[0]?.photos[0]?.url;
    } catch (e) {
        console.error('Error trying to get user picture: ' + e.message);
    } finally {
        return userPictureUrl ?? defaultPictureUrl;
    }
}

/**
 * Взима потребителя по ID.
 * @param {string} id ID на потребителя.
 * @returns {User} Връща потребителя.
 * @throws {Error} Ако възникне грешка при работа с базата данни.
 * @description Трябва да се извика closeConnection_ след като се приключи работа. 
 */
function getUserById_(id: string): User {
    const conn = getConnection_();
    try {
        const stmt = conn.prepareStatement('SELECT * FROM users WHERE id = ?');
        stmt.setString(1, id);
        const rs = stmt.executeQuery();
        let user = null;
        if (rs.next()) {
            user = User.createFromResultSet(rs);
        }
        return user;
    } catch (e) {
        throw new Error('Error during database query for getting a user by ID: ' + e.message);
    }
}

/**
 * Взима имейла на текущия потребител.
 * @returns {string} Имейлът на потребителя.
 * @throws {Error} Ако не е намерен имейл на потребителя.
 */
function getUserEmail_(): string {
    const email = Session.getActiveUser().getEmail();
    if (!email) {
        throw new Error('Error getting user email');
    }
    return email;
}

/**
 * Връща всички потребители от базата данни заедно с техните разписания.
 * @returns {User[]} Масив от потребители.
 * @throws {Error} Ако възникне грешка при работа с базата данни.
 */
function getAllUsers(): User[] {
    const conn = getConnection_();
    const users: User[] = [];
    try {
        const stmt = conn.prepareStatement('SELECT * FROM users WHERE workspace_id = ?');
        stmt.setString(1, getCurrentUser_().workspace_id);
        const rs = stmt.executeQuery();

        while (rs.next()) {
            const user = User.createFromResultSet(rs);
            users.push(user);
        }

        closeConnection_();
        return users;
    } catch (e) {
        throw new Error('Error during database query for getting all users: ' + e.message);
    }
}

function isTimeSlotFree_(wsId: string,
    day: string,
    time: number,
    shift: string,
    clazz: string,
    room: string): boolean {
    const sql = 'SELECT timetable FROM users WHERE workspace_id = ?';
    const st = getConnection_().prepareStatement(sql);
    st.setString(1, wsId);
    const rs = st.executeQuery();
    while (rs.next()) {
        const tt: ClassEntry[] = JSON.parse(rs.getString('timetable') || '[]');
        if (!tt || tt.length === 0) continue; // Няма разписание
        tt.forEach(entry => {
            if (entry.day == day){
                if (entry.time === time &&
                entry.shift === shift &&
                (entry.group === clazz || entry.room === room)) {
                    return false;   // конфликт
                }
            }
        });
    }
    return true;
}

/**
 * Връща обект със заетите класове и стаи за всеки ден/час/смяна.
 * Формат:
 * {
 *   "monday-1-first": { groups: ["12A"], rooms: ["305"] },
 *   ...
 * }
 */
function getUsedSlotsForAll_() {
    const sql = 'SELECT timetable FROM users WHERE timetable IS NOT NULL AND timetable != "[]"';
    const rs = getConnection_().prepareStatement(sql).executeQuery();

    const map = {};

    while (rs.next()) {
        const timetable: ClassEntry[] = JSON.parse(rs.getString('timetable') || '[]');

        timetable.forEach(entry => {
            const key = `${entry.day}-${entry.time}-${entry.shift}`;
            if (!map[key]) {
                map[key] = { groups: [], rooms: [] };
            }
            if (entry.group) map[key].groups.push(entry.group);
            if (entry.room) map[key].rooms.push(entry.room);
        });
    }
    closeConnection_();
    return map;
}

function getSettingsAndUsedSlots() {
    const settings = getSettings();
    const usedSlots = getUsedSlotsForAll_();
    return { settings, usedSlots };
}

/**
* Връща всички потребители с разписание.
* @returns Масив от обекти с информация за потребителите и техните разписания.
*/
function getAllUsersWithSchedule_() {
    const conn = getConnection_(); // Взима връзка към базата данни.
    const wsId = getCurrentUser_().workspace_id; // Взима ID на работното пространство на текущия потребител.

    // Подготвя SQL заявка за извличане на потребители с разписание.
    const stmt = conn.prepareStatement('SELECT * FROM users WHERE workspace_id = ? AND timetable IS NOT NULL AND timetable != "[]"');
    stmt.setString(1, wsId); // Задава workspace_id като параметър.
    const rs = stmt.executeQuery(); // Изпълнява заявката.

    const result = []; // Масив за съхранение на резултатите.

    while (rs.next()) {
        const timetable = JSON.parse(rs.getString("timetable") || '[]'); // Парсва разписанието.
        if (timetable && timetable.length > 0) {
            // Добавя потребителя в резултатите.
            result.push(User.createFromResultSet(rs)); // Създава нов потребител от резултата и го добавя в масива.
        }
    }

    return result; // Връща масив от потребители с разписание.
}


