// @ts-nocheck
function testCreateUser() {
    var test = new GasTap();
    // Test createUser_ function - successful creation
    test('Test createUser_ function - successful creation', function (t) {
        const user = new User('1', 'Test User', 'test@example.com', 'admin', 'manager', 'workspace_id', 'declarations_key', 'notifications_key');
        // Mock createDBConnection_ to simulate a successful connection
        const originalCreateDBConnection = createDBConnection_;
        createDBConnection_ = function () {
            return {
                prepareStatement: function (query) {
                    return {
                        setString: function (index, value) { },
                        executeUpdate: function () { return 1; },
                        close: function () { }
                    };
                },
                close: function () { }
            };
        };
        const result = createUser_(user);
        t.ok(result, 'User should be created successfully');
        // Restore the original function
        createDBConnection_ = originalCreateDBConnection;
    });
    // Test createUser_ function - null connection
    test('Test createUser_ function - null connection', function (t) {
        const originalCreateDBConnection = createDBConnection_;
        createDBConnection_ = function () { return null; };
        const user = new User('1', 'Test User', 'test@example.com', 'admin', 'manager', 'workspace_id', 'declarations_key', 'notifications_key');
        const result = createUser_(user);
        t.notOk(result, 'User should not be created when connection is null');
        createDBConnection_ = originalCreateDBConnection;
    });
    // Test createUser_ function - database query error
    test('Test createUser_ function - database query error', function (t) {
        const originalCreateDBConnection = createDBConnection_;
        createDBConnection_ = function () {
            return {
                prepareStatement: function (query) {
                    throw new Error('Simulated query error');
                },
                close: function () { }
            };
        };
        const user = new User('1', 'Test User', 'test@example.com', 'admin', 'manager', 'workspace_id', 'declarations_key', 'notifications_key');
        const result = createUser_(user);
        t.notOk(result, 'User should not be created when there is a database query error');
        createDBConnection_ = originalCreateDBConnection;
    });
    // Test createUser_ function - duplicate user creation
    test('Test createUser_ function - duplicate user creation', function (t) {
        const originalCreateDBConnection = createDBConnection_;
        createDBConnection_ = function () {
            return {
                prepareStatement: function (query) {
                    return {
                        setString: function (index, value) { },
                        executeUpdate: function () { return 0; },
                        close: function () { }
                    };
                },
                close: function () { }
            };
        };
        const user = new User('1', 'Test User', 'test@example.com', 'admin', 'manager', 'workspace_id', 'declarations_key', 'notifications_key');
        const result = createUser_(user);
        t.notOk(result, 'User should not be created when there is a duplicate user');
        createDBConnection_ = originalCreateDBConnection;
    });
    test.finish();
}
function testUpdateUser() {
    var test = new GasTap();
    // Test updateUser_ function
    test('Test updateUser_ function - successful update', function (t) {
        const originalCreateDBConnection = createDBConnection_;
        createDBConnection_ = function () {
            return {
                prepareStatement: function (query) {
                    return {
                        setString: function (index, value) { },
                        setObject: function (index, value) { },
                        executeUpdate: function () { return 1; },
                        close: function () { }
                    };
                },
                close: function () { }
            };
        };
        const timetable = new Table('1', Table.Days.Monday, [new Classes('first', '9:00', '10A')]);
        const user = new User('test@example.com', 'Test User', 'admin', 'manager', '1', '1234567890', timetable, 'workspace_id', 'declarations_key', 'notifications_key');
        const result = updateUser_(user);
        t.ok(result, 'User should be updated successfully');
        createDBConnection_ = originalCreateDBConnection;
    });
    test('Test updateUser_ function - null connection', function (t) {
        const originalCreateDBConnection = createDBConnection_;
        createDBConnection_ = function () { return null; };
        const timetable = new Table('1', Table.Days.Monday, [new Classes('first', '9:00', '10A')]);
        const user = new User('test@example.com', 'Test User', 'admin', 'manager', '1', '1234567890', timetable, 'workspace_id', 'declarations_key', 'notifications_key');
        const result = updateUser_(user);
        t.notOk(result, 'User should not be updated when connection is null');
        createDBConnection_ = originalCreateDBConnection;
    });
    test('Test updateUser_ function - database query error', function (t) {
        const originalCreateDBConnection = createDBConnection_;
        createDBConnection_ = function () {
            return {
                prepareStatement: function (query) {
                    throw new Error('Simulated query error');
                },
                close: function () { }
            };
        };
        const timetable = new Table('1', Table.Days.Monday, [new Classes('first', '9:00', '10A')]);
        const user = new User('test@example.com', 'Test User', 'admin', 'manager', '1', '1234567890', timetable, 'workspace_id', 'declarations_key', 'notifications_key');
        const result = updateUser_(user);
        t.notOk(result, 'User should not be updated when there is a database query error');
        createDBConnection_ = originalCreateDBConnection;
    });
    test.finish();
}
function testDeleteUser() {
    var test = new GasTap();
    // Test deleteUser_ function - successful deletion
    test('Test deleteUser_ function - successful deletion', function (t) {
        const originalCreateDBConnection = createDBConnection_;
        createDBConnection_ = function () {
            return {
                prepareStatement: function (query) {
                    return {
                        setString: function (index, value) { },
                        executeQuery: function () {
                            return {
                                next: function () { return true; },
                                getString: function (column) {
                                    if (column === 'notifications_key')
                                        return 'notifications_key';
                                    if (column === 'declarations_key')
                                        return 'declarations_key';
                                    return null;
                                }
                            };
                        },
                        executeUpdate: function () { return 1; },
                        close: function () { }
                    };
                },
                close: function () { }
            };
        };
        const result = deleteUser_('1');
        t.ok(result, 'User should be deleted successfully');
        // Restore the original function
        createDBConnection_ = originalCreateDBConnection;
    });
    // Test deleteUser_ function - null connection
    test('Test deleteUser_ function - null connection', function (t) {
        const originalCreateDBConnection = createDBConnection_;
        createDBConnection_ = function () { return null; };
        const result = deleteUser_('1');
        t.notOk(result, 'User should not be deleted when connection is null');
        createDBConnection_ = originalCreateDBConnection;
    });
    // Test deleteUser_ function - database query error
    test('Test deleteUser_ function - database query error', function (t) {
        const originalCreateDBConnection = createDBConnection_;
        createDBConnection_ = function () {
            return {
                prepareStatement: function (query) {
                    throw new Error('Simulated query error');
                },
                close: function () { }
            };
        };
        const result = deleteUser_('1');
        t.notOk(result, 'User should not be deleted when there is a database query error');
        createDBConnection_ = originalCreateDBConnection;
    });
    test.finish();
}
function testGetUserPictureUrl() {
    var test = new GasTap();
    // Test getUserPictureUrl function - successful retrieval
    test('Test getUserPictureUrl function - successful retrieval', function (t) {
        const originalGetUserEmail_ = getUserEmail_;
        const originalGetUserById_ = getUserById_;
        const originalPeopleSearchDirectoryPeople = People.People.searchDirectoryPeople;
        getUserEmail_ = function () { return 'test@example.com'; };
        getUserById_ = function (id) { return { email: 'test@example.com' }; };
        People.People.searchDirectoryPeople = function (params) {
            return {
                people: [
                    {
                        photos: [
                            { url: 'https://example.com/photo.jpg' }
                        ]
                    }
                ]
            };
        };
        const url = getUserPictureUrl();
        t.equal(url, 'https://example.com/photo.jpg', 'User picture URL should be retrieved successfully');
        // Restore the original functions
        getUserEmail_ = originalGetUserEmail_;
        getUserById_ = originalGetUserById_;
        People.People.searchDirectoryPeople = originalPeopleSearchDirectoryPeople;
    });
    // Test getUserPictureUrl function - default picture
    test('Test getUserPictureUrl function - default picture', function (t) {
        const originalGetUserEmail_ = getUserEmail_;
        const originalGetUserById_ = getUserById_;
        const originalPeopleSearchDirectoryPeople = People.People.searchDirectoryPeople;
        getUserEmail_ = function () { return 'test@example.com'; };
        getUserById_ = function (id) { throw new Error('User not found'); };
        People.People.searchDirectoryPeople = function (params) {
            return null;
        };
        const url = getUserPictureUrl();
        t.equal(url, 'https://lh3.googleusercontent.com/a-/AOh14Gj-cdUSUVoEge7rD5a063tQkyTDT3mripEuDZ0v=s100', 'Default picture URL should be returned');
        // Restore the original functions
        getUserEmail_ = originalGetUserEmail_;
        getUserById_ = originalGetUserById_;
        People.People.searchDirectoryPeople = originalPeopleSearchDirectoryPeople;
    });
    // Test getUserPictureUrl function - error during API call
    test('Test getUserPictureUrl function - error during API call', function (t) {
        const originalGetUserEmail_ = getUserEmail_;
        const originalGetUserById_ = getUserById_;
        const originalPeopleSearchDirectoryPeople = People.People.searchDirectoryPeople;
        getUserEmail_ = function () { return 'test@example.com'; };
        getUserById_ = function (id) { return { email: 'test@example.com' }; };
        People.People.searchDirectoryPeople = function (params) {
            throw new Error('Simulated API error');
        };
        const url = getUserPictureUrl();
        t.equal(url, 'https://lh3.googleusercontent.com/a-/AOh14Gj-cdUSUVoEge7rD5a063tQkyTDT3mripEuDZ0v=s100', 'Default picture URL should be returned when there is an API error');
        // Restore the original functions
        getUserEmail_ = originalGetUserEmail_;
        getUserById_ = originalGetUserById_;
        People.People.searchDirectoryPeople = originalPeopleSearchDirectoryPeople;
    });
    test.finish();
}
function testGetWorkspaceId() {
    var test = new GasTap();
    // Test getWorkspaceId_ function - successful retrieval
    test('Test getWorkspaceId_ function - successful retrieval', function (t) {
        const originalGetUserWorkspace_ = getUserWorkspace_;
        const originalCreateDBConnection = createDBConnection_;
        getUserWorkspace_ = function () { return 'example.com'; };
        createDBConnection_ = function () {
            return {
                prepareStatement: function (query) {
                    return {
                        setString: function (index, value) { },
                        executeQuery: function () {
                            return {
                                next: function () { return true; },
                                getString: function (column) {
                                    if (column === 'id')
                                        return 'workspace_id';
                                    return null;
                                }
                            };
                        },
                        close: function () { }
                    };
                },
                close: function () { }
            };
        };
        const workspaceId = getWorkspaceId_();
        t.equal(workspaceId, 'workspace_id', 'Workspace ID should be retrieved successfully');
        // Restore the original functions
        getUserWorkspace_ = originalGetUserWorkspace_;
        createDBConnection_ = originalCreateDBConnection;
    });
    // Test getWorkspaceId_ function - null connection
    test('Test getWorkspaceId_ function - null connection', function (t) {
        const originalCreateDBConnection = createDBConnection_;
        createDBConnection_ = function () { return null; };
        const workspaceId = getWorkspaceId_();
        t.notOk(workspaceId, 'Workspace ID should not be retrieved when connection is null');
        createDBConnection_ = originalCreateDBConnection;
    });
    // Test getWorkspaceId_ function - database query error
    test('Test getWorkspaceId_ function - database query error', function (t) {
        const originalCreateDBConnection = createDBConnection_;
        createDBConnection_ = function () {
            return {
                prepareStatement: function (query) {
                    throw new Error('Simulated query error');
                },
                close: function () { }
            };
        };
        const workspaceId = getWorkspaceId_();
        t.notOk(workspaceId, 'Workspace ID should not be retrieved when there is a database query error');
        createDBConnection_ = originalCreateDBConnection;
    });
    test.finish();
}
