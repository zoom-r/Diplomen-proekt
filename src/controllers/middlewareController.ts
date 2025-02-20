/**
 * Преди да се изпълни заявката към сървъра, функцията проверява дали потребителят има достъп до приложението
 * и дали всичко е изрядно със запазените данни за него.
 * Ако няма достъп, функцията прекратява изпълнението на заявката и връща страница за забранен достъп.
 * При грешка във функцията се връща страница за грешка и се прекратяват останалите процеси.
 * @param {Object} req - Обектът на заявката.
 * @param {Object} res - Обектът на отговора.
 * @param {Function} next - Функцията, която трябва да се извика, за да продължи изпълнението на заявката.
 */
function authUser_(req, res, next) {
    try {
        if (checkCurrentUserInfo_()) {
            next();
        } else {
            res.set('content-type', 'text/html');
            const html = HtmlService.createTemplateFromFile('public/html/error');
            html.error = 'Нямате достъп до това приложение.';        
            res.send(html.evaluate().getContent());
            res.end();
        }
    } catch (err) {
        console.error('Error in auth middleware: ' + err.message);
        res.set('content-type', 'text/html');
        const html = HtmlService.createTemplateFromFile('public/html/error');
        html.error = 'Error in authorisation: ' + err.message;
        res.send(html.evaluate().getContent());
        res.end();
    }
}