// @ts-ignore
var app = new Gexpress.App(); // Инициализиране на приложението
// @ts-ignore
if ((typeof GasTap) === 'undefined') { // Инициализация на библиотека за създаване на тестове
    eval(UrlFetchApp.fetch('https://raw.githubusercontent.com/huan/gast/master/src/gas-tap-lib.js').getContentText());
}

// Middleware (извършват се по ред на инициализация)
app.use(authMiddleware_); // Първо проверява дали потребителя има достъп до ресурса (чрез директен DB query)
app.use(checkUserPropertiesMiddleware_); // Проверява дали има потребителски данни в сесията и ако няма - ги добавя

// Routes (проверяват се по ред на инициализация)
app.get('/login', homeRoute_);
app.get(/.*/, loginRoute_); // Трябва винаги да е инициализиран последен

// this hooks Gexpress into appscript 
function doGet(e) { return app.doGet(e); }
function doPost(e) { return app.doPost(e); }
