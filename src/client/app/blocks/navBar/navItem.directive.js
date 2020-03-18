function navItem() {
    return {
        restrict: 'A',
        require: '^fecNavBar',
        link: function(scope, element, attrs, ctrl) {
            ctrl.addNavItem(attrs['navName'], attrs['state'], element);
        }
    }
}

export default navItem;
