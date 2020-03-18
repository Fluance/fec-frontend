/**
 * @ngdoc filter
 * @name noContentPlaceholder
 * @function
 * @param {String} input Text an undefined text
 * @returns {String} -
 *
 * @description
 * A filter to Format empty content
 *

    {{ 'null' | formatCurrency : 'CHF' | noContentPlaceholder }}
 * Result: -

    {{ 'undefined' | formatCurrency : 'CHF' | noContentPlaceholder }}
 * Result: -

    {{ '' | formatCurrency : 'CHF' | noContentPlaceholder }}
 * Result: -
*/

noContentPlaceholder.$inject = ['$filter'];

/* @ngInject */
function noContentPlaceholder($filter) {
    return function(input) {
        if (input === null || input === undefined || input === '') {
            return '-';
        } else {
            return input;
        }
    };
}


export default noContentPlaceholder;
