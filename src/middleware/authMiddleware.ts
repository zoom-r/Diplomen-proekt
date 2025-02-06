// Преди да се изпълни заявката към сървъра, фунцкцията проверява дали потребителят има достъп до ресурса
// Ако няма достъп, функцията прекратява изпълнението на заявката и връща съобщение
function authMiddleware_(req, res, next) {
  console.log('Auth middleware ' + req.url);
  if (req.url == '/') {
    next();
  } else {
    try {
      let access = checkUserAccess_();
      if (access) {
        console.log('Access granted');
        next();
      } else {
        console.log('Access denied');
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
    } catch (err) {
      console.log('Error in auth middleware: ' + err.message);
      res.set('content-type', 'text/html');
      res.send('Internal Server Error');
      res.end();
    }
  }
}

// Проверява дали потребителя има достъп до ресурса
// Връща true, ако има, и false в противен случай
function checkUserAccess_() {
  let email = getUserEmail();
  let workspaceId = getWorkspaceId_();
  let access = null;
  let conn = createDBConnection_();
    if (!conn) return access;
    try {
      console.log('Checking user access');
      if (workspaceId) {
        let stmt2 = conn.prepareStatement('SELECT * FROM users WHERE email = ? AND workspace_id = ?');
        stmt2.setString(1, email);
        stmt2.setString(2, workspaceId);
        let rs2 = stmt2.execute();
        if (rs2) {
          access = true;
        }
      }
    } catch (e) {
      console.log('Error during database query for authentication: ' + e.message);
    } finally {
      conn.close();
      console.log('User access: ' + access);
      return access;
    }
}