function testUserService() {
    if ((typeof GasTap)==='undefined') { // Инициализация на библиотека за създаване на тестове
        eval(UrlFetchApp.fetch('https://raw.githubusercontent.com/huan/gast/master/src/gas-tap-lib.js').getContentText())
    }
  let test = new GasTap();

  test('Test getUserFromDB_ function', function(t) {
    let user = getUserFromDB_();
    t.ok(user, 'User should be retrieved from the database');
  });

  test('Test getUserInfo_ function', function(t) {
    let user = getUserInfo_();
    t.ok(user, 'User info should be retrieved');
  });

  test('Test createUser function', function(t) {
    let result = createUser_({"id": "1", "name": "Test User", "email": "test@gmail.com", "role": "teacher", "workspace_id": "1", "declarations_key": "1", "notifications_key": "1"});
    t.ok(result, 'User should be created successfully');
  });

  test('Test updateUser function', function(t) {
    let result = updateUser_({"email": "test@gmail.com", "phone": "1234567890", "role": "admin", "position": "manager", "timetable": {"monday": "8:00-16:00", "tuesday": "8:00-16:00", "wednesday": "8:00-16:00", "thursday": "8:00-16:00", "friday": "8:00-16:00"}});
    t.ok(result, 'User should be updated successfully');
  });

  test('Test deleteUser function', function(t) {
    let result = deleteUser_({"email": "test@gmail.com", });
    t.ok(result, 'User should be deleted successfully');
  });

  test('Test getUserPictureUrl function', function(t) {
    t.skip('Getting user picture URL is not possible with @gmail.com email');
    let url = getUserPictureUrl('radoslavdimitrov_j20@schoolmath.eu');
    t.ok(url, 'User picture URL should be retrieved');
  });

  test('Test getUserEmail_ function', function(t) {
    let email = getUserEmail_();
    t.ok(email, 'User email should be retrieved');
  });

  test('Test getUserWorkspace_ function', function(t) {
    let workspace = getUserWorkspace_();
    t.ok(workspace, 'User workspace should be retrieved');
  });

  test('Test getWorkspaceId_ function', function(t) {
    let workspaceId = getWorkspaceId_();
    t.ok(workspaceId, 'Workspace ID should be retrieved');
  });

  test.finish();
}