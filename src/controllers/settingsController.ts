function getSettingsPage_(req, res){
    if(getCurrentUser_().role !== 'admin'){
        res.set('Content-Type', 'text/html');
        const html = HtmlService.createTemplateFromFile('public/html/error');
        html.error = 'Нямате достъп до тази страница.';
        res.send(html.evaluate().getContent());
        res.end();
        return;
    }
    res.set('Content-Type', 'text/html');
    const html = HtmlService.createTemplateFromFile('public/html/settings');
    html.url = req.url;
    res.send(html.evaluate().getContent());
    res.end();
}

function saveSettings(shift, max_classes, declarations_templates, classes, rooms){
    const conn = getConnection_();
    try{
        const stmt = conn.prepareStatement('UPDATE workspace SET shifts = ?, max_classes = ?, declaration_templates = ?, classes = ?, rooms = ? WHERE id = ?');
        stmt.setString(1, shift);
        stmt.setInt(2, parseInt(max_classes));
        stmt.setString(3, JSON.stringify(declarations_templates));
        stmt.setString(4, JSON.stringify(classes));
        stmt.setString(5, JSON.stringify(rooms));
        stmt.setString(6, getCurrentUser_().workspace_id);
        const rs = stmt.executeUpdate();
        if(rs > 0){
            let settings = getSettings();
            settings.shift = shift;
            settings.max_classes = max_classes;
            settings.declarations_templates = declarations_templates;
            settings.classes = classes;
            settings.rooms = rooms;
            updateSettings(settings);
        }
    }catch(e){
        throw new Error('Error while saving settings: ' + e.message);
    }finally{
        closeConnection_();
    }
}