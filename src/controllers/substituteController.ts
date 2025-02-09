namespace substituteController {
    /**
     * Обрабтва GET заявката за страницата за замествания
     * @param req 
     * @param res 
     */
    export function getSubstitutePage_(req, res) {
        res.set('Content-Type', 'text/html');
        const role = getCurrentUser_().role;
        let html;
        if(role == 'admin'){
            html = HtmlService.createTemplateFromFile('public/html/admin/substitute');
            //TODO: Add data to the template
        }else if(role == 'teacher'){
            html = HtmlService.createTemplateFromFile('public/html/teacher/substitute');
            //TODO: Add data to the template
        }
        res.send(html.evaluate().getContent());
        res.end();
    }

    // TODO: Implement the function to handle the POST request
    export function createNewSubstitute_(req, res) {}

    //TODO: Implement the function to handle the DELETE request
    export function deleteSubstitute_(req, res) {}

    //TODO: Implement the function to handle the PUT request
    export function updateSubstitute_(req, res) {}
}