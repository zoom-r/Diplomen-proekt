/**
 * Преди да се изпълни заявката към сървъра, функцията проверява дали потребителят има достъп до приложението.
 * Ако няма достъп, функцията прекратява изпълнението на заявката и връща страница за забранен достъп.
 * При грешка във функцията се връща страница за грешка и се прекратяват останалите процеси.
 * @param {Object} req - Обектът на заявката.
 * @param {Object} res - Обектът на отговора.
 * @param {Function} next - Функцията, която трябва да се извика, за да продължи изпълнението на заявката.
 */
function authMiddleware_(req, res, next) {
  console.log('Auth middleware ' + req.url);
  if (req.url == '/') {
    next();
  } else {
    try {
      if (checkUserAccess_()) {
        console.log('Access granted');
        next();
      } else {
        console.log('Access denied');
        res.set('content-type', 'text/html');
        const html = HtmlService.createTemplateFromFile('public/error');
        html.error = 'Нямате достъп до това приложение.';        
        res.send(html.evaluate().getContent());
        res.end();
      }
    } catch (err) {
      console.log('Error in auth middleware: ' + err.message);
      res.set('content-type', 'text/html');
      const html = HtmlService.createTemplateFromFile('public/error');
      html.error = 'Internal Server Error: ' + err.message;
      res.send(html.evaluate().getContent());
      res.end();
    }
  }
}

/**
 * Проверява дали потребителят има достъп до приложението.
 * @returns {boolean} - Връща true, ако потребителят има достъп, и false в противен случай.
 */
function checkUserAccess_(): boolean {
  const email = getUserEmail_();
  const workspaceId = getWorkspaceId_();
  let access = false;
  const conn = createDBConnection_();
  if (!conn) return access;
  try {
    if (workspaceId) {
      let stmt = conn.prepareStatement('SELECT * FROM users WHERE email = ? AND workspace_id = ?');
      stmt.setString(1, email);
      stmt.setString(2, workspaceId);
      let rs2 = stmt.execute();
      if (rs2) {
        access = true;
      }
    }
  } catch (e) {
    console.log('Error during database query for authentication: ' + e.message);
  } finally {
    conn.close();
    return access;
  }
}