import angular from 'angular';
import moment from 'moment';

/* global toastr:false, moment:false */

angular
    .module('i18n', [
        'app.core',
        'config',
        'pascalprecht.translate',
        'smDateTimeRangePicker'
    ])
    .constant('moment', moment)
    .config(configTranslation)
    .config(configMoment)
    .config(configAngularMaterialDesignComponents)
    .config(configSMDatePicker)
    .factory('TranslationErrorHandler', TranslationErrorHandler)
    .factory('fluanceTranslatePartialLoader', fluanceTranslatePartialLoader)
    .service('localizationService', localizationService)
    .service('smDatePickerLocalizationService', smDatePickerLocalizationService);

TranslationErrorHandler.$inject = ['$q', 'logger'];

function TranslationErrorHandler($q, logger) {
    return function(part, lang) {
        console.log('error');
        logger.error('The "' + part + '/' + lang + '" part was not loaded.');
        return $q.when({});
    };
}

// ---------------------------------------------------------------------- Translation providers

configTranslation.$inject = ['$translateProvider', '$translatePartialLoaderProvider', 'configProvider'];

function configTranslation($translateProvider, $translatePartialLoaderProvider, configProvider) {

    $translateProvider
        .useLoader('$translatePartialLoader', {
            // If there is a point in part name, we use it as a delimiter to define a path
            urlTemplate: function(part, lang) {
                var folder = '';
                var arrayPart = part.split('.');
                if (arrayPart.length >= 1) {
                    part = arrayPart.pop();
                    _.each(arrayPart, function(element) {
                        folder = folder + element + '/';
                    });
                }
                return 'app/' + folder + part + '/lang/' + part + '.lang.' + lang + '.json';
            },
            loadFailureHandler: 'TranslationErrorHandler'
        })
        .useLoaderCache(true)
        .useSanitizeValueStrategy('escape')         // Set sanitation strategy
        .useMessageFormatInterpolation()
        .use(configProvider.config.defaultLanguage)     // Set default language (used before user profile is loaded)
    ;

    // Important: Do not set $translateProvider.fallbackLanguage
    //            Translations might not load correctly. For details see:
    // https://github.com/angular-translate/angular-translate/issues/306#issuecomment-66763693
}

/**
 * Define a healper to manipulate $translatePartialLoader
 */
fluanceTranslatePartialLoader.$inject = ['$translatePartialLoader', '$state'];

function fluanceTranslatePartialLoader($translatePartialLoader, $state) {

    var vm = {
        // Add a part to $translatePartialLoader using loader from configLang
        addPart: $translatePartialLoader.addPart,

        // This feature look at required translation
        loadTranslations: function(state) {
            // Load the required translation parts
            _.each(state.requiredTranslationParts, function(part) {
                $translatePartialLoader.addPart(part);
            });

            if (state.parent) {
                vm.loadTranslations($state.get(state.parent));
            } else {
                var splitted = state.name.split('.');
                if (splitted.length > 1) {
                    vm.loadTranslations($state.get(splitted[0]));
                }
            }
        }
    };

    return vm;
}


// --------------------------------------------------------------------------- Moment providers

configMoment.$inject = ['configProvider', 'moment'];

function configMoment(configProvider, moment) {
    moment.locale(configProvider.config.defaultLanguage.toLowerCase());
}

// ------------------------------------------------------ Material Design for Angular providers

configAngularMaterialDesignComponents.$inject = ['$mdDateLocaleProvider'];

function configAngularMaterialDesignComponents($mdDateLocaleProvider) {
    // Set Monday as first day of week
    $mdDateLocaleProvider.firstDayOfWeek = 1;

    // Parse and format date to dd.mm.yyyy
    var dateFormat = 'DD.MM.YYYY';
    $mdDateLocaleProvider.parseDate = function(dateString) {
        var m = moment(dateString, dateFormat, true);
        return m.isValid() ? m.toDate() : moment(NaN).toDate();
    };

    $mdDateLocaleProvider.formatDate = function(date) {
        var m = moment(date);
        return m.isValid() ? m.format(dateFormat) : '';
    };

    $mdDateLocaleProvider.monthHeaderFormatter = function(date) {
        var m = moment(date);
        return m.format('MMM YYYY');
    };

    $mdDateLocaleProvider.monthFormatter = function(date) {
        var m = moment(date);
        return m.format('MMMM');
    };
}

// --------------------------------------------------------------------------- SM Date Picker providers

configSMDatePicker.$inject = ['smDatePickerLocaleProvider'];

function configSMDatePicker(smDatePickerLocaleProvider) {
    // configure locale of date/time picker
    smDatePickerLocaleProvider.setCustomHeader(
        {date: 'DD.MM', time: 'HH:mm', dateTime: 'DD.MM HH:mm'}
    );

    smDatePickerLocaleProvider.setFormat('DD.MM.YYYY HH:mm');
}

// ------------------------------------------------------ Material Design for Angular providers

localizationService.$inject = ['$mdDateLocale', '$translate'];

function localizationService($mdDateLocale, $translate) {
    var service = {
        setUILanguage: setUILanguage
    };
    return service;

    function setUILanguage(language) {
        // Validate
        if (!_.isString(language) && language.length !== 2) { throw 'Invalid language code: ' + language; }

        // Moment.js: Date handling
        moment.locale(language);

        // Angular Material: Months handling
        $mdDateLocale.months = moment.months();
        $mdDateLocale.shortMonths = moment.monthsShort();

        // Angular Material: Week days handling
        $mdDateLocale.days = moment.weekdays();
        $mdDateLocale.shortDays = moment.weekdaysMin();

        // UI language
        return $translate.use(language);

    }
}

// ------------------------------------------------------ smDatepicker localization service

smDatePickerLocalizationService.$inject = ['$filter', 'smDatePickerLocale'];
function smDatePickerLocalizationService($filter, smDatePickerLocale) {
    var service = {
        setTranslation: setTranslation
    };

    return service;

    function setTranslation() {
        // Set buttons and titles
        smDatePickerLocale.cancelLabel = $filter('translate')('core.CANCEL');
        smDatePickerLocale.okLabel = $filter('translate')('core.OK');
        smDatePickerLocale.backToCalendar = $filter('translate')('core.DATE_PICKER.BACK_TO_CALENDAR');
        smDatePickerLocale.hoursTranslation = $filter('translate')('core.DATE_PICKER.HOURS');
        smDatePickerLocale.minutesTranslation = $filter('translate')('core.DATE_PICKER.MINUTES');
        smDatePickerLocale.todayTranslation = $filter('translate')('core.DATE_PICKER.TODAY');

        // Set month names
        smDatePickerLocale.monthShortNames = [
            $filter('translate')('core.DATE_PICKER.MONTHS_SHORT.JAN'),
            $filter('translate')('core.DATE_PICKER.MONTHS_SHORT.FEB'),
            $filter('translate')('core.DATE_PICKER.MONTHS_SHORT.MAR'),
            $filter('translate')('core.DATE_PICKER.MONTHS_SHORT.APR'),
            $filter('translate')('core.DATE_PICKER.MONTHS_SHORT.MAY'),
            $filter('translate')('core.DATE_PICKER.MONTHS_SHORT.JUN'),
            $filter('translate')('core.DATE_PICKER.MONTHS_SHORT.JUL'),
            $filter('translate')('core.DATE_PICKER.MONTHS_SHORT.AUG'),
            $filter('translate')('core.DATE_PICKER.MONTHS_SHORT.SEP'),
            $filter('translate')('core.DATE_PICKER.MONTHS_SHORT.OCT'),
            $filter('translate')('core.DATE_PICKER.MONTHS_SHORT.NOV'),
            $filter('translate')('core.DATE_PICKER.MONTHS_SHORT.DEC')
        ];

        // Set day names
        smDatePickerLocale.daysNames = [
            {
                'single': $filter('translate')('core.DATE_PICKER.WEEKDAYS_SINGLE.SUN'),
                'shortName': $filter('translate')('core.DATE_PICKER.WEEKDAYS_SHORT.SUN'),
                'fullName': $filter('translate')('core.DATE_PICKER.WEEKDAYS_FULL.SUN')
            }, {
                'single': $filter('translate')('core.DATE_PICKER.WEEKDAYS_SINGLE.MON'),
                'shortName': $filter('translate')('core.DATE_PICKER.WEEKDAYS_SHORT.MON'),
                'fullName': $filter('translate')('core.DATE_PICKER.WEEKDAYS_FULL.MON')
            }, {
                'single': $filter('translate')('core.DATE_PICKER.WEEKDAYS_SINGLE.TUE'),
                'shortName': $filter('translate')('core.DATE_PICKER.WEEKDAYS_SHORT.TUE'),
                'fullName': $filter('translate')('core.DATE_PICKER.WEEKDAYS_FULL.TUE')
            }, {
                'single': $filter('translate')('core.DATE_PICKER.WEEKDAYS_SINGLE.WED'),
                'shortName': $filter('translate')('core.DATE_PICKER.WEEKDAYS_SHORT.WED'),
                'fullName': $filter('translate')('core.DATE_PICKER.WEEKDAYS_FULL.WED')
            }, {
                'single': $filter('translate')('core.DATE_PICKER.WEEKDAYS_SINGLE.THU'),
                'shortName': $filter('translate')('core.DATE_PICKER.WEEKDAYS_SHORT.THU'),
                'fullName': $filter('translate')('core.DATE_PICKER.WEEKDAYS_FULL.THU')
            }, {
                'single': $filter('translate')('core.DATE_PICKER.WEEKDAYS_SINGLE.FRI'),
                'shortName': $filter('translate')('core.DATE_PICKER.WEEKDAYS_SHORT.FRI'),
                'fullName': $filter('translate')('core.DATE_PICKER.WEEKDAYS_FULL.FRI')
            }, {
                'single': $filter('translate')('core.DATE_PICKER.WEEKDAYS_SINGLE.SAT'),
                'shortName': $filter('translate')('core.DATE_PICKER.WEEKDAYS_SHORT.SAT'),
                'fullName': $filter('translate')('core.DATE_PICKER.WEEKDAYS_FULL.SAT')
            }
        ];
    }
}
