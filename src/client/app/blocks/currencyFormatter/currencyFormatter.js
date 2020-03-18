// jscs:disable requireParenthesesAroundIIFE
/* jshint -W117, -W030 */

/**
 * @ngdoc filter
 * @name currencyFormatter
 * @function
 * @param  {Integer} input  A number that should be use as money
 * @param  {String} symbol  Currency symbol
 * @param  {String} thouSep Symbol as the thousand seperator (optional)
 * @param  {boolean} place   location for the currency symbol next to the currency (optional)
 * @return {String} Currency with currency symbol and add two decimal digits
 *
 * @description
 *
 * A filter to add swiss currency (CHF) before a number and display it as a value of swiss franc

    {{ 1583.35 | formatCurrency : 'CHF' | noContentPlaceholder }}
 * Result: CHF 1'583.35
 */

formatCurrency.$inject = ['$filter'];

/* @ngInject */
function formatCurrency($filter) {
    return function(input, symbol, thouSep, place) {
        if (isNaN(input) || input === '' || input === null) {
            return input;
        } else {
            var thousandSep = thouSep || '\'';
            var symbolPlace = place === undefined ? true : place;
            var sign = '';
            if (input < 0) {
                sign = '- ';
            }
            if (symbolPlace === true) {
                return symbol + ' ' + sign + Math.abs(input)
                    .toFixed(2)
                    .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1' + thousandSep);
            }
            return sign + Math.abs(input)
                .toFixed(2)
                .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1' + thousandSep) + ' ' + symbol;
        }
    };
}

export default formatCurrency;
