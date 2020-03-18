/**
 * @ngdoc service
 * @module app
 * @name datePicker
 * @description
 *
 * This factory translate all key for the datepicker
 *
    angular
        .module('myModule')
        .controller('myController', ctrlFunction);

    ctrlFunction.$inject = ['datePicker'];

    function ctrlFunction(datePicker) {
        datePicker.getTranslationData().then(function(data) {
            $('.admitdatepicker').pickadate({
                monthsFull: _.values(data[7]),
                monthsShort: _.values(data[8]),
                weekdaysFull: _.values(data[9]),
                weekdaysShort: _.values(data[10]),
                today: data[0],
                clear: data[1],
                close: data[2],
                labelMonthNext: data[3],
                labelMonthPrev: data[4],
                labelMonthSelect: data[5],
                labelYearSelect: data[6]
            });
        });
    }
 */

datePicker.$inject = ['$q', '$translate'];

function datePicker($q, $translate) {

    var service = {
        getTranslationData: getTranslationData,
    };

    return service;

    /**
     * Get the promise with translated datepicker data.
     * @return {promise} the promise with the translation data
     */
    function getTranslationData() {
        return $q.all([
            $translate('core.DATE_PICKER.TODAY'),
            $translate('core.DATE_PICKER.CLEAR'),
            $translate('core.DATE_PICKER.CLOSE'),
            $translate('core.DATE_PICKER.LABEL_MONTH_NEXT'),
            $translate('core.DATE_PICKER.LABEL_MONTH_PREV'),
            $translate('core.DATE_PICKER.LABEL_MONTH_SELECT'),
            $translate('core.DATE_PICKER.LABEL_YEAR_SELECT'),
            $translate(translateAndSet('core.DATE_PICKER.MONTHS_FULL', [
                'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 'JULY',
                'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
            ])),
            $translate(translateAndSet('core.DATE_PICKER.MONTHS_SHORT', [
                'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
                'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
            ])),
            $translate(translateAndSet('core.DATE_PICKER.WEEKDAYS_FULL', [
                'SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY',
                'THURSDAY', 'FRIDAY', 'SATURDAY'
            ])),
            $translate(translateAndSet('core.DATE_PICKER.WEEKDAYS_SHORT', [
                'SUN', 'MON', 'TUE', 'WED',
                'THU', 'FRI', 'SAT'
            ]))
        ]);
    }

    /**
     * Private function
     */
    function translateAndSet(prefix, keys) {
        var queryList = [];
        _.each(keys, function(key) {
            queryList.push(prefix + '.' + key);
        });
        return queryList;
    }
}

export default datePicker;

