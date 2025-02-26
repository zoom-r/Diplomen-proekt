/**
 * Връща настройките на работното пространство.
 * @return {Settings}
 * @throws {Error} Ако възникне грешка при работа с базата данни.
 */
function getWorkspaceSettings_(): Settings{
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
        stmt.setString(3, JSON.stringify(settings.templates)); //FIXME Turn the array into a JSON object
        stmt.setString(4, JSON.stringify(settings.rooms));
        stmt.setString(5, JSON.stringify(settings.classes));
        stmt.setString(6, settings.substitute_table_key);
        stmt.setString(7, settings.rooms_table_key);
        stmt.setString(8, getCurrentUser_().workspace_id);
        return stmt.executeUpdate() > 0;
    }catch(err){
        throw new Error('Error while updating workspace settings: ' + err);
    }
}