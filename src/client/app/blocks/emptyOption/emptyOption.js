/**
 * @ngdoc filter
 * @name emptyOption
 * @function
 * @param {Undefined} input you can use as value an Integer, a String or whatever
 * @returns {String} null
 *
 * @description
 *
 * Copy all of the properties in the source objects over
 * to the destination object, and return the destination object.


    {{ ABCDE | emptyOption }}
 *  Result: null
 */

emptyOption.$inject = [];

function emptyOption() {
    return function(input) {
        return _.extend({ null: 'ALL' }, input);
    };
}

export default emptyOption;
