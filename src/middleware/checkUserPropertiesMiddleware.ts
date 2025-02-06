// Проверява дали има потребителски данни в сесията и ако няма ги добавя. 
// При възникване на грешка връща съобщение и спира останалите процеси.
function checkUserPropertiesMiddleware_(req, res, next) {
  console.log('Checking user properties ' + req.url);
  if (req.url == '/') {
    next();
  } else {
    let user = getUserInfo_();
    console.log('User: ' + JSON.stringify(user));
    if (user) {
      console.log('User found');
      next();
    } else {
      res.set('content-type', 'text/html');
      res.send('Error trying to get user info');
      res.end();
    }
  }
}
