/*
*   Библиотеката ObjectStore за Apps Scripr ни позволява да запазваме нужната информация в 
*   локалното хранилище и PropertiesService. Така можем да я използваме без постоянно да отваряме
*   нови връзки с базата данни.
*/

// @ts-ignore
const userStore = ObjectStore.create('user', {manual: true});

/**
 * Проверява дали всички потребители (освен текушия) са запазени в локалното хранилище и са актуални - ако не са, ги актуализира.
 * @returns {boolean} - Връща true, ако операцията е успешна, в противен случай - false.
 */
function checkAllOtherUsersInfo_(): boolean {
    const conn = createDBConnection_();
    if (!conn) return false;
    let success = false;
    try {
        const stmt = conn.prepareStatement('SELECT id, email, names, phone, role, position FROM users');
        const rs = stmt.executeQuery();
        let users: Record<string, User> = userStore.get('users');
        if (!users) {
            userStore.set('users', {});
            users = userStore.get('users');
        }
        while (rs.next()) {
            if (rs.getString('id') == userStore.get('user').id) continue;
            const user = User.createFromResultSet(rs);
            if (!users[user.id] || !users[user.id].equals(user)) {
                users[user.id] = user;
                userStore.set('users', users);
            }
        }
        success = true;
        userStore.persist();
    } catch (e) {
        console.log('Error getting all users from DB: ' + e.message);
    } finally {
        conn.close();
        return success;
    }
}

/**
 * Проверява дали текущия потребител е запазен в локалното хранилище и е актуален - ако не е, го актуализира.
 * @returns {boolean} - Връща true, ако операцията е успешна, в противен случай - false.
 */
function checkCurrentUserInfo_(): boolean {
    const conn = createDBConnection_();
    if (!conn) return false;
    let success = false;
    try {
        let user: User = userStore.get('user');
        if (!user) {
            const stmt = conn.prepareStatement('SELECT * FROM users WHERE email = ?');
            stmt.setString(1, getUserEmail_());
            const rs = stmt.executeQuery();
            if (rs.next()) {
                user = User.createFromResultSet(rs);
                userStore.set('user', user);
                success = true;
                userStore.persist();
            }
        } else {
            const stmt = conn.prepareStatement('SELECT * FROM users WHERE email = ?'); // Използва проверка с email, защото потребителят може да бъде изтрит и добавен отново (тогава id-то ще е различно, но email-ът - същият)
            stmt.setString(1, user.email);
            const rs = stmt.executeQuery();
            if (rs.next()) {
                const newUser = User.createFromResultSet(rs);
                if (!user.equals(newUser)) {
                    userStore.set('user', newUser);
                    userStore.persist();
                }
            }
        }
        success = true;
    } catch (e) {
        console.log('Error trying to get user info: ' + e.message);
    } finally {
        conn.close();
        return success;
    }
}

/**
 * Връща текущия потребител от локалното хранилище.
 * @returns {User} - Текущият потребител.
 */
function getCurrentUser_(): User {
    return userStore.get('user');
}

/**
 * Връща всички потребители от локалното хранилище.
 * @returns {Record<string, User>} - Всички потребители.
 */
function getUsers_(): Record<string, User> {
    return userStore.get('users');
}

/**
 * Връща потребител по дадено ID от локалното хранилище.
 * @param {string} id - ID на потребителя.
 * @returns {User | null} - Потребителят или null, ако не е намерен.
 */
function getUserById_(id: string): User | null {
    return getUsers_()[id];
}

/**
 * Актуализира информацията за текущия потребител в локалното хранилище.
 * @param {User} user - Потребителят, който ще бъде актуализиран.
 */
function updateUserInUserStore_(user: User): void {
    userStore.set('user', user);
    userStore.persist();
}

/**
 * Създава нов потребител в локалното хранилище.
 * @param {User} user - Потребителят, който ще бъде създаден.
 */
function createUserInUserStore_(user: User): void {
    const users = getUsers_();
    users[user.id] = user;
    userStore.set('users', users);
    userStore.persist();
}

/**
 * Изтрива потребител от локалното хранилище по дадено ID.
 * @param {string} id - ID на потребителя, който ще бъде изтрит.
 */
function deleteUserFromUserStore_(id: string): void {
    const users = getUsers_();
    delete users[id];
    userStore.set('users', users);
    userStore.persist();
}