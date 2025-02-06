// Създава връзка с базата данни и я връща
// Връща null при грешка
function createDBConnection_(){
  try {
    let conn = Jdbc.getCloudSqlConnection('jdbc:google:mysql://school-administration-444506:europe-west3:schooladministration2025/schools', 'client', '{J,Yq<M,gN4vE7rT');
    return conn;
  } catch (e) { //TODO: redirect to error page
    console.log('Failed to create database connection: ' + e.message);
    return null;
  }
}