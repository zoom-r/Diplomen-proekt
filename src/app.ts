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

// Substitute
app.get('/substitute', substituteController.getSubstitutePage_, true);
app.post('/substitute', substituteController.createNewSubstitute_, true);
app.delete('/substitute', substituteController.deleteSubstitute_, true);
app.put('/substitute', substituteController.updateSubstitute_, true);

//TODO: Add the rest of the routes

app.get('/client.js', app.client( function(code){ // Връща кода на клиентската част на приложението
    return ' ' + code + ' ' 
}));
app.get(/.*/, function(req, res){
    res.set('Content-Type', 'text/html');
    res.send(HtmlService.createTemplateFromFile('public/404').evaluate().getContent());
}); // Трябва винаги да е инициализиран последен

//TODO: Add the client.js script to the html files
//<script src="https://script.google.com/{SCRIPTID}/exec?path=/client.js"></script>

// this hooks Gexpress into appscript 
function doGet(e) { return app.doGet(e); }
function doPost(e) { return app.doPost(e); }
