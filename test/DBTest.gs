function testDBConnection() {

  var test = new GasTap();

  test('Test createDBConnection_ function - successful connection', function(t) {
    // Mock Jdbc.getCloudSqlConnection to simulate a successful connection
    var originalGetCloudSqlConnection = Jdbc.getCloudSqlConnection;
    Jdbc.getCloudSqlConnection = function() {
      return { isValid: function() { return true; } }; // Mock connection object
    };

    var conn = createDBConnection_();
    t.ok(conn && conn.isValid(), 'Database connection should be created successfully');

    // Restore the original function
    Jdbc.getCloudSqlConnection = originalGetCloudSqlConnection;
  });

  test('Test createDBConnection_ function - failed connection', function(t) {
    // Mock Jdbc.getCloudSqlConnection to simulate a failed connection
    var originalGetCloudSqlConnection = Jdbc.getCloudSqlConnection;
    Jdbc.getCloudSqlConnection = function() {
      throw new Error('Simulated connection failure');
    };

    var conn = createDBConnection_();
    t.notOk(conn, 'Database connection should fail and return null');

    // Restore the original function
    Jdbc.getCloudSqlConnection = originalGetCloudSqlConnection;
  });

  test('Test createDBConnection_ function - real connection', function(t) {
    var conn = createDBConnection_();
    if (conn) {
      t.ok(conn.isValid(0), 'Real database connection should be valid');
      conn.close();
    } else {
      t.fail('Real database connection should be created');
    }
  });

  test.finish();
}