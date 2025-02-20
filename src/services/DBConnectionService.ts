let conn: GoogleAppsScript.JDBC.JdbcConnection;

/**
 * Създава връзка с базата данни и я връща.
 * @returns {GoogleAppsScript.JDBC.JdbcConnection} Връща връзка с базата данни.
 * @throws {Error} Ако възникне грешка при създаване на връзката.
 */
function getConnection_() {
  if (!conn || conn.isClosed()) {
    const url = 'jdbc:google:mysql://school-administration-444506:europe-west3:schooladministration2025/schools';
    const user = 'client';
    const password = '{J,Yq<M,gN4vE7rT';
    conn = Jdbc.getCloudSqlConnection(url, user, password);
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