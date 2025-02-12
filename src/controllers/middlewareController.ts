namespace middlewareController{
    /**
     * Преди да се изпълни заявката към сървъра, функцията проверява дали потребителят има достъп до приложението.
     * Ако няма достъп, функцията прекратява изпълнението на заявката и връща страница за забранен достъп.
     * При грешка във функцията се връща страница за грешка и се прекратяват останалите процеси.
     * @param {Object} req - Обектът на заявката.
     * @param {Object} res - Обектът на отговора.
     * @param {Function} next - Функцията, която трябва да се извика, за да продължи изпълнението на заявката.
     */
    export function authUser_(req, res, next) {
        console.log('Auth middleware ' + req.url);
        if (req.url == '/') {
            next();
        } else {
            try {
                if (checkUserAccess_()) {
                console.log('Access granted');
                next();
                } else {
                console.log('Access denied');
                res.set('content-type', 'text/html');
                const html = HtmlService.createTemplateFromFile('public/error');
                html.error = 'Нямате достъп до това приложение.';        
                res.send(html.evaluate().getContent());
                res.end();
                }
            } catch (err) {
                console.log('Error in auth middleware: ' + err.message);
                res.set('content-type', 'text/html');
                const html = HtmlService.createTemplateFromFile('public/error');
                html.error = 'Internal Server Error: ' + err.message;
                res.send(html.evaluate().getContent());
                res.end();
            }
        }
    }

    /**
     * Проверява изправността на данните на текущия потребител и останалите потребители в работното му пространство.
     * При възникване на грешка връща съобщение и спира останалите процеси.
     * @param {Object} req - Обектът на заявката.
     * @param {Object} res - Обектът на отговора.
     * @param {Function} next - Функцията, която трябва да се извика, за да продължи изпълнението на заявката.
     */
    export function checkUserProperties_(req, res, next) {
        console.log('Checking user properties ' + req.url);
        if (req.url == '/') {
            next();
        } else {
            if (checkCurrentUserInfo_() && checkAllOtherUsersInfo_()) {
                console.log('User found');
                next();
            } else {
                res.set('content-type', 'text/html');
                const html = HtmlService.createTemplateFromFile('public/error');
                html.error = 'Internal Server Error: User not found.';
                res.send(html.evaluate().getContent());
                res.end();
            }
        }
    }
}