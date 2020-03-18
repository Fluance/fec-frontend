/*jshint -W101*/ //  Line too long

(function() {
    'use strict';

    angular
        .module('appMock', [
            'ngMockE2E'
        ])

        .run(['$httpBackend', 'config',
            function($httpBackend, config) {
                var mockData = initializeMockData();

                // Auth
                $httpBackend.whenPOST(config.apiAuth + '/oauth2/token').respond(mockData.authorizationToken);

                // client
                $httpBackend.whenGET(/\/userdata\//).respond(mockData.clientData);
                $httpBackend.whenPOST(/\/userdata\//).respond(function() { return [204]; });

                // eh-profile
                $httpBackend.whenGET(config.apiEHProfile + '/dataproviders').respond(mockData.dataProviders);
                $httpBackend.whenGET(config.apiEHProfile + '/profile/my').respond(mockData.userData);

                // mw-app - companies
                $httpBackend.whenGET(config.apiServer + '/companies').respond(mockData.companies);
                $httpBackend.whenGET(/\/companies\/(.*)\/rooms/).respond(mockData.rooms);
                $httpBackend.whenGET(/\/companies\/(.*)$/, undefined, undefined, ['id'])
                    .respond(function(method, url, data, headers, params) {
                        return [200, mockData.companies[0]];
                    });

                // mw-app - patients
                $httpBackend.whenGET(/\/patients\?/).respond(mockData.patients);
                $httpBackend.whenGET(/\/appointments\?/).respond([]);
                $httpBackend.whenGET(/\/appointments\/mypatients\?/).respond([]);

                // Application content
                $httpBackend.whenGET(/^app\//).passThrough();
            }
        ]);

    function initializeMockData() {
        var ds = {};

        // ------------------------------------------------------------------------- Authentication
        ds.authorizationToken = {
            accessToken: 'at',
            refreshToken: 'rt',
            expirationDate: '2100-01-01'
        };

        // --------------------------------------------------------------------------------- client
        ds.clientData = {
        };

        // ----------------------------------------------------------------------------- eh-Profile
        ds.dataProviders = [
        ];

        ds.userData = {
            id: 1,
            domain: 'mock-domain',
            username: 'mock',

            firstName: 'Mr',
            lastName: 'X',

            profile: {
                language: 'en',
                grants: {
                    roles: ['nurse', 'physician', 'sysadmin'],
                    companies: [
                        {
                            id: 1,
                            hospservices: [
                                { code: 'hs11' },
                                { code: 'hs12' }
                            ],
                            patientunits: [
                                { code: 'u11' },
                                { code: 'u12' }
                            ],
                            staffids: [
                                { staffid: 1234, providerid: 1 }
                            ]
                        }
                    ]
                }
            }
        };

        // --------------------------------------------------------------------- mw-app / companies
        ds.companies = [
            {
                id: 1,
                code: 'comp1',
                name: 'Company 1',
                hospServices: [
                    { hospService: 'hs11', hospServiceDesc: 'Hosp Serice 1.1' },
                    { hospService: 'hs12', hospServiceDesc: 'Hosp Serice 1.2' }
                ],
                units: [
                    { patientUnit: 'u11', codeDesc: 'Unit 1.1' },
                    { patientUnit: 'u12', codeDesc: 'Unit 1.2' }
                ],
            }
        ];

        ds.rooms = [
            { patientRoom: '0', nbPatients: 3 },
            { patientRoom: '101', nbPatients: 3 },
            { patientRoom: '103', nbPatients: 3 },
            { patientRoom: '104', nbPatients: 3 },
            { patientRoom: '105', nbPatients: 3 },
            { patientRoom: '106', nbPatients: 3 },
            { patientRoom: '107', nbPatients: 3 }
        ];

        var COUNT_PATIENTS = 15;
        ds.patients = [];
        for (var i = 0; i < COUNT_PATIENTS; i++) {
            var room = ds.rooms[Math.floor((Math.random() * ds.rooms.length))];
            ds.patients.push({
                patientInfo: {
                    pid: i,
                    firstName: 'fn_' + 1,
                    lastName: 'ln_' + i,
                    maidenName: null,
                    birthDate: '1980-01-01',
                    sex: 'm'
                },
                lastVisit: {
                    patientroom: room.patientRoom
                },
                nbRecords: COUNT_PATIENTS
            });
        }

        return ds;
    }
})();
