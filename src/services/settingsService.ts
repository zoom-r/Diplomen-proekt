/**
 * Връща настройките на работното пространство.
 * @return {Settings}
 * @throws {Error} Ако възникне грешка при работа с базата данни.
 */
function getWorkspaceSettings(): Settings{
    const conn = getConnection_();
    try{
        let workspaceSettings;
        const stmt = conn.prepareStatement('SELECT * FROM workspaces WHERE id = ?');
        stmt.setString(1, getCurrentUser_().workspace_id);
        const rs = stmt.executeQuery();
        if(rs.next()){
            workspaceSettings = Settings.createFromResultSet(rs);
        }
        return workspaceSettings;
    }catch(err){
        throw new Error('Error while getting workspace settings: ' + err);
    }
}

function updateWorkspaceSettings_(settings: Settings): boolean{
    const conn = getConnection_();
    try{
        const stmt = conn.prepareStatement('UPDATE workspaces SET shift = ?, max_classes = ?, templates = ?, rooms = ?, classes = ?, substitute_table_key = ?, rooms_table_key = ? WHERE id = ?');
        stmt.setString(1, settings.shift);
        stmt.setInt(2, settings.max_classes);
        stmt.setObject(3, Object.assign({}, settings.templates));
        stmt.setObject(4, Object.assign({}, settings.rooms));
        stmt.setObject(5, Object.assign({}, settings.classes));
        stmt.setString(6, settings.substitute_table_key);
        stmt.setString(7, settings.rooms_table_key);
        stmt.setString(8, getCurrentUser_().workspace_id);
        return stmt.executeUpdate() > 0;
    }catch(err){
        throw new Error('Error while updating workspace settings: ' + err);
    }
}