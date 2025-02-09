namespace usersController {
    /**
     * Обрабтва GET заявката за страницата за потребители
     * @param req 
     * @param res 
     */
    export function getUsersPage_(req, res) {
        res.set('Content-Type', 'text/html');
        const role = getCurrentUser_().role;
        let html;
        if(role == 'admin'){
            html = HtmlService.createTemplateFromFile('public/html/admin/users');
            //TODO: Add data to the template
        }else if(role == 'teacher'){
            html = HtmlService.createTemplateFromFile('public/html/teacher/users');
            //TODO: Add data to the template
        }
        res.send(html.evaluate().getContent());
        res.end();
    }

    //TODO: Implement the function to handle the POST request
    export function createNewUser_(req, res) {}

    //TODO: Implement the function to handle the DELETE request
    export function deleteUser_(req, res) {}

    //TODO: Implement the function to handle the PUT request
    export function updateUser_(req, res) {}
}