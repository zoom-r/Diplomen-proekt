function testGetUserFromDB() {
    let test = new GasTap();

    // Mocking createDBConnection_ to return a valid connection
    test('Test getUserFromDB_ function - successful retrieval', function(t) {
        let originalCreateDBConnection = createDBConnection_;
        createDBConnection_ = function() {
            return {
                prepareStatement: function(query) {
                    return {
                        setString: function(index, value) {},
                        executeQuery: function() {
                            return {
                                next: function() { return true; },
                                getString: function(column) { return 'test'; },
                                getObject: function(column) { return {}; }
                            };
                        },
                        close: function() {}
                    };
                },
                close: function() {}
            };
        };

        // Mocking User.createFromResultSet to return a mock user object
        let originalCreateFromResultSet = User.createFromResultSet;
        User.createFromResultSet = function(rs) {
            return { id: '1', email: 'test@example.com', names: 'Test User', phone: '1234567890', role: 'admin', position: 'manager' };
        };

        let user = getUserFromDB_('test@example.com');
        t.ok(user, 'User should be retrieved successfully');
        t.equal(user.email, 'test@example.com', 'User email should match');

        // Restore original functions
        createDBConnection_ = originalCreateDBConnection;
        User.createFromResultSet = originalCreateFromResultSet;
    });

    // Mocking createDBConnection_ to return null
    test('Test getUserFromDB_ function - null connection', function(t) {
        let originalCreateDBConnection = createDBConnection_;
        createDBConnection_ = function() {
            return null;
        };

        let user = getUserFromDB_('test@example.com');
        t.notOk(user, 'User should not be retrieved when connection is null');

        // Restore original function
        createDBConnection_ = originalCreateDBConnection;
    });

    // Mocking createDBConnection_ to throw an error
    test('Test getUserFromDB_ function - database query error', function(t) {
        let originalCreateDBConnection = createDBConnection_;
        createDBConnection_ = function() {
            return {
                prepareStatement: function(query) {
                    return {
                        setString: function(index, value) {},
                        executeQuery: function() {
                            throw new Error('Simulated database query error');
                        },
                        close: function() {}
                    };
                },
                close: function() {}
            };
        };

        let user = getUserFromDB_('test@example.com');
        t.notOk(user, 'User should not be retrieved when there is a database query error');

        // Restore original function
        createDBConnection_ = originalCreateDBConnection;
    });

    // Real function test without mocking
    test('Test getUserFromDB_ function - real connection', function(t) {
        let user = getUserFromDB_('realuser@example.com');
        let user1 = getUserFromDB_(null);
        t.notOk(user, 'User should not be retrieved when using non existent email');
        t.ok(user1, 'User should be retrieved when using a valid email');
    });

    test.finish();
}