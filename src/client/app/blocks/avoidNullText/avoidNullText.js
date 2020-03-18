/**
 * @ngdoc filter
 * @name avoidNullText
 * @function
 * @param {String} input Text
 * @returns {String} The same text if exist, in other case '-'
 */
function avoidNullText() {
    return function (input) {
        return input ? input : '-';
    };
}

export default avoidNullText;
