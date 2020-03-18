var SERVER_API_BASE = '',
    SERVER_NOTES_API_BASE = '',
    AUTH_API_BASE = '',
    EHPROFILE_API_BASE = '',
    FULL_TEXT_SEARCH_API_BASE = '',
    CLIENT_API_BASE = '',
    REPORTING_API_BASE = '';

/**
 * Fluance e-health Cockpit configuration file
 *
 * This file configure a builded version.
 * It is managed by config.provider.js to load dynamicaly in Angular.
 * This file is check at launch and block the app if wrong
 */
var APP_CONFIG = {
    'debug': false,
    'title': 'eHealth Cockpit',
    'titleShort': 'FEC',
    'baseURL': '', // Webapp URL

    // Server PRE-PROD
    'apiBaseSet': [
        SERVER_API_BASE,
        SERVER_NOTES_API_BASE,
        AUTH_API_BASE,
        EHPROFILE_API_BASE,
        FULL_TEXT_SEARCH_API_BASE,
        CLIENT_API_BASE,
        REPORTING_API_BASE
    ],
    'apiServer': SERVER_API_BASE + '/mw-app',
    'apiServerNotes': SERVER_NOTES_API_BASE + '/mw-app',
    'apiAuth': AUTH_API_BASE + '/auth',
    'apiEHProfile': EHPROFILE_API_BASE + '/ehprofile',
    'apiFullTextSearch': FULL_TEXT_SEARCH_API_BASE + '/mw-app',
    'apiClient': EHPROFILE_API_BASE + '/ehprofile',
    'apiClientToken': '',
    "apiRequestTimeout": 50000,

    'layoutTemplateURL': 'app/layout/shell.html',
    'defaultLanguage': 'en', // en, de, fr, it
    'maintenance': false,
    'cache': true,
    /**
     * Logs are sended to a centralized server to help support team.
     * It send plain JSON to a graylog server.
     */
    'logSendReports': true,
    'logServerURL': '',
    'logWebInterfaceURL': '',

    // Telemis access
    // URL build using imagingURL + $translate.use().toUpperCase() + imagingStartApp + pid
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
        'sysadmin': ['sysadmin']
    },
    'customerName': '',

    /**
     * Routing/navigation configuration section
     */
    'routing': {
        // Application's 'home' state
        'defaultState': { name: 'mycockpit' },

        // Excluded states
        'invalidStates': []
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
     * Tutorial
     */
    // 'tutorial': {},

    /*
     * Multi session feature
     */
    //'multiSession': {
    //    'apiBase': '',
    //    'showForSharedUsers': false,
    //    'isDeviceLogoutEnabled': true
    //},

    /*
     * Patient Documents feature
     */
    'patientDocuments': {
        active: false, // patient documents button
        generateDocumentEnabled: false // generate patient prescriptions button (eg: pdf)
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
            roomExceptions: ['245','246']
        },
        highlightOperationToday: true,
        tomorrowWhiteboardEnabled: true,
        configurationEnabled: true
    },

    'reporting': {
        //'issuer': 'partner1-reporting',
        'forceButtonDisabled': false,
        'apiBase': REPORTING_API_BASE + '/ehprofile/partners/partner1-reporting',
        'urlBase': ''
    }
};
