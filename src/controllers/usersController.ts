/**
 * Обрабтва GET заявката за страницата за потребители
 * @param req 
 * @param res 
 */
function getUsersPage_(req, res) {
    res.set('Content-Type', 'text/html');
    const role = getCurrentUser_().role;
    let html;
    if(role == 'admin'){
        html = HtmlService.createTemplateFromFile('public/html/admin/users');
        html.settings = getSettings();
        html.url = req.url;
    }else if(role == 'teacher'){
        html = HtmlService.createTemplateFromFile('public/html/teacher/users');
        html.url = req.url;
    }
    res.send(html.evaluate().getContent());
    res.end();
}
