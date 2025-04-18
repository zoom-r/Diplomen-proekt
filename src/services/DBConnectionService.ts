let conn: GoogleAppsScript.JDBC.JdbcConnection;

/**
 * Създава връзка с базата данни и я връща.
 * @returns {GoogleAppsScript.JDBC.JdbcConnection} Връща връзка с базата данни.
 * @throws {Error} Ако възникне грешка при създаване на връзката.
 */
function getConnection_(): GoogleAppsScript.JDBC.JdbcConnection {
  if (!conn || conn.isClosed()) {
  const url = "jdbc:google:mysql://school-administration-444506:europe-west3:schooladministration2025/schools";
  const user = "client";
  const pass = "{J,Yq<M,gN4vE7rT";
    conn = Jdbc.getCloudSqlConnection(url, user, pass);
  }
  return conn;
}


/**
 * Затваря връзката с базата данни.
 * @throws {Error} Ако възникне грешка при затварянето на връзката.
 */
function closeConnection_() {
  if (conn && !conn.isClosed()) {
    conn.close();
  }
}

// Инициализация – работим в Script‑scope (=> кеш + ScriptProperties)
// @ts-ignore
const os = ObjectStore.create();

/**
 * Връща креденшъли → ObjectStore first‑level cache, после Properties.
 * Ако липсват – хвърля грешка.
 */
/*
function getDbCredentials() {
  const url  = os.get('DB_URL');
  console.log('DB_URL: ', url);
  const user = os.get('DB_USER');
  console.log('DB_USER: ', user);
  const pass = os.get('DB_PASS');
  console.log('DB_PASS: ', pass);
  if (!url || !user || !pass) {
    throw new Error('DB credentials not set');
  }
  return { url, user, pass };
}

function setCreds(){
  
  os.set('DB_URL', link);
  os.set('DB_USER', user);
  os.set('DB_PASS', pass);
}*/