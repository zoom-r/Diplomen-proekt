// @ts-ignore
const scriptStore = ObjectStore.create('script', {manual: true});
// @ts-ignore
const _ = LodashGS.load();

function getSettings(): Settings {
    const data = scriptStore.get(getCurrentUser_().workspace_id);
    console.log('Settings data: ', data);
    if(!data){
        throw new Error("Settings not found!");
    }
    return new Settings(data._id, data._name, data._shift, data._max_classes, data._classes, data._rooms, data._substitute_key, data._rooms_key, data._declarations_templates);
}
function updateSettings(settings: Settings): void {
    scriptStore.set(getCurrentUser_().workspace_id, settings);
    scriptStore.persist(false);
}
function deleteSettings_(): void {
    scriptStore.delete(getCurrentUser_().workspace_id);
    scriptStore.persist(false);
}
function checkSettings_(): boolean {
    const conn = getConnection_();
    let success = false;
    try{
        const settingsData = scriptStore.get(getCurrentUser_().workspace_id);
        let settings = settingsData ? new Settings(settingsData.id, settingsData.name, settingsData.shift, settingsData.max_classes, settingsData.classes, settingsData.rooms, settingsData.substitute_key, settingsData.rooms_key, settingsData.declarations_templates) : null;
        const stmt = conn.prepareStatement('SELECT * FROM workspace WHERE id = ?');
        stmt.setString(1, getCurrentUser_().workspace_id);
        if(!settings){
            const rs = stmt.executeQuery();
            if(rs.next()){
                settings = Settings.createFromResultSet(rs);
                scriptStore.set(getCurrentUser_().workspace_id, settings);
                success = true;
                scriptStore.persist(false);
            }else{
                throw new Error('Settings not found!');
            }
        }else{
            const rs = stmt.executeQuery();
            if(rs.next()){
                const newSettings = Settings.createFromResultSet(rs);
                if(!_.isEqual(settings, newSettings)){
                    scriptStore.set(getCurrentUser_().workspace_id, newSettings);
                    scriptStore.persist(false);
                }
                success = true;
            }
        }
        closeConnection_();
        return success;
    }catch(e){
        throw new Error('Error while checking settings: ' + e.message);
    }
}