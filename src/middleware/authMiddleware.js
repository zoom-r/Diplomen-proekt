function authMiddleware(app) {
    app.use(function(req, res, next) {
      Logger.log('req.url: ' + req.url)
      Logger.log('req.path: ' + req.path)
      if(req.url == '/'){
        next()
      }else{
        if (checkUserAccess_()) {
          next();
        } else {
          res.set('content-type', 'text/html');
          res.set('X-Frame-Options', 'ALLOWALL');
          res.send(`
            <html>
            <body>
                <h1>Access Denied</h1>
                <a href="https://accounts.google.com/Logout?continue=${encodeURIComponent(ScriptApp.getService().getUrl())}" target="_top"><button>Log out</button></a>
            </body>
            </html>
        `);
          res.end();
        }
      }
    });
}