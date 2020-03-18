/*jshint -W101*/ //  Line too long
import 'jquery';
import _ from 'lodash';
import angular from 'angular';

// -- vendors dependencies --
import 'angular-moment'; // angularMoment
import 'angular-hammer'; // hmTouchEvents
import 'angular-img-http-src'; // angular.img
import 'ng-sortable'; // as.sortable
import 'oclazyload'; // oc.lazyLoad
import 'angular-touch'; // ngTouch
import 'angular-data-table'; // data-table
import 'angular-ui-sortable'; // ui-sortable


// -- application dependencies --
import './accessLog/accessLog.module'; // app.accessLog
import './admin/admin.module'; // app.admin
import './appointment/appointment.module'; // app.appointment
import './core/core.module'; // app.core
import './dashboard/dashboard.module'; // app.dashboard
import './document/document.module'; // app.document
import './error/error.module'; // app.error
import './guarantor/guarantor.module'; // app.guarantor
import './icdChop/icdChop.module'; // app.icdChop
import './invoice/invoice.module'; // app.invoice
import './imaging/imaging.module'; // app.imaging
import './lab/lab.module'; // app.lab
import './layout/layout.module'; // app.layout
import './notes/notes.module'; // app.notes
import './patient/patient.module'; // app.patient
import './policy/policy.module'; // app.policy
import './search/search.module'; // app.search
import './servicefee/servicefee.module'; // app.servicefee
import './settings/settings.module'; // app.settings
import './shiftPatientList/shiftPatientList.module'; // app.shiftPatient
import './visit/visit.module'; // app.visit
import './whiteboard/whiteboard.module'; // app.whiteboard
import './whiteboardSurgery/whiteboardSurgery.module'; // app.whiteboardSurgery
import './medlab/medlab.module'; // medlab
import './reporting/reporting.module'; // reporting
import './prescription/prescription.module'; // app.prescription


import { externalAccessFilter, config as configExternalAccessFilter } from './blocks/httpInterceptors/externalAccessFilter';
import { timeoutInterceptor, config as configTimeoutInterceptor } from "./blocks/httpInterceptors/timeoutInterceptor";
import { isIe11, configIE11 } from "./blocks/httpInterceptors/httpThrottler";

/*
 * Possible url query parameters:
 * - companyCode    Initial company to select
 * - lang           Initial UI language to select
 * - token          Authentiation token
 * - pid            Patient to select
 * - nav            Navigation parameter -> should become the hash parameter (see Hack-comments)
 */

/**
 *
 * @ngdoc module
 * @name app
 * @module app
 * @packageName app
 * @description
 *
 * This is the main module.
 *
 **/
angular
    .module('app', [
        // -- application modules --
        'i18n',
        'app.accessLog',
        'app.admin',
        'app.appointment',
        'app.core',
        'app.dashboard',
        'app.document',
        'app.error',
        'app.guarantor',
        'app.icdChop',
        'app.invoice',
        'app.imaging',
        'app.lab',
        'app.layout',
        'app.notes',
        'app.patient',
        'app.policy',
        'app.prescription',
        'app.search',
        'app.servicefee',
        'app.settings',
        'app.shiftPatientList',
        'app.visit',
        'app.whiteboard',
        'app.whiteboardSurgery',
        'reporting',
        'medlab',
        // -- vendors modules --
        'angularMoment',
        //'dashboard',
        //'fqueue',
        'hmTouchEvents',
        'angular.img',
        'as.sortable',
        'ngHandsontable',
        'oc.lazyLoad',
        'ngTouch',
        'data-table',
        //'ui.sortable',
        'smDateTimeRangePicker'
    ])

    // Configure routing
    .config(['$qProvider', 'configProvider', 'routerServiceProvider',
        function ($qProvider, configProvider, routerServiceProvider) {

            // Validate routing configuration
            if (!_.isObject(configProvider.config.routing)) { throw 'No routing configuration specified'; }
            if (!_.isObject(configProvider.config.routing.defaultState)) { throw 'No routing.defaultState specified'; }

            // Hack: Restore 'nav'-query-parameter as hash part (server doesn't handle hash part)
            var queryParams = (location.search.length > 0) ? location.search.substr(1).split('&') : [];
            var navIndex = _.findIndex(queryParams, function (item) { return item.indexOf('nav=') === 0; });
            if (navIndex > -1) {
                var hash = '#' + queryParams[navIndex].substr(4);

                queryParams = _.without(queryParams, queryParams[navIndex]);
                var query = ((queryParams.length > 0) ? '?' : '') + queryParams.join('&');

                var path = location.origin + location.pathname;
                window.location.replace(path + query + hash);
            }

            // disable Angular 1.6+ new behavior (throw error) with Promises that are not handled (catch), when
            // not in debug mode (production mode)
            if(!configProvider.config.debugUnhandledRejections) {
                $qProvider.errorOnUnhandledRejections(false);
            }

            routerServiceProvider.configureUrlInfo(window.location);
        }
    ])

    .factory('timeoutHttpInterceptor', ['config', function (appConfig) {
        var DEFAULT_TIMEOUT = 5000;
        return {
            'request': function (config) {
                config.timeout = config.timeout || appConfig.apiRequestTimeout || DEFAULT_TIMEOUT;
                return config;
            }
        }
    }])
    .config(configExternalAccessFilter)
    .config(configTimeoutInterceptor)
    .factory('externalAccessFilter', externalAccessFilter)
    .factory('timeoutInterceptor', timeoutInterceptor)

    .run(['$animate',
        '$rootScope',
        '$translate',
        'authenticationService',
        'config',
        'DocumentService',
        'reportingService',
        'medlabService',
        'routerService',
        'sessionService',
        'noteService',
        'ShiftPatientListService',
        'meteoDataService',
        'productivityService',
        'chatBotService',
        'MultiSessionService',
        //'tutorialService',
        'PatientViewService',
        'imagingReportEmailingService',
        'whiteboardService',

        function ($animate,
                  $rootScope,
                  $translate,
                  auth,
                  config,
                  documentService,
                  reportingService,
                  medlabService,
                  routerService,
                  session,
                  noteService,
                  shiftPatientListService,
                  meteoDataService,
                  productivityService,
                  chatBotService,
                  multiSessionService,
                  // tutorialService,
                  patientViewService,
                  imagingReportEmailingService,
                  whiteboardService
                ) {

            // Handling routing events (from ui-router)
            routerService.registerRoutingEvents(session);

            // Store user (query) parameters in session (overrides)
            routerService.setExpectedUserParameters(session);

            // Update UI language on login change
            $rootScope.$on(session.EVENT_AUTHENTICATION_CHANGED, function () {
                $translate.use(session.getUILanguage());
            });

            // Disable 300ms touch delay on mobile browsers
            $(function () {
                FastClick.attach(document.body);
            });


            // Initialise reporting components
            if (reportingService) {
                reportingService.init(config.reporting);
                reportingService.isInternalAccessor = function () { return _.isBoolean(config.externalAccessor) ? !config.externalAccessor : false; };
                reportingService.getToken = function (issuer) { return auth.getJwt(issuer); };
            }

            // Initialize MedLab components
            if (medlabService) {
                medlabService.init(config.medlab);
            }

            // Initialize N&P button component
            if (noteService) {
                noteService.init(config.note);
            }

            // Initialize Shift Patient list service
            if (shiftPatientListService) {
                shiftPatientListService.init(config.shiftPatientList);
            }

            // Initialize Meteo Data component
            if (meteoDataService) {
                meteoDataService.init(config.meteoData);
            }

            // Initialize Productivity component
            if (productivityService) {
                productivityService.init(config.productivityTieIns);
            }

            // Initialize Chat Bot component
            if (chatBotService) {
                chatBotService.init(config.chatBot);
            }

            // Initialize MultiSession component
            if (multiSessionService) {
                multiSessionService.init(config.multiSession);
            }

            // Initialize Chat Bot component
            //if (tutorialService) {
            //    tutorialService.init(config.tutorial);
            //}

            // Initialize Radiology Report Emailing service
            if (imagingReportEmailingService) {
                imagingReportEmailingService.init(config.imagingReportEmailing);
            }

            // Initialize Patient Documents component
            if(documentService) {
                documentService.init(config.patientDocuments);
            }

            // Patient View feature
            if (patientViewService) {
                patientViewService.init(config.patientView);
            }

            // Whiteboard feature
            if(whiteboardService) {
                whiteboardService.init(config.whiteboard);
            }
        }
    ]);



// httpThrottler - IE11
if(isIe11()) {
    angular.module('app').config(configIE11);
}




