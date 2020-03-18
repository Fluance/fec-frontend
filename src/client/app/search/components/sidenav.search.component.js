import template from './sidenav.search.component.html';

const SidenavSearch = {
    bindings: {
        isOpen: '<'
    },
    controller: ['$rootScope', '$sce', '$scope', '$mdSidenav', '$state', 'config', 'sessionService', controller],
    controllerAs: 'vm',
    templateUrl: template
};

function controller($rootScope, $sce, $scope, $mdSidenav, $state, config, session) {
    /*jshint validthis: true */
    var vm = this;

    // Properties
    vm.selectedSearchMethod = undefined;
    vm.serachMethods = [];
    vm.tutorialChapterName = undefined;

    // Methods
    vm.selectSearchMethod = selectSearchMethod;
    vm.initializeForm = undefined;
    vm.onKeyUp = onKeyUp;
    vm.submit = undefined;
    vm.isValid = undefined;

    // Events
    vm.$onInit = onInit;
    vm.$onChanges = onChanges;

    // ------------------------------------------------------------------------- Initialization

    function onInit() {
        _getSearchMethods();

        if (session.user) {
            selectSearchMethod(vm.serachMethods[0]);
        }
    }

    function onChanges(args) {
        if (args.isOpen && args.isOpen.currentValue === true) {
            if (_.isFunction(vm.initializeForm)) { vm.initializeForm(); }
        }
    }

    // --------------------------------------------------------------- Interface implementation

    function onKeyUp(event) {
        if (event.keyCode === 13) { vm.submit(); }
    }

    function selectSearchMethod(method) {
        vm.submit = undefined;
        vm.isValid = undefined;
        vm.selectedSearchMethod = method;
    }

    // ------------------------------------------------------------------------------- Tutorial

    function _configureTutorial() {
        tutorialService.setSteps(tutorialService.CHAPTER_NAME_SIDEBAR_MENU, 0, [{
            element: '.tutorial-mycockpit',
            introKey: 'layout.GUIDE_MENU_COCKPIT',
            position: 'right',
            isValid: function() {
                return session.isAuthenticated();
            }
        }, {
            element: '.tutorial-admin-users',
            introKey: 'layout.GUIDE_MENU_ADMIN',
            position: 'right',
            isValid: function() {
                return session.isAuthenticated() && session.user && session.user.hasRole(['sysadmin']);
            }
        }, {
            element: '.tutorial-settings',
            introKey: 'layout.GUIDE_MENU_USER',
            position: 'right',
            isValid: function() {
                return session.isAuthenticated();
            }
        }, {
            element: '.tutorial-language',
            introKey: 'layout.GUIDE_MENU_LANGUAGE',
            position: 'right'
        }, {
            element: '.tutorial-feedback',
            introKey: 'layout.FEEDBACK_CONTACT_US',
            position: 'top'
        }]);
    }

    // ------------------------------------------------------------------------- Helper methods

    function _getSearchMethods() {
        vm.searchMethods = [
            {
                title: 'search.SEARCH_BY_CRITERIA',
                icon: 'criteria',
                template: $sce.trustAsHtml('<fec-sidenav-search-criteria></fec-sidenav-search-criteria>')
            },
            {
                title: 'search.SEARCH_BY_IDS',
                icon: 'patientIdvisitId',
                template: $sce.trustAsHtml('<fec-sidenav-search-ids></fec-sidenav-search-ids>')
            },
            {
                title: 'search.SEARCH_BY_LOCATION',
                icon: 'location',
                template: $sce.trustAsHtml('<fec-sidenav-search-location></fec-sidenav-search-location>')
            }];
    }
}

export default SidenavSearch;
