// @ts-ignore
var app = new Gexpress.App(); // Инициализиране на приложението
// @ts-ignore
if ((typeof GasTap) === 'undefined') { // Инициализация на библиотека за създаване на тестове
    eval(UrlFetchApp.fetch('https://raw.githubusercontent.com/huan/gast/master/src/gas-tap-lib.js').getContentText());
}

// Middleware (извършват се по ред на инициализация)
app.use(authUser_); // Първо проверява дали потребителя има достъп до ресурса (чрез директен DB query)

// Routes (проверяват се по ред на инициализация)

// Substitute
app.get('/substitute', getSubstitutePage_);

// Users
app.get('/users', getUsersPage_);

// Settings
app.get('/settings', getSettingsPage_);

// Declarations
app.get('/declarations', getDeclarationsPage_);

// Rooms
app.get('/rooms', getRoomsPage_);

// app.get(/.*/, function(req, res){ // Трябва винаги да е инициализиран последен
//     res.set('Content-Type', 'text/html');
//     res.send(HtmlService.createTemplateFromFile('public/html/404').evaluate().getContent());
//     res.end();
// }); 

app.get(/.*/, getSubstitutePage_)

// this hooks Gexpress into appscript 
function doGet(e) { return app.doGet(e); }
function doPost(e) { return app.doPost(e); }
