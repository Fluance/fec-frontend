var API_LOCALHOST = {
    BASE_URL: 'http://localhost:8080/',
    API_URL: '',
    API_AUTH: '/auth',
    API_CLIENT_TOKEN: ''
};

// Change the value of the HOST variable choose the server
var HOST = HOST_MOJITO;

var SERVER_API_BASE = HOST.API_URL,
    SERVER_BASE_URL = HOST.BASE_URL,
    SERVER_NOTES_API_BASE = HOST.API_URL,
    AUTH_API_BASE = HOST.API_URL,
    EHPROFILE_API_BASE = HOST.API_URL,
    FULL_TEXT_SEARCH_API_BASE = HOST.API_URL,
    CLIENT_API_BASE = HOST.API_URL,
    METEO_API_BASE = HOST.API_URL,
    REPORT_EMAIL_API_BASE = HOST.API_URL,
    SERVER_PATIENT_DOCUMENTS_API_BASE = HOST.API_URL;

/**
 * Fluance eHealth Cockpit configuration file
 *
 * This file configure a build version.
 * It is managed by config.provider.js to load dynamically in Angular.
 * This file is checked at launch and block the app if wrong
 *
 * FOR DEPLOYMENT : You need to copy a config file from deployments folder
 * to keep configuration as expected.
 */
var APP_CONFIG = {
    'debug': true,
    'debugHttpEnabled': true,
    'debugUnhandledRejections': true,
    'title': 'eHealth Cockpit',
    'titleShort': 'FEC',
    'baseURL': SERVER_BASE_URL, // Webapp URL

    // Refactored Services on server DEV MW API 2.0.0
    'apiBase': SERVER_API_BASE,
    'apiBaseSet': [
        SERVER_API_BASE,
        SERVER_NOTES_API_BASE,
        AUTH_API_BASE,
        EHPROFILE_API_BASE,
        FULL_TEXT_SEARCH_API_BASE,
        CLIENT_API_BASE,
        METEO_API_BASE,
        REPORT_EMAIL_API_BASE,
        SERVER_PATIENT_DOCUMENTS_API_BASE
    ],
    'apiServer': SERVER_API_BASE + '/mw-app',
    'apiServerNotes': SERVER_NOTES_API_BASE + '/mw-app',
    'apiAuth': AUTH_API_BASE + HOST.API_AUTH,
    'apiEHProfile': EHPROFILE_API_BASE + '/ehprofile',
    'apiMeteoData': METEO_API_BASE,
    'apiFullTextSearch': FULL_TEXT_SEARCH_API_BASE + '/mw-app',
    'apiReportEmail': REPORT_EMAIL_API_BASE + '/integration/ccd',
    'apiServerDocuments': SERVER_PATIENT_DOCUMENTS_API_BASE + '/mw-app',
    'apiClient': EHPROFILE_API_BASE + '/ehprofile',
    'apiClientToken': HOST.API_CLIENT_TOKEN,

    'layoutTemplateURL': 'app/layout/shell.html',
    'defaultLang': 'en', // en, de, fr, it
    'fallbackLang': 'en', // en, IF YOU CHANGE THIS, you have to change also the fallbackPath in gulp.config.js
    'maintenance': false,
    'cache': true,
    /**
     * Logs are sent to a centralized server to help support team.
     * It send plain JSON to a graylog server.
     */
    'logSendReports': false,
    'logServerURL': '',
    'logWebInterfaceURL': '',

    /**
     * To link to the imaging we compose the url from these two params
     */
    'imagingURL': '',
    'imagingStartApp': '/start.app?ak=',
    /**
     * Relation table for our roles and api roles
     */
    'roles': {
        'administrative': ['administrative'],
        'financial': ['financial'],
        'nurse': ['nurse'],
        'physician': ['physician'],
        'sysadmin': ['sysadmin'],
        'trainee': ['trainee']
    },
    'customerName': '',
    "apiRequestTimeout": 50000,

    /**
     * Routing/navigation configuration section
     */
    'routing': {
        // Application's 'home' state
        'defaultState': { name: 'mycockpit' }, // { name: 'patient', params: { pid: 100163 } },

        // Excluded states
        'invalidStates': []
    },

    /**
     * Dashboard configuration
     */
    'dashboard': {
        componentsBase: 'app/dashboard/components/',
        components: [
            // Whiteboard Surgery dashboard calendar component
            {name: 'WhiteboardSurgeryCalendarDashboardComponent', path: 'whiteboardSurgeryCalendarDashboard/whiteboardSurgeryCalendarDashboard.service.js'},
            // In/Out Patients by unit: for physician and nurse
            { name: 'RoomListComponent', params: { by: 'units' }, roles: ['sysadmin', 'physician', 'nurse', 'trainee'], path: 'roomList/roomList.service.js' },
            // In/Out Patients by service: for physician and nurse
            { name: 'RoomListComponent', params: { by: 'services' }, roles: ['sysadmin', 'physician', 'nurse', 'trainee'], path: 'roomList/roomList.service.js' },
            // MyPatient: for physician
            { name: 'MyPatientComponent', roles: ['sysadmin', 'physician'], path: 'myPatient/myPatient.service.js' },
            // Patients Schedule by location (clinic): for nurse
            { name: 'MyAppointmentComponent', params: { by: 'location' }, roles: ['sysadmin', 'nurse', 'trainee'], path: 'myAppointment/myAppointment.service.js' },
            // Patients Schedule by user (patient): for physician
            { name: 'MyAppointmentComponent', params: { by: 'user' }, roles: ['sysadmin', 'physician'], path: 'myAppointment/myAppointment.service.js' },
            // Last Search: for all
            { name: 'MyLastSearchComponent', path: 'myLastSearch/myLastSearch.service.js' }
        ]
    },

    /**
     * MedLab add-on component
     */
    'medlab': {},

    /**
     * Notes and Picture button component
     */
    'note': {},

    /**
     * Shift Patient List add-on component
     */
    'shiftPatientList': {},

    /**
     * Feature of productivity tie-ins
     */
    'productivityTieIns': {},

    /**
     * Meteo Data button component
     */
    'meteoData': {
        'isActive': true
    },

    /**
     * Radiology report email
     */
    //'imagingReportEmailing': {
    //    'apiReportEmail': REPORT_EMAIL_API_BASE + '/integration/ccd'
    //},

    /**
     * Chat Bot component
     */
    'chatBot': {
        'chatBotUrl': ''
    },

    /**
     * Tutorial
     */
    // 'tutorial': {},

    /*
     * Multi session feature
     */
    /*
    'multiSession': {
        'apiBase': '',
        'showForSharedUsers': false,
        'isDeviceLogoutEnabled': true
    },*/

    /*
     * Patient Documents feature
     */
    'patientDocuments': {
        active: false, // patient documents
        generateDocumentEnabled: false // patient prescriptions (eg: pdf)
    },

    /*
     * Patient View feature
    */
    'patientView': {
        disableNavigation: true
    },

    /*
     * Whiteboard
     */
    "whiteboard": {
        active: true,
        autoRefreshInterval: 30, // seconds
        symbolsBedsInRoom: {
            companyId: 5,
            byDoor: { number: '1', symbol: 'LOCATION_DOOR' },
            byWindow: { number: '2', symbol: 'LOCATION_WINDOW' },
            roomExceptions: ['245', '246']
        },
        highlightOperationToday: true,
        tomorrowWhiteboardEnabled: true,
        configurationEnabled: true,
    },

    /*
     * Whiteboard Surgery
     */
    "whiteboardSurgery": {
        autoRefreshInterval: 60, // seconds
        autoScrollResetTime: 180, // seconds until auto scroll is reactivated, when user doesn't scroll anymore
        operatingTimesRefreshInterval: 10, // interval of reloading the operating times in seconds

        autoRefreshIntervalComment: 60, // seconds
        autoScrollResetTimeAfterSaveComment: 0, // seconds until auto scroll is reactivated, when user edited comment

        operationRooms: { // Company ID as key, operation rooms as value as a String Array
            3: [],
            4: [],
            5: [],
            6: [],
            7: [],
            8: [],
            9: [],
            10: [],
            11: [],
            12: [],
            13: [],
            15: [],
            18: []
        },
        resource: {
            occupations: [
                {codeOccupation:'', iconType: 'doctor', translation: 'whiteboardSurgery.PERSONNEL_OCCUPATION_OPERATOR'},
                {codeOccupation:'', iconType: 'anesthetist', translation: 'whiteboardSurgery.PERSONNEL_OCCUPATION_ANESTHETIST'},
                {codeOccupation:'', iconType: 'doctor', translation: 'whiteboardSurgery.PERSONNEL_OCCUPATION_ASSISTANT'},
                {codeOccupation:'', iconType: 'employee', translation: 'whiteboardSurgery.PERSONNEL_OCCUPATION_ANESTHESIA_STAFF'},
                {codeOccupation:'', iconType: 'employee', translation: 'whiteboardSurgery.PERSONNEL_OCCUPATION_INSTRUMENTALIST'},
                {codeOccupation:'', iconType: 'employee', translation: 'whiteboardSurgery.PERSONNEL_OCCUPATION_ROOM_HELPER'},
                {codeOccupation:'', iconType: 'employee', translation: 'whiteboardSurgery.PERSONNEL_OCCUPATION_ASSISTANT'}
            ]
        }
    },

    //Disable reporting feature temporarily
    'reporting': {
        //'issuer': 'partner1-reporting',
        'forceButtonDisabled': false,
        'apiBase': '',
        'urlBase': ''
    },

    'company': {
        'logoUrlBase': '/content/images/logos/company/'
    },

    'accessControl': {
        'navigationComponents': {
            'fecPatientNavigationButtonPrescription': {
                disabledForRoles: ['trainee']
            },
            'whiteboardEditDialog': {
                readOnlyRoles: ['trainee']
            },
            'whiteboardRoomConfigurationDialog': {
                readOnlyRoles: ['trainee']
            },
            'fecNote': {
                editonDisabledForRoles: ['trainee']
            },
            'fecNoteCategoriesList': {
                editonDisabledForRoles: ['trainee']
            },
            'fecNoteCategoryListActions': {
                editonDisabledForRoles: ['trainee']
            },
            'fecNoteListItem': {
                editonDisabledForRoles: ['trainee']
            }
        },
        'states': {
            'admin': {
                restrictToRoles: ['sysadmin']
            },
            'adminUsers': {
                restrictToRoles: ['sysadmin']
            },
            'adminUsersProfile': {
                restrictToRoles: ['sysadmin']
            },
            'adminUsersForm': {
                restrictToRoles: ['sysadmin']
            },
            'icdChopList': {
                restrictToRoles: ['sysadmin', 'physician', 'nurse', 'patient', 'trainee']
            },
            'imagingList': {
                restrictToRoles: ['sysadmin', 'physician', 'nurse', 'patient', 'trainee']
            },
            'invoiceListByGuarantor': {
                restrictToRoles: ['sysadmin', 'financial', 'patient']
            },
            'invoiceListByVisit': {
                restrictToRoles: ['sysadmin', 'financial']
            },
            'invoice': {
                restrictToRoles: ['sysadmin', 'financial']
            },
            'labList': {
                restrictToRoles: ['sysadmin', 'nurse', 'patient', 'physician', 'trainee']
            },
            'policyList': {
                restrictToRoles: ['sysadmin', 'financial', 'patient', 'guarantor']
            },
            'policy': {
                restrictToRoles: ['sysadmin', 'financial', 'patient', 'guarantor']
            },
            'whiteboard': {
                restrictToRoles: ['sysadmin', 'physician', 'nurse', 'trainee', 'trainee']
            }
        }
    }
};
