// @ts-ignore
var app = new Gexpress.App(); // Инициализиране на приложението
// // @ts-ignore
// if ((typeof GasTap) === 'undefined') { // Инициализация на библиотека за създаване на тестове
//     eval(UrlFetchApp.fetch('https://raw.githubusercontent.com/huan/gast/master/src/gas-tap-lib.js').getContentText());
// }

// Middleware (извършват се по ред на инициализация)
/**
 * Преди да се изпълни заявката към сървъра, функцията проверява дали потребителят има достъп до приложението
 * и дали всичко е изрядно със запазените данни за него.
 * Ако няма достъп, функцията прекратява изпълнението на заявката и връща страница за забранен достъп.
 * При грешка във функцията се връща страница за грешка и се прекратяват останалите процеси.
 * @param {Object} req - Обектът на заявката.
 * @param {Object} res - Обектът на отговора.
 * @param {Function} next - Функцията, която трябва да се извика, за да продължи изпълнението на заявката.
 */
app.use(function (req, res, next){ // Първо проверява дали потребителя има достъп до ресурса (чрез директен DB query)
    try {
        if (checkCurrentUser_() && checkSettings_()) {
            next();
        } else {
            res.set('content-type', 'text/html');
            const html = HtmlService.createTemplateFromFile('public/html/error');
            html.error = 'Нямате достъп до това приложение.';        
            res.send(html.evaluate().setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL).getContent());
            res.end();
        }
    } catch (err) {
        console.error('Error in auth middleware: ' + err.message);
        res.set('content-type', 'text/html');
        const html = HtmlService.createTemplateFromFile('public/html/error');
        html.error = 'Error in authorisation: ' + err.message;
        res.send(html.evaluate().setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL).getContent());
        res.end();
    }
});

// Routes (проверяват се по ред на инициализация)

// Substitute
/**
 * Обработва GET заявката за страницата за замествания.
 * Връща HTML съдържание в зависимост от ролята на потребителя (администратор или учител).
 * @param req - Обект на заявката.
 * @param res - Обект на отговора.
 */
app.get('/substitute', function (req, res) {
    res.set('Content-Type', 'text/html'); // Задава типа на съдържанието като HTML.
    const role = getCurrentUser_().role; // Взима ролята на текущия потребител.
    let html;

    // Зарежда различен HTML шаблон в зависимост от ролята на потребителя.
    if (role == 'admin') {
        html = HtmlService.createTemplateFromFile('public/html/admin/substitute');
        html.url = req.url; // Задава URL на заявката.
    } else if (role == 'teacher') {
        html = HtmlService.createTemplateFromFile('public/html/teacher/substitute');
        html.url = req.url; // Задава URL на заявката.
    }

    // Изпраща HTML съдържанието като отговор.
    res.send(html.evaluate().setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL).getContent());
    res.end(); // Завършва отговора.
});

// Users
/**
 * Обрабтва GET заявката за страницата за потребители
 * @param req 
 * @param res 
 */
app.get('/users', function (req, res) {
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
    res.send(html.evaluate().setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL).getContent());
    res.end();
});

// Settings
/**
 * Зарежда страницата с настройки, ако потребителят е администратор.
 */
app.get('/settings', function (req, res) {
    console.log('Settings page loading'); // Логва, че страницата с настройки е заредена
    if (getCurrentUser_().role !== 'admin') {
        res.set('Content-Type', 'text/html');
        const html = HtmlService.createTemplateFromFile('public/html/error');
        html.error = 'Нямате достъп до тази страница.';
        res.send(html.evaluate().setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL).getContent());
        res.end();
        return;
    }

    res.set('Content-Type', 'text/html');
    const html = HtmlService.createTemplateFromFile('public/html/settings');
    html.url = req.url;
    res.send(html.evaluate().setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL).getContent());
    res.end();
});

// Declarations
/**
 * Обработва GET заявката за страницата за декларации.
 * Зарежда HTML съдържание в зависимост от ролята на потребителя (администратор или учител).
 * @param req - Обект на заявката.
 * @param res - Обект на отговора.
 */
app.get('/declarations', function (req, res) {
    res.set('Content-Type', 'text/html'); // Задава типа на съдържанието като HTML.
    const role = getCurrentUser_().role; // Взима ролята на текущия потребител.
    let html;

    // Зарежда различен HTML шаблон в зависимост от ролята на потребителя.
    if (role == 'admin') {
        html = HtmlService.createTemplateFromFile('public/html/admin/declarations');
        html.url = req.url; // Задава URL на заявката.
    } else if (role == 'teacher') {
        html = HtmlService.createTemplateFromFile('public/html/teacher/declarations');
        html.url = req.url; // Задава URL на заявката.
    }

    // Изпраща HTML съдържанието като отговор.
    res.send(html.evaluate().setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL).getContent());
    res.end(); // Завършва отговора.
});

// Rooms
/**
 * Обработва GET заявката за страницата за стаи.
 * Зарежда HTML съдържание за страницата със стаи.
 * @param req - Обект на заявката.
 * @param res - Обект на отговора.
 */
app.get('/rooms', function (req, res){
    res.set('Content-Type', 'text/html'); // Задава типа на съдържанието като HTML.
    const role = getCurrentUser_().role; // Взима ролята на текущия потребител.
    let html;

    // Зарежда HTML шаблона за страницата със стаи.
    html = HtmlService.createTemplateFromFile('public/html/rooms');
    html.url = req.url; // Задава URL на заявката.

    // Изпраща HTML съдържанието като отговор.
    res.send(html.evaluate().setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL).getContent());
    res.end(); // Завършва отговора.
});

app.get(/.*/, function(req, res){ // Трябва винаги да е инициализиран последен
    res.set('Content-Type', 'text/html');
    res.send(HtmlService.createTemplateFromFile('public/html/404').evaluate().getContent());
    res.end();
}); 

// this hooks Gexpress into appscript 
function doGet(e) { return app.doGet(e); }
function doPost(e) { return app.doPost(e); }
