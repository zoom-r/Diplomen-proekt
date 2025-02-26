function getSettingsPage_(req, res){
    res.set('Content-Type', 'text/html');
    const html = HtmlService.createTemplateFromFile('public/html/settings');
    html.url = req.url;
    res.send(html.evaluate().getContent());
    res.end();
}