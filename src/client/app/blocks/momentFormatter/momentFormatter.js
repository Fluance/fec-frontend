/**
 * @ngdoc filter
 * @name momentFormatter
 * @function
 * @param {String} Input A date to format
 * @param {String} 'Date' to display
 * @returns {String} Text, a part of the date UTC
 *
 * @description
 *
 * A filter that display a part date format and translate it, see ISO 8601

    {{ "2016-04-01 08:00:00" | formatMoment : 'DD' }}
* Result: 01

    {{ "2016-04-01 08:00:00" | formatMoment : 'ddd' | translate }}
* Result: Fr (Friday)

    {{ "2016-04-01 08:00:00"| formatMoment : 'MMMM' | translate }}
 * Result: April

 {{"2016-04-15 08:00:00" | formatMoment : 'HH:mm'}}
 * Result: 08:00
 */

/* Filter to Format Moment */

formatMoment.$inject = ['moment', '$translate', 'config'];
/* @ngInject */
function formatMoment(moment, $translate, config) {
    return function(input, format) {

        // If input is null, we return a dash
        if (!input) return '-';

        // Else we check the requested format
        switch (format) {
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

            case 'month-abr':
                format = "MMM";
                break;
        }

        var result = moment(input).locale($translate.use()).format(format);
        return result;
    };
}

export default formatMoment;
