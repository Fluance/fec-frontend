import angular from 'angular';
import toastr from 'toastr';
import moment from 'moment';

import 'angular-sanitize'; // ngSanitize

// in 'blocks'
import '../blocks/asynchronous/asynchronous.module';
import '../blocks/authentication/authentication.module';
import '../blocks/exception/exception.module';
import '../blocks/logger/logger.module';
import '../blocks/router/router.module';
import '../blocks/booleanFormatter/booleanFormatter.module';
import '../blocks/kebab/kebab.module';
import '../blocks/fecNumber/fecNumber.module';
import '../blocks/avoidNullText/avoidNullText.module';
import '../blocks/contentItem/contentItem.module';
import '../blocks/currencyFormatter/currencyFormatter.module';
import '../blocks/dataValidator/dataValidator.module';
import '../blocks/dateFormatter/dateFormatter.module';
import '../blocks/dateParser/dateParser.module';
import '../blocks/dataPaging/dataPaging.module';
import '../blocks/datePicker/datePicker.module';
import '../blocks/emptyOption/emptyOption.module';
import '../blocks/expander/expander.module';
import '../blocks/fecAnesthesiaBox/fecAnesthesiaBox.module';
import '../blocks/fecPatientPositionBox/fecPatientPositionBox.module';
import '../blocks/fecOperationNoteBox/fecOperationNoteBox.module';
import '../blocks/fecChatBot/fecChatBot.module';
import '../blocks/fecIcon/fecIcon.module';
import '../blocks/fecGenderIcon/fecGenderIcon.module';
import '../blocks/fecIconButton/fecIconButton.module';
import '../blocks/input/fecInput.module';
import '../blocks/fecSelectFilter/fecSelectFilter.module';
import '../blocks/fecMeteoData/fecMeteoData.module';
import '../blocks/fecMeteoDataList/fecMeteoDataList.module';
import '../blocks/fecMeteoIcon/fecMeteoIcon.module';
import '../blocks/fecNavigationContext/fecNavigationContext.module';
import '../blocks/fecProductivity/productivity.module';
import '../blocks/fecLastState/fecLastState.module';
import '../blocks/fecStateIconButton/fecStateIconButton.module';
import '../blocks/firstletter/firstletter.module';
import '../blocks/highlightTextFilter/highlightTextFilter.module';
//import '../blocks/tutorialGuide'; // NOT USED
import '../blocks/materialSelect/materialSelect.module';
import '../blocks/mobileClick/mobileClick.module';
import '../blocks/momentFormatter/momentFormatter.module';
import '../blocks/multisession/multisession.module';
import '../blocks/navBar/navBar.module';
import '../blocks/navButton/navButton.module';
import '../blocks/noContentPlaceholder/noContentPlaceholder.module';
import '../blocks/nurseSchedulerDateSearch/nurseSchedulerDateSearch.module';
import '../blocks/nurseSchedulerPatientSearch/nurseSchedulerPatientSearch.module';
import '../blocks/orderByObjectPropertyFilter/orderByObjectPropertyFilter.module';
import '../blocks/patientView/patientView.module';
import '../blocks/pdfViewer/pdfViewer.module';
import '../blocks/selectionReveal/selectionReveal.module';
import '../blocks/stringReplace/stringReplace.module';
import '../blocks/virtualRepeatSyncScope/virtualRepeatSyncScope.module';
import '../blocks/tabOpener/tabOpener.module';
import '../blocks/uiSref/uiSref.module';
import '../blocks/waitForRendering/waitForRendering.module';
import '../blocks/angular-img-http-href/httpHref.directive'; // httpHref
import '../blocks/userAgent/userAgent.module';
import '../blocks/virtualDatatable/virtual-datatable.module';
import '../blocks/mdMenu/mdMenu.module';
import 'angular-ui-router'; // ui-router
//'ui.router.state.events', // NOT USED...
import 'angularplus'; // ngplus
import 'angular-cache'; // angular-cache
import 'js-data-angular'; // js-data
import 'angularjs-datetime-picker-v2'; // angular-js-datetime-picker
import 'angular-bind-html-compile'; // angular-bind-html-compile
import 'angular-messages'; // ngMessages
import 'angular-material'; // ngMaterial
import '../blocks/httpInterceptors/httpInterceptors.module'
//import '../blocks/httpInterceptors/externalAccessFilter';
import '../blocks/httpInterceptors/httpThrottler.module';
//import '../blocks/httpInterceptors/serialCallInterceptor'; // http-throttler
//import '../blocks/httpInterceptors/timeoutInterceptor';
import 'ng-file-upload'; // ngFileUpload
import 'angular-local-storage'; // LocalStorageModule
import 'angular-ui-sortable'; // ui.sortable
// LB NOTE: add to webpack dependency tree (not directly added in core.module as a dependency)
import '../blocks/i18n/i18n.module';
import '../blocks/fluance_components/introJsSvg';
import '../blocks/fecImageEditor/fecImageEditor.module'
//import '../blocks/fluance_components/introJsSvg.scss'; // LB NOTE: imported in styles.scss


// in 'core' module
import { toastrConfig, configure, setHashPrefix, theming } from './config';
import './config.module'; // config
import eventService from './event';
import helpersService from './helpers';
import './polyfill';
import sessionService from './session.service';
import userService from './user';
import { dataServiceBeds, run as runDataServiceBeds } from './data/beds.dataservice';
import { dataServiceCompanies, run as runDataServiceCompanies } from './data/companies.dataservice';
import { dataServiceHospServices, run as runDataServiceHospServices } from './data/hospServices.dataservice';
import { dataServiceInterventions, run as runDataServiceInterventions } from './data/interventions.dataservice';
import { dataServiceLocks, run as runDataServiceLocks } from './data/locks.dataservice';
import dataServiceMeteo from './data/meteo.dataservice';
import { dataServiceRooms, run as runDataServiceRooms } from './data/rooms.dataservice';
import { dataserviceServiceFees, run as runDataserviceServiceFees } from './data/servicefees.dataservice';
import dataServiceSession from './data/session.dataservice';
import { dataServiceUnits, run as runDataServiceUnits } from './data/units.dataservice';
import { dataServiceUsers, run as runDataServiceUsers } from './data/users.dataservice';


/**
 *
 * @ngdoc module
 * @name app.core
 * @module app.core
 * @packageName app.core
 **/
angular
    .module('app.core', [
        'config',
        'ngSanitize',
        'blocks.asynchronous',
        'blocks.authentication',
        'blocks.exception',
        'blocks.logger',
        'blocks.router',
        'blocks.booleanFormatter',
        'blocks.kebab',
        'blocks.fecNumber',
        'blocks.avoidNullText',
        'blocks.contentItem',
        'blocks.currencyFormatter',
        'blocks.dataValidator',
        'blocks.dateFormatter',
        'blocks.dateParser',
        'blocks.dataPaging',
        'blocks.datePicker',
        'blocks.emptyOption',
        'blocks.expander',
        'blocks.fecAnesthesiaBox',
        'blocks.fecPatientPositionBox',
        'blocks.fecOperationNoteBox',
        'blocks.fecChatBot',
        'blocks.fecIcon',
        'blocks.fecGenderIcon',
        'blocks.fecIconButton',
        'blocks.fecInput',
        'blocks.fecSelectFilter',
        'blocks.fecMeteoData',
        'blocks.fecMeteoDataList',
        'blocks.fecMeteoIcon',
        'blocks.fecNavigationContext',
        'blocks.fecProductivity',
        'blocks.fecLastState',
        'blocks.fecStateIconButton',
        'blocks.fecImageEditor',
        'blocks.firstletter',
        'blocks.highlightTextFilter',
        //'blocks.tutorialGuide',
        'blocks.materialSelect',
        'blocks.mobileClick',
        'blocks.momentFormatter',
        'blocks.multisession',
        'blocks.navBar',
        'blocks.navButton',
        'blocks.noContentPlaceholder',
        'blocks.nurseSchedulerDateSearch',
        'blocks.nurseSchedulerPatientSearch',
        'blocks.orderByObjectPropertyFilter',
        'blocks.patientView',
        'blocks.pdfViewer',
        'blocks.selectionReveal',
        'blocks.stringReplace',
        'blocks.virtualRepeatSyncScope',
        'blocks.tabOpener',
        'blocks.uiSref',
        'blocks.waitForRendering',
        'blocks.httpHref',
        'blocks.userAgent',
        'blocks.virtualDatatable',
        'ui.router',
        /*'ui.router.state.events',*/
        'ngplus',
        'angular-cache',
        'js-data',
        'angularjs-datetime-picker',
        'angular-bind-html-compile',
        'ngMessages',
        'ngMaterial',
        'blocks.http-throttler',
        'ngFileUpload',
        'LocalStorageModule',
        'ui.sortable',
        'blocks.mdMenu'
    ])
    .config(['DSHttpAdapterProvider', 'configProvider', function(DSHttpAdapterProvider, configProvider) {
        // We override the default handler, since we do not want to print stuff to the console,
        // we want to show an error in the UI making the user able to continue using the app
        // When debug is on, default error behaviour will be applied (lil bit complicated since we override the error function when
        // debugging is off, because we want the normal erroring when debugging is on, think thrice and you'll get it :D)
        if (!configProvider.config.debug) {
            angular.extend(DSHttpAdapterProvider.defaults, {
                error: function(error) {
                    return error;
                }
            });
        }
    }])
    .config(toastrConfig)
    .config(configure)
    .config(setHashPrefix)
    .config(theming)
    .run(runDataServiceBeds)
    .run(runDataServiceCompanies)
    .run(runDataServiceHospServices)
    .run(runDataServiceInterventions)
    .run(runDataServiceLocks)
    .run(runDataServiceRooms)
    .run(runDataserviceServiceFees)
    .run(runDataServiceUnits)
    .run(runDataServiceUsers)
    .constant('toastr', toastr)
    .constant('moment', moment)
    .service('Event', eventService)
    .service('helpers', helpersService)
    .service('sessionService', sessionService)
    .service('userService', userService)
    .factory('dataservice.beds', dataServiceBeds)
    .factory('dataservice.companies', dataServiceCompanies)
    .factory('dataservice.hospServices', dataServiceHospServices)
    .factory('dataservice.interventions', dataServiceInterventions)
    .factory('dataservice.locks', dataServiceLocks)
    .factory('dataservice.meteo', dataServiceMeteo)
    .factory('dataservice.rooms', dataServiceRooms)
    .factory('dataservice.servicefees', dataserviceServiceFees)
    .service('dataservice.session', dataServiceSession)
    .factory('dataservice.units', dataServiceUnits)
    .factory('dataservice.users', dataServiceUsers);


