/* jshint -W117, -W030 */
describe('dataservice.users', function() {
    /*var timeout;
    var q;
    var users;
    var httpBackend;

    beforeEach(module('app.core'));
    beforeEach(function() {
        inject(['$timeout', '$q', 'dataservice.users', '$httpBackend', 'config',
            function($timeout, $q, service, $httpBackend, config) {
                timeout = $timeout;
                q = $q;
                users = service;
                httpBackend = $httpBackend;

                // Normal user request
                $httpBackend
                    .whenGET(config.apiServer + '/user/info/FluanceTestUser2')
                    .respond({ 'userInfo': { 'username': 'LOCAL-TEST/FluanceTestUser2' } });

                $httpBackend
                    .whenGET(config.apiServer + '/user/profile/FluanceTestUser2')
                    .respond({
                        'userProfile': {
                            'addresses': {
                                'addresses': [{
                                    'value': 4500,
                                    'type': 'postalCode'
                                }, {
                                    'value': 'Solothurn',
                                    'type': 'locality'
                                }]
                            },
                            'name': {
                                'name': {
                                    'familyName': 'FluanceTestUser2',
                                    'givenName': '...'
                                }
                            },
                            'emails': {
                                'emails': {
                                    'value': 'FluanceTestUser2@fluance.ch',
                                    'type': 'work'
                                }
                            },
                            'id': '6592ede2-eff2-40c6-98e6-fa71215edce7',
                            'preferredLanguage': 'fr',
                            'userName': 'LOCAL-TEST/FluanceTestUser2',
                            'companies': {
                                'companies': {
                                    'id': 8,
                                    'Units': [31, 32, '3P'],
                                    'staffId': null
                                }
                            },
                            'roles': null,
                            'preferences': {
                                'lastCompany': 8,
                                'lastUnit': 31
                            }
                        }
                    });

                // User with corrupted profile
                $httpBackend
                    .whenGET(config.apiServer + '/user/info/FluanceTestUser3')
                    .respond({ 'userInfo': { 'username': 'LOCAL-TEST/FluanceTestUser3' } });

                $httpBackend
                    .whenGET(config.apiServer + '/user/profile/FluanceTestUser3')
                    .respond({
                        'userProfile': {
                            'emails': {
                                'value': 'FluanceTestUser2@fluance.ch',
                                'type': 'work'
                            }
                        }
                    });

                // User exist but has no profile
                $httpBackend
                    .whenGET(config.apiServer + '/user/info/FluanceTestUser4')
                    .respond({ 'userInfo': { 'username': 'LOCAL-TEST/FluanceTestUser4' } });

                $httpBackend
                    .whenGET(config.apiServer + '/user/profile/FluanceTestUser4')
                    .respond(404, { 'Error': { 'code': '404', 'description': 'User not found' } });

                // User does not exist
                $httpBackend
                    .whenGET(config.apiServer + '/user/info/abcd')
                    .respond({ 'userInfo': { 'username': null } });

            }
        ]);
    });

    it('Get User should return full object', function(done) {
        users
            .getUser('FluanceTestUser2')
            .then(function(res) {
                expect(res.fullUsername).toBeDefined();
                expect(res.hasProfile).toBeDefined();
                expect(res.id).toBeDefined();
                expect(res.username).toBeDefined();
                expect(res.lastName).toBeDefined();
                expect(res.firstName).toBeDefined();
                expect(res.emails).toBeDefined();
                expect(res.addresses).toBeDefined();
                expect(res.companies).toBeDefined();
                expect(res.lastCompany).toBeDefined();
                expect(res.lastUnit).toBeDefined();
                expect(res.preferredLanguage).toBeDefined();
                expect(res.roles).toBeDefined();

                // Check if values are array
                expect(Array.isArray(res.emails)).toBe(true);
                expect(Array.isArray(res.addresses)).toBe(true);
                expect(Array.isArray(res.companies)).toBe(true);
                expect(Array.isArray(res.roles)).toBe(true);
            })
            .catch(function(exception) {
                expect(res).toBeUndefined(exception);
            })
            .finally(done);
        httpBackend.flush();
    });

    it('User profileIsCorrupted exception is trigger', function(done) {
        users
            .getUser('FluanceTestUser3')
            .then(function(res) {
                expect(res).toBeUndefined();
            })
            .catch(function(exception) {
                expect(exception.hasEmptyProfile).toBeUndefined();
                expect(exception.profileCorrupted).toBe(true);
            })
            .finally(done);
        httpBackend.flush();
    });

    it('User hasEmptyProfile exception is trigger', function(done) {
        users
            .getUser('FluanceTestUser4')
            .then(function(res) {
                expect(res).toBeUndefined();
            })
            .catch(function(exception) {
                expect(exception.hasEmptyProfile).toBe(true);
                expect(exception.profileCorrupted).toBeUndefined();
            })
            .finally(done);
        httpBackend.flush();
    });

    it('User does not exist', function(done) {
        users
            .getUser('abcd')
            .then(function(res) {
                expect(res).toBeUndefined();
            })
            .catch(function(exception) {
                expect(exception.status).toEqual(404);
                expect(exception.hasEmptyProfile).toBeUndefined();
                expect(exception.profileCorrupted).toBeUndefined();
            })
            .finally(done);
        httpBackend.flush();
    });*/

});
