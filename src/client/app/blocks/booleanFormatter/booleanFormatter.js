/**
* @ngdoc filter
* @name booleanFormatter
* @function
* @param {Boolean|String}   input       Values as boolean or text to format.
* @param {String}           direction   'negate' to invert the boolean value before is it formatted.
* @returns {String}                     A user-friendly representation of the boolean value.
*
* @description
*
* A filter to translate boolean values to a more user-friendly representation.

   {{ true | formatBoolean }}               Result: Check-mark icon
   {{ true | formatBoolean : 'negate' }}    Result: Cross icon
*/

const DIRECTION_NEGATE = 'negate';
const RESULT_TRUE = '<fec-icon type="done" color="fe-value-true" size="xs"></fec-icon>';
const RESULT_FALSE = '<fec-icon type="clear" color="fe-value-false" size="xs"></fec-icon>';

formatBoolean.$inject = ['$filter'];

/* @ngInject */
function formatBoolean($filter) {
    return function(input, direction) {

        // Convert non-boolean value to boolean
        if (_.isString(input)) {
            switch (input.toLowerCase().trim()) {
                case 'true':
                case 'yes':
                case '1':
                    input = true;
                    break;

                case 'false':
                case 'no':
                case '0':
                case null:
                    input = false;
                    break;
            }
        }

        // Use inverse-logic
        if (direction === DIRECTION_NEGATE) {
            input = !input;
        }

        return (input === true) ? RESULT_TRUE : (input === false) ? RESULT_FALSE : '-';
    };
}

export default formatBoolean;
