import angular from 'angular';
import { VERSION } from '../version';

configProvider.$inject = [];

/**
 * @ngdoc provider
 * @module config
 * @name configProvider
 * @description
 *
 * ConfigProvider to manage config file on load and on execution.
 *
 * This is a `Provider` so it can be injected as 'configProvider' in *configuration* phase
 * and injected as 'config' in *run* phase.
 * In *configuration* phase, it returns a `Provider` object. `Config` is available in obj.config.
 * In *run* phase, it returns a config object directly.
 *
 * Inject in `Provider`:
 * ```
 *    angular
 *      .module('myModule')
 *      .provider('myProvider', providerFn);
 *
 *    providerFn.$inject = ['$logProvider', 'configProvider'];
 *    function providerFn($logProvider, configProvider) {
 *        configProvider.config.appTitle;
 *    }
 * ```
 */

/**
 * @ngdoc service
 * @module config
 * @name config
 * @description
 *
 * `Config` is a service based on  {@link configProvider configProvider}
 *
 * You can only access {@link configProvider#config config property}
 * since $get return `configProvider.$get = config;`
 *
 * ## How to Inject in module
 *
 angular.module('myModule').controller('myController', controllerFct);
 controllerFct.$inject = ['config'];
 function controllerFct(config) {
            config.appTitle;
        }
 */
function configProvider() {
    /* jshint validthis:true */
    /**
     * @ngdoc property
     * @name configProvider#config
     * @description
     *
     * Object containing all information about the user. To store the profile we just need
     * to stringify this object and save it in a storage engine. It is used to configure a build version.
     * > FOR DEPLOYMENT: Need to copy a config file from *deployments* folder
     * to keep configuration as expected.
     *
     * ##### General
     * | Property           | Type     | Description             |
     * | ------------------ |----------| ------------------------|
     * | title              | String   | Title of the app visible on login page. *Eg: 'eHealth Cockpit'*   |
     * | titleShort         | String   | Title of the app visible on the browser (tab). *Eg: 'FEC'*   |
     * | baseURL            | String   | URL of instance of WebApp. Used as identification in mails and logs. *Eg: http://localhost:3000, http://localhost:8001*  |
     * | externalAccessor   | Boolean  | Identify origin (*internal* or *external*) of current user (read DMZ header with interceptor)    |
     * | application_name   | String   | Application name for graylist filter. *Eg: 'eHealth Cockpit'*   |
     * | customerName       | String   | Name of the customer, used in the title of the Service Provider page. *Eg: ''*.      |
     * | hostname           | String   | Hostname of current machine. Can be found using hostname unix cmd. |
     * | scrollTop          | Number   | Set value (in px) when to display scrollTop button. *Eg: 1000* |
     * | layoutTemplateURL  | String   | URL of the main layout template for the application. *Eg: 'app/layout/shell.html'*.     |
     * | defaultLanguage    | String   | Default language. *Eg: 'en'*. Always used when there is no user context (session). For example, the Service Provider page.       |
     * | maintenance        | Boolean  | Enable/Disable *maintenance page* redirect  |
     * | debug              | Boolean  | Enable/Disable debug mode     |
     * | html5mode          | Boolean  | Enable/Disable HTML5 mode     |
     * | cache              | Boolean  | Enable/Disable data caching in the Application    |
     * | isValid            | Boolean  | Indicates if configuration is valid or not. **NOTE: This property is set by the Application during the `CONFIGURATION` phase.** |
     *
     * ##### API
     * | Property        | Type    | Description                   |
     * | --------------- |---------| ------------------------------|
     * | apiBase         | String  | URL of the server. *Eg: 'https://localhost:8080'*     |
     * | apiBaseSet      | Array   | List of URLs of all the MW Applications (server(s)). *Eg: ['https://localhost:8080']*     |
     * | apiServer       | String  | URL of the server to call web services (API). *Eg: 'https://localhost:8080/mw-app'*           |
     * | apiServerNotes  | String  | URL of the server to call   |
     * | apiAuth         | String  | URL of the server to call for authentication. *Eg: 'https://localhost:8080/user'*    |
     * | apiClient       | String  | URL of the server to call for user data. *Eg: 'https://localhost:8080/client'*     |
     * | apiClientToken  | String  | Authorization token to use with web services for user data. *Eg: '12345678-1234-1234-1234-123456789012'* |
     *
     * ##### Logs
     * Logs are sent to a centralized server to help support team. It sends plain JSON to a Graylog server.
     *
     * | Property           | Type     | Description                   |
     * | ------------------ |----------| ------------------------------|
     * | logSendReports     | Boolean  | Enable/Disable sending log report     |
     * | logServerURL       | String   | URL of report API. *Eg: 'http://localhost:8080/gelf'*     |
     * | logWebInterfaceURL | String   | URL of report web interface. *Eg: 'http://localhost:8080'*   |
     *
     * ##### Notes and Images
     * The url is composed from these two params to link to the imaging
     *
     * | Property        | Type     | Description                            |
     * | --------------- |----------| ---------------------------------------|
     * | imagingURL      | String   | URL of imaging server                  |
     * | imagingStartApp | String   | Imaging server start application       |
     *
     * ##### Roles (`config.roles`)
     * Relation table for our roles and api roles
     *
     * | Property         | Type            | Description                                         |
     * | ---------------- |-----------------| ----------------------------------------------------|
     * | nurse            | String &#124; Object   | List of key in auth to affect nurse role            |
     * | physician        | String &#124; Object   | List of key in auth to affect physician role        |
     * | financial        | String &#124; Object   | List of key in auth to affect financial role        |
     * | administrative   | String &#124; Object   | List of key in auth to affect administrative role   |
     * | sysadmin         | String &#124; Object   | List of key in auth to affect sysadmin role         |
     * Eg:
     * ```
     *     'roles': {
     *          'nurse': ['nurse'],
     *          'physician': ['physician'],
     *          'financial': ['financial'],
     *          'administrative': ['administrative'],
     *          'sysadmin': ['sysadmin']
     *     }
     *```
     *
     * ##### Routing/navigation (`config.routing`)
     * | Property       | Type     | Description                       |
     * | -------------- |----------| ----------------------------------|
     * | defaultState   | Object   | Application 'home' state. *Eg: {name: 'mycockpit'}*  |
     * | invalidStates  | Array    | List (blacklist) of routing state names which are invalid/not accessible to the application    |
     * ```
     *      // Application's 'home' state
     *      'defaultState': { name: 'patient' },
     *
     *      // Excluded states
     *      'invalidStates': [
     *          'mycockpit',
     *          'searchpatient',
     *          'serviceDiscovery'
     *      ]
     * ```
     *
     * ##### Reporting (`config.reporting`)
     * | Property      | Type     | Description                       |
     * | ------------- |----------| ----------------------------------|
     * | apiBase       | String   | URL of Reporting API. *Eg: 'http://localhost:8080'*     |
     * | urlBase       | String   | URL of Reporting application page. *Eg: 'http://localhost:8080'*    |
     *
     * ##### Language (`config.lang`)
     * | Property           | Type     | Description             |
     * | ------------------ |----------| ------------------------|
     * | lang               | Object   | List of available languages. |
     * Eg:
     * ```
     * lang: {
     *   'de': 'Deutsch',
     *   'en': 'English',
     *   'fr': 'Français',
     *   'it': 'Italiano'
     * }
     * ```
     *
     * ##### Version (`config.version`)
     * | Property      | Type     | Description             |
     * | ------------- |----------| ------------------------|
     * | full          | String   | Full version number     |
     * | major         | Number   | Major version number    |
     * | minor         | Number   | Minor version number    |
     * | dot           | Number   | Dot version number      |
     * | codeName      | String   | Codename version number |
     * Eg:
     * ```
     * version: {
     *   'full': '1.8.0-build+sha.b5bd01a',
     *   'major': 1,
     *   'minor': 8,
     *   'dot': 0,
     *   'codeName': 'build+sha.b5bd01a'
     * }
     * ```
     *
     * ##### E-Mail of support in different languages
     * | Property                                               | Type     | Description                              |
     * | ------------------------------------------------------ |----------| -----------------------------------------|
     * | customerSpecificConfiguration.itSupport.phone          | Object   | Phone numbers in different languages     |
     *
     */
    var config = {
        'debug': true,
        'title': undefined,
        'baseURL': undefined,
        'apiServer': undefined,
        'apiAuth': undefined,
        'defaultLanguage': 'en',
        'maintenance': false,
        'cache': true,
        'logSendReports': true,
        'logServerURL': undefined,
        'logWebInterfaceURL': undefined,
        'html5mode': false,
        'application_name': 'eHealth Cockpit',
        'hostname': window.location.hostname,
        'scrollTopLimit': 1000,
        'externalAccessor': false,
        'roles': {
            'nurse': [],
            'physician': [],
            'financial': [],
            'administrative': [],
            'sysadmin': []
        },
        'lang': {
            'de': 'Deutsch',
            'en': 'English',
            'fr': 'Français',
            'it': 'Italiano'
        },
        'version': {
            'full': VERSION.full,
            'major': VERSION.major,
            'minor': VERSION.minor,
            'dot': VERSION.dot,
            'codeName': VERSION.code
        },
        'isValid': isValid
    };

    // Extend APP_CONFIG in our default config file
    angular.extend(config, APP_CONFIG);

    this.config = config;
    this.isValid = isValid;

    /**
     * @ngdoc method
     * @name configProvider#isValid
     * @param  {Object=} logger   Object used to log. If none then use console.
     * @return {Boolean}
     * @description
     *
     * Checks if current config respects required criteria.<br/>
     * `Provider` uses `console` and injected module uses `$log`<br/>
     * Can be overridden by creating custom logger
     */
    function isValid(logger) {
        var hasError = false; // If has error then is not valid
        var required = {
            'defaultLanguage': 'en|fr|de|it'
        };
        var recommended = {

            'baseURL': '^http',
            'apiServer': '^https',
            'apiAuth': '^https',
            'logServerURL': '^https',
            'logWebInterfaceURL': '^https',
            'logSendReports': 'true'
        };

        if (!logger) {
            logger = console;
        }

        /**
         * Parse each value and check if config value follow specified regex
         * @param  {Object}  criteria   List of criteria and associated regex
         * @param  {Boolean} isRequired Is testing required (so error log) or recommended (so warn log)
         */
        var checkFunction = function(criteria, isRequired) {
            for (var key in criteria) {
                if (criteria.hasOwnProperty(key)) {
                    var regex = criteria[key];
                    if (!config[key] || !new RegExp(regex).test(config[key].toString())) {
                        if (isRequired) {
                            logger.error('[configProvider] config.' + key + ' = ' +
                                config[key] + ' does not respect ' + regex + ' pattern.',
                                config);
                            hasError = true;
                        } else {
                            logger.warn('[configProvider] config.' + key + ' = ' +
                                config[key] + ' should respect ' + regex + ' pattern.');
                        }
                    }
                }
            }
        };

        checkFunction(required, true); //Check required values
        checkFunction(recommended, false); //Check recommended values

        return !hasError; // If has error then is not valid
    }

    ////////////////////////////////////////////////////////////
    // Provider structure. This part should not be modified
    ////////////////////////////////////////////////////////////
    ConfigFunction.$inject = ['$log'];

    function ConfigFunction($log) {

        // We replace previous isValid call with console by $log
        config.isValid = isValid($log);
        return config;
    }

    this.$get = ConfigFunction;
}

export default configProvider;
