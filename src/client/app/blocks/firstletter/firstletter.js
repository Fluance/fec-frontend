// jscs:disable requireParenthesesAroundIIFE
/* jshint -W117, -W030 */

/**
 * @ngdoc filter
 * @name firstLetter
 * @function
 * @param {String} text Text to add a `.` to (after the first character)
 * @param {Boolean} point If true, a point is attached
 * @returns {String} Text, either with or without `.`
 *
 * @description
 *
 *
 * Appends a `.` to the first character of the given value
 *
 * Appending is only applied when the given boolean is true

    {{ ABCDEFGH | firstLetter : true }}
 *  Result: A.

    {{ ABCDE | firstLetter : false }}
 *  Result: A
 */

firstLetter.$inject = ['$filter'];

/* @ngInject */
function firstLetter($filter) {
    return function(input, point) {
        if (!_.isString(input) || input.length === 0) { return input; }

        var returnValue = input.slice(0, 1);
        if (point) {
            return returnValue + '.';
        } else {
            return returnValue;
        }
    };
}


export default firstLetter;
