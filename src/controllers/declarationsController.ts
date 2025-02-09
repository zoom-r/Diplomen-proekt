namespace declarationsController {
    /**
     * Обрабтва GET заявката за страницата за декларации
     * @param req 
     * @param res 
     */
    export function getDeclarationsPage_(req, res) {
        res.set('Content-Type', 'text/html');
        const role = getCurrentUser_().role;
        let html;
        if(role == 'admin'){
            html = HtmlService.createTemplateFromFile('public/html/admin/declarations');
            //TODO: Add data to the template
        }else if(role == 'teacher'){
            html = HtmlService.createTemplateFromFile('public/html/teacher/declarations');
            //TODO: Add data to the template
        }
        res.send(html.evaluate().getContent());
        res.end();
    }

    //TODO: Implement the function to handle the POST request
    export function createNewDeclaration_(req, res) {}

    //TODO: Implement the function to handle the DELETE request
    export function deleteDeclaration_(req, res) {}
}