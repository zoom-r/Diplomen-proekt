/**
 * Създава връзка с базата данни и я връща.
 * @returns {GoogleAppsScript.JDBC.JdbcConnection | null} - Връща връзка с базата данни или null при грешка.
 */
function createDBConnection_() {
  try {
    let conn = Jdbc.getCloudSqlConnection('jdbc:google:mysql://school-administration-444506:europe-west3:schooladministration2025/schools', 'client', '{J,Yq<M,gN4vE7rT');
    return conn;
  } catch (e) {
    console.log('Failed to create database connection: ' + e.message);
    return null;
  }
}