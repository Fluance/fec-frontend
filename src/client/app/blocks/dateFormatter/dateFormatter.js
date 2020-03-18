import moment from 'moment';

/**
* @ngdoc filter
* @name dateFormatter
* @function
* @param {String} input Text in the format of 'yyyy-MM-dd'
* @param {Boolean} point If is true input get formatted else input is returned unformated
* @returns {String} The date in the above format
*
* @description
*
* A filter that take in parameter a special data format
* as 'yyyy-MM-dd' and display it a readable format 'dd.MM.yyyy'

   {{ "2015-09-28 00:00:00" | formatDate : 'dd.MM.yyyy hh:mm'}}
* Result: 28.09.2015

   {{ "1960-05-05" | formatDate : 'dd.MM.yyyy'}}
* Result: 05.05.1960
*/

formatDate.$inject = ['moment', '$translate'];

function formatDate(moment, $translate) {
    return function (input, formatType) {
        var format = !!formatType ? formatType : 'DD.MM.YYYY';

        // If input is null, we return a dash
        if (!input) return '-';

        // Else we check the requested format
        switch (formatType) {
            case 'date':
                format = 'DD.MM.YYYY';
                break;
            case 'dateYY':
                format = 'DD.MM.YY';
                break;
            case 'englishDate':
                format = 'YYYY-MM-DD'
                break;
            case 'englishDateTime':
                format = 'YYYY-MM-DD HH:mm:ss'
                break;
            case 'time':
                format = 'HH:mm';
                break;
            case 'dateTime':
                format = 'DD.MM.YYYY HH:mm';
                break;
            case 'dateTimeYY':
                format = 'DD.MM.YY HH:mm';
                break;
            case 'dateTimeYYHH':
                format = 'DD.MM.YY HH';
                break;
            case 'dateTimeDDMMHH':
                format = 'DD.MM HH';
                break;
            case 'day':
                format = 'DD';
                break;
            case 'month':
                format = 'MMMM';
                break;
            case 'monthShort':
                format = 'MMM';
                break;
            case 'dayOfWeekShort':
                format = 'ddd';
                break;
            case 'dayOfWeek':
                format = 'dddd';
                break;
            case 'year':
                format = 'YYYY';
                break;
            case 'whiteboardSurgery':
                format = 'ddd, DD MMM YYYY'
                break;
            case 'whiteboardSurgeryNoteEdit':
                format = 'dddd, DD MMMM YYYY'
                break;
            case 'language':
                switch ($translate.use()) {
                    case 'de':
                        format = 'dddd, D. MMMM YYYY';
                        break;
                    case 'en':
                        format = 'dddd, D MMMM YYYY';
                        break;
                    case 'fr':
                        format = 'dddd D MMMM YYYY';
                        break;
                    case 'it':
                        format = 'dddd, D MMMM YYYY';
                        break;
                }
                break;
            case 'languageWithoutWeekday':
                switch ($translate.use()) {
                    case 'de':
                        format = 'D. MMMM YYYY';
                        break;
                    case 'en':
                        format = 'D MMMM YYYY';
                        break;
                    case 'fr':
                        format = 'D MMMM YYYY';
                        break;
                    case 'it':
                        format = 'D MMMM YYYY';
                        break;
                }
                break;
            default:
                format = 'DD.MM.YYYY';
        }

        // TODO: fix eg. input = "2019-04" (deprecated), "2019-04-02 16:15:00" (correct)
        // Error: moment.js:736 Deprecation warning: moment construction falls back to js Date. This is discouraged and will be removed in upcoming major release.
        var result = moment(input).locale($translate.use()).format(format);
        return result;
    };
}

export default formatDate;
