function homeRoute(app){
    app.get(/.*/, function(req,res, next){
        res.set('content-type','text/html')
        res.set('X-Frame-Options', 'ALLOWALL');
        res.send(`<html><body><h1>Hello</h1><a href="${url}/login" target="_top"><button>Login</button></a></body></html>`) // see docs for template-usage & banner-removal
        res.end()
    })
      
}