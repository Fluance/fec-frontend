// jscs:disable requireParenthesesAroundIIFE

/**
 * @ngdoc filter
 * @name dataValidator
 * @function
 * @param {String} data A phone number or an email address
 * @param {Boolean} point If true, a data is attached else -
 * @returns {Link} as Text to contact per telephon or email
 *
 * @description
 *
 * A filter to validate if the format of a phonenumber or an email address is correct

    {{ "+41 22 366 90 11" | validateData:true}}
 * Result: +41 22 366 90 11

    {{"email@yahoo.fr" | validateData:true}}
 * Result: email@yahoo.fr

      {{"email@yahoo" | validateData:true}}
 * Result: -
 */

validateData.$inject = ['$filter'];

/* @ngInject */
function validateData($filter) {
    return function (data, addIcon) {
        if (typeof data !== 'string') {
            return data;
        }
        var icon = '';
        var isValidPhone = data.match(/^(\+|0)[ \/\.\d]{9,}$/);
        var isValidMail = isValidPhone ?
            false :
            data.match(/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i);

        if (addIcon && isValidPhone) {
            icon = '<fec-icon type="phone" color="fe-blue-icon" size="xs"></fec-icon>';
        }

        if (addIcon && isValidMail) {
            icon = '<fec-icon type="email" color="fe-blue-icon" size="xs"></fec-icon>';
        }

        if (isValidPhone) {
            data = data.replace(/[ \/\.]/g, '');

            var spaceArray = data.substring(0, 2) === '00' ? [3, 5, 8, 10] :
                (data.substring(0, 1) === '+' ? [2, 4, 7, 9] : [2, 5, 7]);
            var phonenumber = '';
            var counter = 0;

            data.split('').forEach(function (num) {
                phonenumber = phonenumber.concat(num);
                if (_.includes(spaceArray, counter)) {
                    phonenumber = phonenumber.concat(' ');
                }
                counter++;
            });

            return icon + '<a href="tel:' + data + '">' + phonenumber + '</a>';
        } else if (isValidMail) {
            return icon + '<a href="mailto:' + data + '">' + data + '</a>';
        } else {
            return icon + data;
        }
    };
}

export default validateData;
