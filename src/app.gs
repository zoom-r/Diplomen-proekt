var app   = new Gexpress.App() // Инициализиране на приложението
globalThis.userStore = ObjectStore.create('user') // Инициализиране на локално хранилище за потребителя


// Middleware (извършват се по ред на инициализация)
app.use(authMiddleware_)
app.use(checkUserPropertiesMiddleware_)

// Routes (проверяват се по ред на инициализация)
app.get('/login', loginRoute_);
app.get(/.*/, homeRoute_) // Трябва винаги да е инициализиран последен

// this hooks Gexpress into appscript 
function doGet(e) { return app.doGet(e) }
function doPost(e){ return app.doPost(e) }