/**
 * @ngdoc service
 * @name dateParser
 * @function
 *
 * @description
 *
 * A service to parse a date and return a normalized date format 'MM.DD.YYYY'
 */

function DateParser() {
    var _dateSeparator = '.';

    this.setDateSeparator = function(dateSeparator) {
        _dateSeparator = dateSeparator;
    };

    /*
     * Normalize date format, adding leading zeroes for day and month.
     * eg: aDate = '12.4.2016' ==> returns "12.04.2016"
     */
    this.normalizeDate = function parseDate(aDate) {
        var parsedDate;
        var day, month, year, strDay, strMonth;

        // don't normalize if aDate doesn't have a value
        if(_.isUndefined(aDate) || _.isNull(aDate) || _.isEmpty(aDate)) return aDate;

        parsedDate = moment(aDate).toDate();

        month = parsedDate.getMonth()+1;
        day = parsedDate.getDate();
        year = parsedDate.getFullYear();
        strMonth = (month<=9) ? '0'+month : month;
        strDay = (day<=9) ? '0'+day : day;

        return strDay + _dateSeparator + strMonth + _dateSeparator + year;
    }
}

export default DateParser;
