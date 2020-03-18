// jscs:disable requireParenthesesAroundIIFE
/* jshint -W117, -W030 */
describe('blocks.filter.dataValidator', function() {
    var filter, iconEmail, iconPhone;

    beforeEach(function() {
        module('app');
        inject(['$filter', 'CacheFactory',
            function($filter, $CacheFactory) {
                filter = $filter('validateData');
                iconEmail = '<i class="material-icons tiny">mail_outline</i> ';
                iconPhone = '<i class="material-icons tiny">phone</i> ';
                $CacheFactory.destroyAll();
            }
        ]);

    });

    /**

    TEST PHONE

    **/

    // Test if + is before instead of 00 
    it('dataValidator should match +41 22 366 90 00', function() {
        expect(filter('+41 22 366 90 00')).toBe('<a href="tel:+41 22 366 90 00">+41 22 366 90 00</a>');
    });

    // Test if 00 is before instead of +
    it('dataValidator should match +41 22 366 90 00', function() {
        expect(filter('00 41 22 366 90 00')).toBe('<a href="tel:0041 22 366 90 00">0041 22 366 90 00</a>');
    });

    // Test if data is not a String 
    it('dataValidator should return data', function() {
        expect(filter(1234)).toEqual(1234);
    });

    // Test if  2,5,7 are spaces
    it('dataValidator should be false', function() {
        expect(filter('+  41 2 36690000')).toBe('<a href="tel:+41 23 669 00 00">+41 23 669 00 00</a>');
    });

    // Test if a character 0 is behind + 
    it('dataValidator should be false', function() {
        expect(filter('+01 22 366 9O 00')).toBe('+01 22 366 9O 00');
    });

    // Test a valid phone number
    it('dataValidator should match <a href="tel:' + '+41 22 366 90 00' + '"><i class="material-icons tiny">phone</i> +41 22 366 90 00 </a>', function() {
        expect(filter('+41 22 366 90 00', iconPhone)).toBe(
            '<a href="tel:' + '+41 22 366 90 00' + '">' + iconPhone + '+41 22 366 90 00' + '</a>');
    });

    // Test a valid phone number with an icon
    it('dataValidator should match <a href="tel:+41 22 366 90 00">+41 22 366 90 00</a>', function() {
        expect(filter(iconPhone && '+41 22 366 90 00')).toBe('<a href="tel:+41 22 366 90 00">+41 22 366 90 00</a>');
    });

    /**

    TEST EMAIL

    **/


    // Test a valid email adress
    it('dataValidator should match <a href="mailto: info@genolier.net"><i class="material-icons tiny">mail_outline</i> info@genolier.net + </a>', function() {
        expect(filter('info@genolier.net', iconEmail)).toBe('<a href="mailto:' + 'info@genolier.net' + '">' + iconEmail + 'info@genolier.net' + '</a>');
    });

    // Test a valid phone number with an icon
    it('dataValidator should match <i class="material-icons tiny">mail_outline</i> ', function() {
        expect(filter(iconEmail && 'info@genolier.net')).toBe('<a href="mailto:info@genolier.net">info@genolier.net</a>');
    });
});
