function createDBConnection_(){
  try {
    let conn = Jdbc.getCloudSqlConnection('jdbc:google:mysql://school-administration-444506:europe-west3:schooladministration2025/schools', 'admin', '{J,Yq<M,gN4vE7rT');
    Logger.log('Database connection created');
    return conn;
  } catch (e) { //TODO: redirect to error page
    Logger.log('Failed to create database connection: ' + e.message);
    return null;
  }
}