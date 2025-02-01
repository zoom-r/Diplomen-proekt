function getUserFromDB_(){
    let email = Session.getActiveUser().getEmail();
    let conn = createDBConnection_();
    try{
        let stmt = conn.prepareStatement('SELECT 1 FROM users WHERE email = ?');
        stmt.setString(1, email);
        let rs = stmt.executeQuery();
        if(rs.next()){
            return User.createFromResultSet(rs);
        }
    }catch(e){
        Logger.log('Error during database query: ' + e.message);
        return null;
    }finally{
        conn.close();
    }
}

function createUser_(user){
    let conn = createDBConnection_();
    try{
        let stmt = conn.prepareStatement('INSERT INTO users (id, name, email, phone, role, position, timetable, workspace_id, declarations_key, notifications_key) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)');
        stmt.setString(1, Utilities.getUuid());
        stmt.setString(2, user.name);
        stmt.setString(3, user.email);
        stmt.setString(4, user.phone);
        stmt.setString(5, user.role);
        stmt.setString(6, user.position);
        stmt.setString(7, user.timetable);
        stmt.setString(8, getWorkspaceId_());
        stmt.setString(9, Utilities.getUuid());
        stmt.setString(10, Utilities.getUuid());
        return stmt.execute();
    }catch(e){
        Logger.log('Error during database query: ' + e.message);
        return false;
    }finally{
        conn.close();
    }
}

function getWorkspaceId_(){
    let domain = getUserWorkspace();
    let conn = createDBConnection_();
    try{
        let stmt = conn.prepareStatement('SELECT id FROM workspace WHERE domain = ?');
        stmt.setString(1, domain);
        let rs = stmt.executeQuery();
        if(rs.next()){
            return rs.getString('id');
        }
    }catch(e){
        Logger.log('Error during database query: ' + e.message);
        return null;
    }finally{
        conn.close();
    }
}

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
        return stmt.execute();
    }catch(e){
        Logger.log('Error during database query: ' + e.message);
        return false;
    }finally{
        conn.close();
    }
}