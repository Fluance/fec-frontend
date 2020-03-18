var SERVER_API_BASE = '',
    SERVER_NOTES_API_BASE = '',
    AUTH_API_BASE = '',
    EHPROFILE_API_BASE = '',
    FULL_TEXT_SEARCH_API_BASE = '',
    CLIENT_API_BASE = '',
    REPORTING_API_BASE = '',
    METEO_API_BASE = '',
    REPORT_EMAIL_API_BASE = '',
    SERVER_PATIENT_DOCUMENTS_API_BASE = '';

/**
 * Fluance e-health Cockpit configuration file
 *
 * This file configure a builded version.
 * It is managed by config.provider.js to load dynamicaly in Angular.
 * This file is check at launch and block the app if wrong
 */
var APP_CONFIG = {
    'debug': true,
    'debugHttpEnabled': true,
    'debugUnhandledRejections': true,
    'title': 'eHealth Cockpit - Dev',
    'titleShort': 'FEC',
    'baseURL': '', // Webapp URL

    // Refactored Services on server DEV MW API 2.0.0
    'apiBaseSet': [
        SERVER_API_BASE,
        SERVER_NOTES_API_BASE,
        AUTH_API_BASE,
        EHPROFILE_API_BASE,
        FULL_TEXT_SEARCH_API_BASE,
        CLIENT_API_BASE,
        REPORTING_API_BASE,
        METEO_API_BASE,
        REPORT_EMAIL_API_BASE,
        SERVER_PATIENT_DOCUMENTS_API_BASE
    ],
    'apiServer': SERVER_API_BASE + '/mw-app',
    'apiServerNotes': SERVER_NOTES_API_BASE + '/mw-app',
    'apiAuth': AUTH_API_BASE + '/auth',
    'apiEHProfile': EHPROFILE_API_BASE + '/ehprofile',
    'apiFullTextSearch': FULL_TEXT_SEARCH_API_BASE + '/mw-app',
    'apiServerDocuments': SERVER_PATIENT_DOCUMENTS_API_BASE + '/mw-app',
    'apiClient': EHPROFILE_API_BASE + '/ehprofile',
    'apiMeteoData': METEO_API_BASE,
    'apiClientToken': '',
    'apiRequestTimeout': 50000,

    'layoutTemplateURL': 'app/layout/shell.html',
    'defaultLanguage': 'en', // en, de, fr, it
    'maintenance': false,
    /**
     * Logs are sended to a centralized server to help support team.
     * It send plain JSON to a graylog server.
     */
    'logSendReports': true,
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
        'invalidStates': [
        ]
    },

    /**
     * Dashboard configuration
     */
    'dashboard': {
        componentsBase: 'app/dashboard/components/',
        components: [
            // In/Out Patients by unit: for physician and nurse
            { name: 'RoomListComponent', params: { by: 'units' }, roles: ['sysadmin', 'physician', 'nurse'], path: 'roomList/roomList.service.js' },
            // In/Out Patients by service: for physician and nurse
            { name: 'RoomListComponent', params: { by: 'services' }, roles: ['sysadmin', 'physician', 'nurse'], path: 'roomList/roomList.service.js' },
            // MyPatient: for physician
            { name: 'MyPatientComponent', roles: ['sysadmin', 'physician'], path: 'myPatient/myPatient.service.js' },
            // Patients Schedule by location (clinic): for nurse
            { name: 'MyAppointmentComponent', params: { by: 'location' }, roles: ['sysadmin', 'nurse'], path: 'myAppointment/myAppointment.service.js' },
            // Patients Schedule by user (patient): for physician
            { name: 'MyAppointmentComponent', params: { by: 'user' }, roles: ['sysadmin', 'physician'], path: 'myAppointment/myAppointment.service.js' },
            // Last Search: for all
            { name: 'MyLastSearchComponent', path: 'myLastSearch/myLastSearch.service.js' }
        ]
    },

    /**
     * MedLab add-on component
     */
    'medlab': {
    },

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
    'imagingReportEmailing': {
        'apiReportEmail': REPORT_EMAIL_API_BASE + '/integration/ccd'
    },

    /**
     * Chat Bot component
     */
    //'chatBot': {
    //    'chatBotUrl': ''
    //},

    /**
     * Tutorial
     */
    // 'tutorial': {},

    /*
     * Multi session feature
     */
    'multiSession': {
        'apiBase': '',
        'isDeviceLogoutEnabled': true
    },

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
            roomExceptions: ['245', '246']
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
    },

    'company': {
        'logoUrlBase': '/content/images/logos/company/'
    },

    'accessControl': {
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
                restrictToRoles: ['sysadmin', 'physician', 'nurse', 'patient']
            },
            'imagingList': {
                restrictToRoles: ['sysadmin', 'physician', 'nurse', 'patient']
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
                restrictToRoles: ['sysadmin', 'nurse', 'patient', 'physician']
            },
            'policyList': {
                restrictToRoles: ['sysadmin', 'financial', 'patient', 'guarantor']
            },
            'policy': {
                restrictToRoles: ['sysadmin', 'financial', 'patient', 'guarantor']
            },
            'whiteboard': {
                restrictToRoles: ['sysadmin', 'physician', 'nurse']
            }
        }
    }
};
