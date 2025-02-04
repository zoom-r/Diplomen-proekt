var userStore = globalThis.userStore

// Взима потребителя от базата данни
// ако не съществува, връща null
function getUserFromDB_() { 
  let conn = createDBConnection_();
  if (!conn) return null;
  try {
    let stmt = conn.prepareStatement('SELECT * FROM users WHERE email = ?');
    stmt.setString(1, getUserEmail());
    let rs = stmt.executeQuery();
    if (rs.next()) {
      return User.createFromResultSet(rs);
    }
  } catch (e) {
    console.log('Error getting user form DB: ' + e.message);
    return null;
  } finally {
    conn.close();
  }
}

// Взима потребителя от локалното хранилище - ако не съществува, взима данните му от базата данни, 
// а ако не съществува и там, връща null
function getUserInfo_() { 
  try {
    let user = userStore.get('user');
    if (!user) {
      user = getUserFromDB_();
      if (user) userStore.set('user', user);
    }
    return user;
  } catch (e) {
    console.log('Error trying to get user info: ' + e.message);
    return null;
  }
}

// Създава нов потребител в базата данни и връща true, ако е успешно,
// в противен случай връща false
function createUser_(user){ 
    let conn = createDBConnection_();
    try{
        let stmt = conn.prepareStatement('INSERT INTO users (id, name, email, role, workspace_id, declarations_key, notifications_key) VALUES (?, ?, ?, ?, ?, ?, ?)');
        stmt.setString(1, user.id ? user.id : Utilities.getUuid());
        stmt.setString(2, user.name);
        stmt.setString(3, user.email);
        stmt.setString(4, user.role);
        stmt.setString(5, user.workspace_id ? user.workspace_id : getWorkspaceId_());
        stmt.setString(6, user.declarations_key ? user.declarations_key : Utilities.getUuid());
        stmt.setString(7, user.notifications_key ? user.notifications_key : Utilities.getUuid());
        let rowsAffected = stmt.executeUpdate(); //Връща броя на засегнатите редове -> ако е 0, значи не е добавен нов ред
        return rowsAffected > 0;
    }catch(e){
        console.log('Error during database query for creating a user: ' + e.message);
        return false;
    }finally{
        conn.close();
    }
}

// Обновява данните на потребителя в базата данни и връща true, ако е успешно
// в противен случай връща false
function updateUser_(user){
    let conn = createDBConnection_();
    try{
        let stmt = conn.prepareStatement('UPDATE users SET name = ?, phone = ?, role = ?, position = ?, timetable = ? WHERE email = ?');
        stmt.setString(1, user.name);
        stmt.setString(2, user.phone);
        stmt.setString(3, user.role);
        stmt.setString(4, user.position);
        stmt.setString(5, user.timetable);
        stmt.setString(6, user.email);
        let rowsAffected = stmt.executeUpdate();
        return rowsAffected > 0;
    }catch(e){
        console.log('Error during database query for ipdating a user: ' + e.message);
        return false;
    }finally{
        conn.close();
    } 
}

// Изтрива потребителя от базата данни и връща true, ако е успешно
// в противен случай връща false
function deleteUser_(user){
    let conn = createDBConnection_();
    try{
        let stmt = conn.prepareStatement('DELETE FROM users WHERE email = ?');
        stmt.setString(1, user.email);
        let stmt2 = conn.prepareStatement('DELETE FROM notifications WHERE notifications_key = ?');
        stmt2.setString(1, user.notifications_key);
        let stmt3 = conn.prepareStatement('DELETE FROM declarations WHERE declarations_key = ?');
        stmt3.setString(1, user.declarations_key);
        let rowsAffected = stmt.executeUpdate();
        let rowsAffected2 = stmt2.executeUpdate();
        let rowsAffected3 = stmt3.executeUpdate();
        return rowsAffected > 0 && rowsAffected2 > 0 && rowsAffected3 > 0;
    }catch(e){
        console.log('Error during database query for deleting a user: ' + e.message);
        return false;
    }finally{
        conn.close();
    }
}

// Взима профилната снимка на потребителя
// ако не съществува, връща стандартна снимка
function getUserPictureUrl(email){
    let defaultPictureUrl = 'https://lh3.googleusercontent.com/a-/AOh14Gj-cdUSUVoEge7rD5a063tQkyTDT3mripEuDZ0v=s100';
    let userPictureUrl = null;
    try{
        let people = People.People.searchDirectoryPeople( {
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

// Взима имейла на потребителя
function getUserEmail_() {
    return Session.getActiveUser().getEmail();
}

// Взима работното пространство на потребителя
function getUserWorkspace_() {
    let email = getUserEmail_();
    let domain = email.substring(email.lastIndexOf("@") + 1); // взима домейна на имейла (всичко след @)
    return domain;
}

// Взима id на работното пространство на потребителя
// ако не съществува, връща null
function getWorkspaceId_(){
    let domain = getUserWorkspace_();
    let conn = createDBConnection_();
    try{
        let stmt = conn.prepareStatement('SELECT id FROM workspace WHERE domain = ?');
        stmt.setString(1, domain);
        let rs = stmt.executeQuery();
        if(rs.next()){
            return rs.getString('id');
        }
    }catch(e){
        console.log('Error during database query for getting workspace id: ' + e.message);
        return null;
    }finally{
        conn.close();
    }
}