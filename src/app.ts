import * as _ from "lodash";

// @ts-ignore
var app = new Gexpress.App(); // Инициализиране на приложението
// @ts-ignore
if ((typeof GasTap) === 'undefined') { // Инициализация на библиотека за създаване на тестове
    eval(UrlFetchApp.fetch('https://raw.githubusercontent.com/huan/gast/master/src/gas-tap-lib.js').getContentText());
}

// Middleware (извършват се по ред на инициализация)
app.use(authUser_); // Първо проверява дали потребителя има достъп до ресурса (чрез директен DB query)
app.use(checkUserProperties_); // Проверява дали има потребителски данни в сесията и ако няма - ги добавя

// Routes (проверяват се по ред на инициализация)

// Substitute
app.get('/substitute', getSubstitutePage_, true);
app.post('/substitute', createNewSubstituteRequest_, true);
app.delete('/substitute', deleteSubstituteRequest_, true);
app.put('/substitute', updateSubstituteRequest_, true);

//TODO: Add the rest of the routes

app.get('/client.js', app.client( function(code){ // Връща кода на клиентската част на приложението
    return ' ' + code + ' ' 
}));
app.get(/.*/, function(req, res){
    res.set('Content-Type', 'text/html');
    res.send(HtmlService.createTemplateFromFile('public/html/404').evaluate().getContent());
}); // Трябва винаги да е инициализиран последен

//TODO: Add the client.js script to the html files
//<script src="https://script.google.com/{SCRIPTID}/exec?path=/client.js"></script>

// this hooks Gexpress into appscript 
function doGet(e) { return app.doGet(e); }
function doPost(e) { return app.doPost(e); }
