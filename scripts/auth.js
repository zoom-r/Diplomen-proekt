function getUserEmail() {
  return Session.getActiveUser().getEmail();
}

function getUserWorkspace(){
    let email = getUserEmail();
    let domain = email.substring(email.lastIndexOf("@") + 1); // взима домейна на имейла (всичко след @)
    return domain;
}

function checkUserAccess_(){
    let email = getUserEmail();
    let domain = getUserWorkspace();
    let access = false;
    let workspaceId = null;
    let conn = createDBConnection();
    if (conn == null) {
        return access;
    }
    try {
        let stmt1 = conn.prepareStatement('SELECT id FROM workspace WHERE domain = ?');
        stmt1.setString(1, domain);
        let rs = stmt1.executeQuery();
        if (rs.next()) {
            workspaceId = rs.getString('id');
            let stmt2 = conn.prepareStatement('SELECT 1 FROM users WHERE email = ? AND workspace_id = ?');
            stmt2.setString(1, email);
            stmt2.setString(2, workspaceId);
            let rs2 = stmt2.execute();
            if (rs2) {
                access = true;
            }
        }
    } catch (e) {
        Logger.log('Error during database query: ' + e.message);
    } finally {
        conn.close();
    }
    return access;
}