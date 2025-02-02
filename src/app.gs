var app   = new Gexpress.App()
var cache = CacheService.getScriptCache()
var url = ScriptApp.getService().getUrl()

// Middleware
authMiddleware(app)

// Routes
homeRoute(app)
app.get('/login', function(req, res, next) {
  res.set('content-type', 'text/html');
  res.set('X-Frame-Options', 'ALLOWALL');
  res.send(`<html><body><h1>You\'re logged in successfully</h1><a href="https://accounts.google.com/Logout?continue=${encodeURIComponent(url)}" target="_top"><button>Log out</button></a></body></html>`);
  res.end();
}, true);

// this hooks Gexpress into appscript 
function doGet(e) { return app.doGet(e) }
function doPost(e){ return app.doPost(e) }