function test(){
  var DBConnection = Jdbc.getCloudSqlConnection('jdbc:google:mysql://school-administration-444506:europe-west3:schooladministration2025/schools', 'admin', '{J,Yq<M,gN4vE7rT')
  Logger.log(DBConnection);
  DBConnection.close();
}
function test2(){
  Logger.log(Utilities.getUuid());
  return Utilities.getUuid();
}