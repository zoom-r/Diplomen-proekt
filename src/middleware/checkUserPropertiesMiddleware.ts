/**
 * Проверява изправността на данните на текущия потребител и останалите потребители в работното му пространство.
 * При възникване на грешка връща съобщение и спира останалите процеси.
 * @param {Object} req - Обектът на заявката.
 * @param {Object} res - Обектът на отговора.
 * @param {Function} next - Функцията, която трябва да се извика, за да продължи изпълнението на заявката.
 */
function checkUserPropertiesMiddleware_(req, res, next) {
  console.log('Checking user properties ' + req.url);
  if (req.url == '/') {
    next();
  } else {
    if (checkCurrentUserInfo_() && checkAllOtherUsersInfo_()) {
      console.log('User found');
      next();
    } else {
      res.set('content-type', 'text/html');
      res.send('Error trying to get user info');
      res.end();
    }
  }
}
