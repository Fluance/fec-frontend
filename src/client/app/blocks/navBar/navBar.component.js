import template from './navBar.component.html';

const navBar = {
    controller: ['$rootScope', '$scope', '$state', '$transitions', controller],
    templateUrl: template,
    transclude: true
};

function controller($rootScope, $scope, $state, $transitions) {
    var ctrl = this;

    ctrl.navItems = [];

    ctrl.$onInit = onInit;
    ctrl.addNavItem = addNavItem;
    ctrl.$postLink = postLink;

    // ------------------------------------------------------------------------

    function onInit() {
        ctrl.navItems = [];

        // event sent by nav item when it is clicked and before navigating
        $scope.$on('beforeNavigate', function(event, data) {
          _setSelectedByItemName(data.navName);
        });

        // listen to change in routes to correctly mark selected nav item
        $transitions.onSuccess({}, function (transition) {
            var toState = transition.to();

            _setSelectedByStateName(toState.name);
        });
    }

    // nav-bar child elements are linked
    // note: changed nav-button's to use 'template' because 'templateUrl' is async, and not all items will be linked)
    function postLink() {
        // mark selected element (for current state)
        _setSelectedByStateName($state.current.name);
    }

    function addNavItem(navName, navState, navElement) {
        ctrl.navItems.push({name: navName, state: navState, element: navElement});
    }

    // ------------------------------------------------------------------------

    function _setSelectedByItemName(itemName) {
        _.forEach(ctrl.navItems, function(item) {
            if(itemName === item.name) {
                item.element.addClass('fec-nav-item-selected');
            }
            else {
                item.element.removeClass('fec-nav-item-selected');
            }
        });
    }

    function _setSelectedByStateName(stateName) {
        if($state.current.name === stateName) {
            _.forEach(ctrl.navItems, function (item) {
                if (stateName === item.state) {
                    item.element.addClass('fec-nav-item-selected');
                }
                else {
                    item.element.removeClass('fec-nav-item-selected');
                }
            });
        }
    }
}


export default navBar;

