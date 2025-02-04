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

    test.finish();
}

function testGetUserInfo() {
    let test = new GasTap();

    // Mocking userStore and createDBConnection_
    test('Test getUserInfo_ function - successful retrieval from local storage', function(t) {
        let originalUserStore = userStore;
        userStore = {
            get: function(key) {
                if (key === 'users') {
                  return { 'test@example.com': { email: 'test@example.com', names: 'Test User' } };
                }
                return null;
            },
            set: function(key, value) {}
        };

        let user = getUserInfo_('test@example.com');
        t.ok(user, 'User should be retrieved successfully from local storage');
        t.equal(user.email, 'test@example.com', 'User email should match');

        // Restore original userStore
        userStore = originalUserStore;
    });

    test('Test getUserInfo_ function - successful retrieval from database', function(t) {
        let originalUserStore = userStore;
        let originalCreateDBConnection = createDBConnection_;
        
        // In-memory storage to simulate userStore
        let mockStore = {};
        userStore = {
            get: function(key) {
                return mockStore[key];
            },
            set: function(key, value) {
                mockStore[key] = value;
            }
        };

        createDBConnection_ = function() {
            return {
                prepareStatement: function(query) {
                  Logger.log(query)
                    return {
                        setString: function(index, value) {},
                        executeQuery: function() {
                            return {
                                next: function() { return true; },
                                getString: function(column) {
                                    if (column === 'email') return 'test@example.com';
                                    if (column === 'names') return 'Test User';
                                    if (column === 'phone') return '1234567890';
                                    if (column === 'role') return 'teacher';
                                    if (column === 'position') return '_';
                                    return null;
                                },
                                getObject: function(column) {
                                    if (column === 'names') return 'Test User';
                                    return null;
                                },
                                getMetaData: function () { 
                                  return {
                                    getColumnCount: function () { return 5 }
                                  } 
                                }
                            };
                        },
                        close: function() {}
                    };
                },
                close: function() {}
            };
        };

        let user = getUserInfo_('test@example.com');
        t.ok(user, 'User should be retrieved successfully from database');
        t.equal(user.email, 'test@example.com', 'User email should match');
        t.equal(user.names, 'Test User', 'User names should match');

        // Restore original functions
        userStore = originalUserStore;
        createDBConnection_ = originalCreateDBConnection;
    });

    test('Test getUserInfo_ function - null connection', function(t) {
        let originalUserStore = userStore;
        let originalCreateDBConnection = createDBConnection_;
        userStore = {
            get: function(key) {
                return null;
            },
            set: function(key, value) {}
        };
        createDBConnection_ = function() {
            return null;
        };

        let user = getUserInfo_('test@example.com');
        t.notOk(user, 'User should not be retrieved when connection is null');

        // Restore original functions
        userStore = originalUserStore;
        createDBConnection_ = originalCreateDBConnection;
    });

    test('Test getUserInfo_ function - database query error', function(t) {
        let originalUserStore = userStore;
        let originalCreateDBConnection = createDBConnection_;
        userStore = {
            get: function(key) {
                return null;
            },
            set: function(key, value) {}
        };
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

        let user = getUserInfo_('test@example.com');
        t.notOk(user, 'User should not be retrieved when there is a database query error');

        // Restore original functions
        userStore = originalUserStore;
        createDBConnection_ = originalCreateDBConnection;
    });

    test('Test getUserInfo_ function - non-existent user', function(t) {
        let originalUserStore = userStore;
        let originalCreateDBConnection = createDBConnection_;
        userStore = {
            get: function(key) {
                return null;
            },
            set: function(key, value) {}
        };
        createDBConnection_ = function() {
            return {
                prepareStatement: function(query) {
                    return {
                        setString: function(index, value) {},
                        executeQuery: function() {
                            return {
                                next: function() { return false; },
                                getString: function(column) { return null; },
                                getObject: function(column) { return null; }
                            };
                        },
                        close: function() {}
                    };
                },
                close: function() {}
            };
        };

        let user = getUserInfo_('nonexistent@example.com');
        t.notOk(user, 'User should not be retrieved when user does not exist');

        // Restore original functions
        userStore = originalUserStore;
        createDBConnection_ = originalCreateDBConnection;
    });

    test.finish();
}

function testCreateUser() {
    let test = new GasTap();

    // Mocking createDBConnection_ to return a valid connection
    test('Test createUser_ function - successful creation', function(t) {
        let originalCreateDBConnection = createDBConnection_;
        createDBConnection_ = function() {
            return {
                prepareStatement: function(query) {
                    return {
                        setString: function(index, value) {},
                        executeUpdate: function() {
                            return 1; // Simulate successful insertion
                        },
                        close: function() {}
                    };
                },
                close: function() {}
            };
        };

        let user = {
            id: '1',
            name: 'Test User',
            email: 'test@example.com',
            role: 'admin',
            workspace_id: 'workspace_1',
            declarations_key: 'declarations_1',
            notifications_key: 'notifications_1'
        };

        let result = createUser_(user);
        t.ok(result, 'User should be created successfully');

        // Restore original function
        createDBConnection_ = originalCreateDBConnection;
    });

    // Mocking createDBConnection_ to return null
    test('Test createUser_ function - null connection', function(t) {
        let originalCreateDBConnection = createDBConnection_;
        createDBConnection_ = function() {
            return null;
        };

        let user = {
            id: '1',
            name: 'Test User',
            email: 'test@example.com',
            role: 'admin',
            workspace_id: 'workspace_1',
            declarations_key: 'declarations_1',
            notifications_key: 'notifications_1'
        };

        let result = createUser_(user);
        t.notOk(result, 'User should not be created when connection is null');

        // Restore original function
        createDBConnection_ = originalCreateDBConnection;
    });

    // Mocking createDBConnection_ to throw an error
    test('Test createUser_ function - database query error', function(t) {
        let originalCreateDBConnection = createDBConnection_;
        createDBConnection_ = function() {
            return {
                prepareStatement: function(query) {
                    return {
                        setString: function(index, value) {},
                        executeUpdate: function() {
                            throw new Error('Simulated database query error');
                        },
                        close: function() {}
                    };
                },
                close: function() {}
            };
        };

        let user = {
            id: '1',
            name: 'Test User',
            email: 'test@example.com',
            role: 'admin',
            workspace_id: 'workspace_1',
            declarations_key: 'declarations_1',
            notifications_key: 'notifications_1'
        };

        let result = createUser_(user);
        t.notOk(result, 'User should not be created when there is a database query error');

        // Restore original function
        createDBConnection_ = originalCreateDBConnection;
    });

    test.finish();
}

function testUpdateUser() {
    let test = new GasTap();

    // Mocking createDBConnection_ to return a valid connection
    test('Test updateUser_ function - successful update', function(t) {
        let originalCreateDBConnection = createDBConnection_;
        createDBConnection_ = function() {
            return {
                prepareStatement: function(query) {
                    return {
                        setString: function(index, value) {},
                        executeUpdate: function() {
                            return 1; // Simulate successful update
                        },
                        close: function() {}
                    };
                },
                close: function() {}
            };
        };

        let user = {
            name: 'Updated User',
            phone: '1234567890',
            role: 'admin',
            position: 'manager',
            timetable: 'new timetable',
            email: 'test@example.com'
        };

        let result = updateUser_(user);
        t.ok(result, 'User should be updated successfully');

        // Restore original function
        createDBConnection_ = originalCreateDBConnection;
    });

    // Mocking createDBConnection_ to return null
    test('Test updateUser_ function - null connection', function(t) {
        let originalCreateDBConnection = createDBConnection_;
        createDBConnection_ = function() {
            return null;
        };

        let user = {
            name: 'Updated User',
            phone: '1234567890',
            role: 'admin',
            position: 'manager',
            timetable: 'new timetable',
            email: 'test@example.com'
        };

        let result = updateUser_(user);
        t.notOk(result, 'User should not be updated when connection is null');

        // Restore original function
        createDBConnection_ = originalCreateDBConnection;
    });

    // Mocking createDBConnection_ to throw an error
    test('Test updateUser_ function - database query error', function(t) {
        let originalCreateDBConnection = createDBConnection_;
        createDBConnection_ = function() {
            return {
                prepareStatement: function(query) {
                    return {
                        setString: function(index, value) {},
                        executeUpdate: function() {
                            throw new Error('Simulated database query error');
                        },
                        close: function() {}
                    };
                },
                close: function() {}
            };
        };

        let user = {
            name: 'Updated User',
            phone: '1234567890',
            role: 'admin',
            position: 'manager',
            timetable: 'new timetable',
            email: 'test@example.com'
        };

        let result = updateUser_(user);
        t.notOk(result, 'User should not be updated when there is a database query error');

        // Restore original function
        createDBConnection_ = originalCreateDBConnection;
    });

    test.finish();
}

function testDeleteUser() {
    let test = new GasTap();

    // Mocking createDBConnection_ to return a valid connection
    test('Test deleteUser_ function - successful deletion', function(t) {
        let originalCreateDBConnection = createDBConnection_;
        createDBConnection_ = function() {
            return {
                prepareStatement: function(query) {
                    return {
                        setString: function(index, value) {},
                        executeUpdate: function() {
                            return 1; // Simulate successful deletion
                        },
                        close: function() {}
                    };
                },
                close: function() {}
            };
        };

        let user = {
            email: 'test@example.com',
            notifications_key: 'notifications_1',
            declarations_key: 'declarations_1'
        };

        let result = deleteUser_(user);
        t.ok(result, 'User should be deleted successfully');

        // Restore original function
        createDBConnection_ = originalCreateDBConnection;
    });

    // Mocking createDBConnection_ to return null
    test('Test deleteUser_ function - null connection', function(t) {
        let originalCreateDBConnection = createDBConnection_;
        createDBConnection_ = function() {
            return null;
        };

        let user = {
            email: 'test@example.com',
            notifications_key: 'notifications_1',
            declarations_key: 'declarations_1'
        };

        let result = deleteUser_(user);
        t.notOk(result, 'User should not be deleted when connection is null');

        // Restore original function
        createDBConnection_ = originalCreateDBConnection;
    });

    // Mocking createDBConnection_ to throw an error
    test('Test deleteUser_ function - database query error', function(t) {
        let originalCreateDBConnection = createDBConnection_;
        createDBConnection_ = function() {
            return {
                prepareStatement: function(query) {
                    return {
                        setString: function(index, value) {},
                        executeUpdate: function() {
                            throw new Error('Simulated database query error');
                        },
                        close: function() {}
                    };
                },
                close: function() {}
            };
        };

        let user = {
            email: 'test@example.com',
            notifications_key: 'notifications_1',
            declarations_key: 'declarations_1'
        };

        let result = deleteUser_(user);
        t.notOk(result, 'User should not be deleted when there is a database query error');

        // Restore original function
        createDBConnection_ = originalCreateDBConnection;
    });

    test.finish();
}

function testGetUserPictureUrl() {
    let test = new GasTap();

    // Mocking People.People.searchDirectoryPeople to return a valid picture URL
    test('Test getUserPictureUrl function - successful retrieval', function(t) {
        let originalSearchDirectoryPeople = People.People.searchDirectoryPeople;
        People.People.searchDirectoryPeople = function() {
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

        let email = 'test@example.com';
        let pictureUrl = getUserPictureUrl(email);
        t.equal(pictureUrl, 'https://example.com/photo.jpg', 'User picture URL should be retrieved successfully');

        // Restore original function
        People.People.searchDirectoryPeople = originalSearchDirectoryPeople;
    });

    // Mocking People.People.searchDirectoryPeople to throw an error
    test('Test getUserPictureUrl function - API call error', function(t) {
        let originalSearchDirectoryPeople = People.People.searchDirectoryPeople;
        People.People.searchDirectoryPeople = function() {
            throw new Error('Simulated API error');
        };

        let email = 'test@example.com';
        let pictureUrl = getUserPictureUrl(email);
        t.equal(pictureUrl, 'https://lh3.googleusercontent.com/a-/AOh14Gj-cdUSUVoEge7rD5a063tQkyTDT3mripEuDZ0v=s100', 'Default picture URL should be returned when there is an API error');

        // Restore original function
        People.People.searchDirectoryPeople = originalSearchDirectoryPeople;
    });

    // Mocking People.People.searchDirectoryPeople to return no picture
    test('Test getUserPictureUrl function - no picture found', function(t) {
        let originalSearchDirectoryPeople = People.People.searchDirectoryPeople;
        People.People.searchDirectoryPeople = function() {
            return { people: [] };
        };

        let email = 'test@example.com';
        let pictureUrl = getUserPictureUrl(email);
        t.equal(pictureUrl, 'https://lh3.googleusercontent.com/a-/AOh14Gj-cdUSUVoEge7rD5a063tQkyTDT3mripEuDZ0v=s100', 'Default picture URL should be returned when no picture is found');

        // Restore original function
        People.People.searchDirectoryPeople = originalSearchDirectoryPeople;
    });

    test.finish();
}

function testGetWorkspaceId() {
    let test = new GasTap();

    // Mocking createDBConnection_ to return a valid connection
    test('Test getWorkspaceId_ function - successful retrieval', function(t) {
        let originalCreateDBConnection = createDBConnection_;
        createDBConnection_ = function() {
            return {
                prepareStatement: function(query) {
                    return {
                        setString: function(index, value) {},
                        executeQuery: function() {
                            return {
                                next: function() { return true; },
                                getString: function(column) { return 'workspace_1'; }
                            };
                        },
                        close: function() {}
                    };
                },
                close: function() {}
            };
        };

        let originalGetUserWorkspace = getUserWorkspace_;
        getUserWorkspace_ = function() {
            return 'example.com';
        };

        let workspaceId = getWorkspaceId_();
        t.ok(workspaceId, 'Workspace ID should be retrieved successfully');
        t.equal(workspaceId, 'workspace_1', 'Workspace ID should match');

        // Restore original functions
        createDBConnection_ = originalCreateDBConnection;
        getUserWorkspace_ = originalGetUserWorkspace;
    });

    // Mocking createDBConnection_ to return null
    test('Test getWorkspaceId_ function - null connection', function(t) {
        let originalCreateDBConnection = createDBConnection_;
        createDBConnection_ = function() {
            return null;
        };

        let workspaceId = getWorkspaceId_();
        t.notOk(workspaceId, 'Workspace ID should not be retrieved when connection is null');

        // Restore original function
        createDBConnection_ = originalCreateDBConnection;
    });

    // Mocking createDBConnection_ to throw an error
    test('Test getWorkspaceId_ function - database query error', function(t) {
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

        let workspaceId = getWorkspaceId_();
        t.notOk(workspaceId, 'Workspace ID should not be retrieved when there is a database query error');

        // Restore original function
        createDBConnection_ = originalCreateDBConnection;
    });

    // Mocking createDBConnection_ to return no workspace
    test('Test getWorkspaceId_ function - non-existent workspace', function(t) {
        let originalCreateDBConnection = createDBConnection_;
        createDBConnection_ = function() {
            return {
                prepareStatement: function(query) {
                    return {
                        setString: function(index, value) {},
                        executeQuery: function() {
                            return {
                                next: function() { return false; },
                                getString: function(column) { return null; }
                            };
                        },
                        close: function() {}
                    };
                },
                close: function() {}
            };
        };

        let workspaceId = getWorkspaceId_();
        t.notOk(workspaceId, 'Workspace ID should not be retrieved when workspace does not exist');

        // Restore original function
        createDBConnection_ = originalCreateDBConnection;
    });

    test.finish();
}