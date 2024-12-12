var app   = new Gexpress.App()
var cache = CacheService.getScriptCache()

cache.put("/hello", JSON.stringify({date: new Date()}) )

app.use(function(req,res,next){
  req.user = {email:Session.getActiveUser().getEmail()}
  next()
})

app.get('/hello',function(req,res,next){
  res.set('content-type','application/json')
  res.send( cache.get('/hello') )
  res.end()
},true)

app.get(/.*/, function(req,res,next){
  res.set('content-type','text/html')
  res.send("<html><body><h1>Hello</h1></body></html>") 
  res.end()
})

// this hooks Gexpress into appscript 
function doGet(e) { return app.doGet(e)  }
function doPost(e){ return app.doPost(e) }