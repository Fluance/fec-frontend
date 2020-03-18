// jscs:disable requireParenthesesAroundIIFE
/* jshint -W117, -W030 */

/**
 * @ngdoc filter
 * @name firstLetterUpperCase
 * @function
 * @returns {String} Text, with first character in upper case.
 *
 * @description
 *     *
 * Returns the string value with the first character in upper case.
 */

firstLetterUpperCase.$inject = ['$filter'];

/* @ngInject */
function firstLetterUpperCase($filter) {
    return function(input) {
        if (!_.isString(input) || input.length < 2) { return input; }

        return input.charAt(0).toUpperCase() + input.substr(1);
    };
}


export default firstLetterUpperCase;
