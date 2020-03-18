/**
 * @ngdoc directive
 * @scope
 * @module app
 * @name fecMobilClick
 * @param {string} fec-mobile-click              text
 *
 * @description
 *
 * A Directive that allow you to click on a mobile, tablet (Touch screen)
 *
    <a fec-mobile-click="vm.changeSearchMenu('location')">
        <fec-icon type="location" class="sidepanel-icon"></fec-icon>
        {{'search.LOCATION' | translate }}
    </a>
 *
 */

function fecMobileClick() {
    var touchmoved = false;
    return function(scope, elem, attrs) {
        elem.bind('touchend click', function(e) {
            if (!touchmoved && !elem[0].disabled) {
                e.preventDefault();
                e.stopPropagation();
                scope.$apply(attrs['fecMobileClick']);
            }
        });
        elem.bind('touchmove', function(e) {
            touchmoved = true;
        });
        elem.bind('touchstart', function(e) {
            touchmoved = false;
        });
    }
}

export default fecMobileClick;
