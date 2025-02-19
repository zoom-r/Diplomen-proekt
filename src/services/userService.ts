/**
 * Проверява дали потребителят има достъп до приложението.
 * @returns {boolean} - Връща true, ако потребителят има достъп, и false в противен случай.
 */
function checkUserAccess_(): boolean {
    let access = false;
    const conn = createDBConnection_();
    if (!conn) return access;
    try {
        let stmt = conn.prepareStatement('SELECT * FROM users WHERE email = ?');
        stmt.setString(1, getUserEmail_());
        let rs = stmt.execute();
        if (rs) {
            access = true;
        }
    } catch (e) {
        console.log('Error during database query for authentication: ' + e.message);
    } finally {
        conn.close();
        return access;
    }
}

/**
 * Създава нов потребител в базата данни.
 * @param {User} user - Потребителят, който ще бъде създаден.
 * @returns {boolean} - Връща true, ако потребителят е създаден успешно, в противен случай - false.
 */
function createUser_(user: User): boolean { 
    const conn = createDBConnection_();
    if(!conn) return false;
    let success = false;
    try{
        const stmt = conn.prepareStatement('INSERT INTO users (id, names, email, role, position, workspace_id, declarations_key, notifications_key) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
        stmt.setString(1, user.id);
        stmt.setString(2, user.names);
        stmt.setString(3, user.email);
        stmt.setString(4, user.role);
        stmt.setString(5, user.position);
        stmt.setString(6, user.workspace_id);
        stmt.setString(7, user.declarations_key);
        stmt.setString(8, user.notifications_key);
        const rowsAffected = stmt.executeUpdate(); // Връща броя на засегнатите редове -> ако е 0, значи не е добавен нов ред
        if(rowsAffected > 0){
            const storeUser = new User(
                user.email,
                user.names,
                user.role,
                user.position,
                user.id,
                user.phone
            )
            createUserInUserStore_(storeUser);
            success = true;
        }
    }catch(e){
        console.log('Error during database query for creating a user: ' + e.message);
    }finally{
        conn.close();
        return success;
    }
}

/**
 * Обновява данните на потребителя в базата данни.
 * Може да се обновява само информацията на собствения профил.
 * @param {User} user - Потребителят, който ще бъде обновен.
 * @returns {boolean} - Връща true, ако потребителят е обновен успешно, в противен случай - false.
 */
function updateUser_(user: User): boolean {
    const conn = createDBConnection_();
    if(!conn) return false;
    let success = false;
    try{
        const stmt = conn.prepareStatement('UPDATE users SET phone = ?, position = ?, timetable = ? WHERE email = ?');
        stmt.setString(1, user.phone);
        stmt.setString(2, user.position);
        stmt.setObject(3, user.timetable);
        stmt.setString(4, user.email);
        const rowsAffected = stmt.executeUpdate();
        if(rowsAffected > 0){
            updateUserInUserStore_(user);
            success = true;
        }
    }catch(e){
        console.log('Error during database query for updating a user: ' + e.message);
    }finally{
        conn.close();
        return success;
    } 
}

/**
 * Изтрива потребителя от базата данни.
 * @param {string} id - ID на потребителя, който ще бъде изтрит.
 * @returns {boolean} - Връща true, ако потребителят е изтрит успешно, в противен случай - false.
 */
function deleteUser_(id: string): boolean {
    const conn = createDBConnection_();
    if(!conn) return false;
    let success = false;
    try{
        const stmt = conn.prepareStatement('SELECT notifications_key, declarations_key FROM users WHERE id = ?');
        stmt.setString(1, id);
        const rs = stmt.executeQuery();
        if(rs.next()){
            const notifications_key = rs.getString('notifications_key');
            const declarations_key = rs.getString('declarations_key');
            const stmt1 = conn.prepareStatement('DELETE FROM users WHERE id = ?');
            stmt1.setString(1, id);
            const stmt2 = conn.prepareStatement('DELETE FROM notifications WHERE notifications_key = ?');
            stmt2.setString(1, notifications_key);
            const stmt3 = conn.prepareStatement('DELETE FROM declarations WHERE declarations_key = ?');
            stmt3.setString(1, declarations_key);
            let rowsAffected = stmt1.executeUpdate();
            stmt2.executeUpdate();
            stmt3.executeUpdate();
            if (rowsAffected > 0){
                deleteUserFromUserStore_(id);
                success = true;
            }
        }
    }catch(e){
        console.log('Error during database query for deleting a user: ' + e.message);
    }finally{
        conn.close();
        return success;
    }
}

/**
 * Взима профилната снимка на потребителя. 
 * Ако не съществува такава или се изхвърли грешка, връща стандартна снимка.
 * @param {string} [id=null] - ID на потребителя. Ако не е предоставено, взима текущия потребител.
 * @returns {string} - URL на профилната снимка на потребителя или стандартна снимка.
 */
function getUserPictureUrl(id: string = null): string {
    const defaultPictureUrl = 'https://lh3.googleusercontent.com/a-/AOh14Gj-cdUSUVoEge7rD5a063tQkyTDT3mripEuDZ0v=s100';
    let userPictureUrl = null;
    try{
        let email = null;
        if(!id){
            email = getUserEmail_()
        } else {
            const user = getUserById_(id);
            email = user.email;
        } 
        const people = People.People.searchDirectoryPeople({
            query: email,
            readMask: 'photos',
            sources: 'DIRECTORY_SOURCE_TYPE_DOMAIN_PROFILE'
        });
        userPictureUrl = people?.people[0]?.photos[0]?.url;
    }catch(e){
        console.log('Error trying to get user picture: ' + e.message);
    }
    return userPictureUrl ?? defaultPictureUrl;    
}

/**
 * Взима имейла на текущия потребител.
 * @returns {string} - Имейлът на потребителя.
 */
function getUserEmail_(): string {
    return Session.getActiveUser().getEmail();
}