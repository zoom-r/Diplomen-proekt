/**
 * Обрабтва GET заявката за страницата за стаи
 * @param req 
 * @param res 
 */
function getRoomsPage_(req, res) {
    res.set('Content-Type', 'text/html');
    const role = getCurrentUser_().role;
    let html;
    if(role == 'admin'){
        html = HtmlService.createTemplateFromFile('public/html/admin/rooms');
        //TODO: Add data to the template
    }else if(role == 'teacher'){
        html = HtmlService.createTemplateFromFile('public/html/teacher/rooms');
        //TODO: Add data to the template
    }
    res.send(html.evaluate().getContent());
    res.end();
}

//TODO: Implement the function to handle the POST request
function createNewRoomRequest_(req, res) {}

//TODO: Implement the function to handle the DELETE request
function deleteRoomRequest_(req, res) {}

//TODO: Implement the function to handle the PUT request
function updateRoomRequest_(req, res) {}
