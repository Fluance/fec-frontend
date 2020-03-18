mdMenuAddClassDirective.$inject = ['$window'];

function mdMenuAddClassDirective($window) {
    return {
        restrict: 'A',
        link: function (scope, el, attrs) {
            var menuContent = el[0].querySelector('md-menu-content');
            scope.$on('$mdMenuOpen', function () {
                $window.requestAnimationFrame(function() {

                    menuContent.parentNode.classList.add(attrs.mdMenuAddClass);
                });
            });

            scope.$on('$destroy', function() {
                menuContent = null;
            });
        }
    };
}

export default mdMenuAddClassDirective;
