/*
*   Библиотеката ObjectStore за Apps Script ни позволява да запазваме нужната информация в 
*   CacheService и PropertiesService. Така можем да я използваме без постоянно да отваряме
*   нови връзки с базата данни, за да използваме информация за текущия потребител.
*/
// @ts-ignore
const userStore = ObjectStore.create('user', {manual: true});
// @ts-ignore
const _ = LodashGS.load();

/**
 * Проверява дали текущия потребител съществува, дали е запазен в Propeties и дали е актуален - ако не е, го актуализира.
 * @returns {boolean} Връща true, ако операцията е успешна, в противен случай - false.
 * @throws {Error} Ако възникне грешка при работа с базата данни.
 */
function checkCurrentUser_(): boolean {
    const conn = getConnection_();
    let success = false;
    const userData = userStore.get('user');
    let user = new User(userData._email, userData._names, userData._role, userData._position, userData._id, userData._phone, userData._timetable, userData._workspace_id, userData._declarations_key, userData._notifications_key);
    const stmt = conn.prepareStatement('SELECT * FROM users WHERE email = ?'); // Използва проверка с email, защото потребителят може да бъде изтрит и добавен отново (тогава id-то ще е различно, но email-ът - същият)
    if (!user) {
        stmt.setString(1, getUserEmail_());
        const rs = stmt.executeQuery();
        if (rs.next()) {
            user = User.createFromResultSet(rs);
            userStore.set('user', user);
            success = true;
            userStore.persist(false);
        }
    } else {
        stmt.setString(1, user.email);
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

/**
 * Връща текущия потребител.
 * @returns {User} Текущият потребител.
 */
function getCurrentUser_(): User {
    const data = userStore.get('user');
    return new User(data._email, data._names, data._role, data._position, data._id, data._phone, data._timetable, data._workspace_id, data._declarations_key, data._notifications_key);
}