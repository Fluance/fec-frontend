UserController.$inject = [
    //'tutorialService',
    'fullSearchService'
];

/* @ngInject */
function UserController(fullSearchService) {
    /*jshint validthis: true */
    var vm = this;
    vm.title = 'UserSettings';

    /*
    if (tutorialService.isActive()) {
        // Configure tutorials
        configureTutorial();
        tutorialService.current(vm.title);
    }
    */

    function configureTutorial() {
        var stepsToolbar1 = [{
            element: '[tutorial-step="menu"]',
            introKey: 'dashboard.GUIDE_NAVIGATION_BAR_SETTINGS',
            position: 'bottom-left-aligned'
        }, {
            element: '[tutorial-step="search"]',
            introKey: 'dashboard.GUIDE_NAVIGATION_BAR_SEARCH',
            position: 'bottom-left-aligned'
        }, {
            element: '[tutorial-step="dashboard"]',
            introKey: 'dashboard.GUIDE_NAVIGATION_BAR_HOMEPAGE',
            position: 'bottom-left-aligned'
        }];
        var stepsToolbar2 = [{
            element: '[tutorial-step="company-selection"]',
            introKey: 'dashboard.GUIDE_NAVIGATION_BAR_CHANGE_SITE',
            position: 'bottom-right-aligned'
        }];
        var stepsSearch = fullSearchService.getTutorialStepFullSearchInput();

        var allSteps = [].concat(stepsToolbar1, stepsSearch, stepsToolbar2);

        // Register tutorial
        tutorialService.setSteps(vm.title, 0, allSteps, ['bottom-middle-aligned', 'top-middle-aligned']);
    }
}

export default UserController;
