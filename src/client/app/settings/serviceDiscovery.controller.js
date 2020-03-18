ServiceDiscoveryController.$inject = ['authenticationService', 'config', 'routerService'];

/* @ngInject */
function ServiceDiscoveryController(authenticationService, config, routerService) {
    /*jshint validthis: true */
    var vm = this;
    vm.title = config.title;
    vm.providers = [];

    vm.callProvider = callProvider;

    activate();
    return vm;

    // ------------------------------------------------------------------------- Initialization

    function activate() {
        getServiceProviders();

        //if (tutorialService.isActive()) {
        //    // Configure tutorials
        //    configureTutorial();
        //    tutorialService.current(vm.title);
        //}
    }

    // ------------------------------------------------------------------------- Helper methods

    function configureTutorial() {
        //tutorialService
        //    .setSteps(vm.title, 0, [{
        //        element: '[tutorial="service-providers"]',
        //        introKey: 'layout.GUIDE_LOGIN_MSG',
        //        position: 'bottom-middle-aligned'
        //    }]);
    }

    function callProvider(link) {
        document.location.href = link;
    }

    function getServiceProviders() {
        var path = routerService.urlInfo.path;
        var query = routerService.urlInfo.getQueryString();
        var hash = routerService.urlInfo.getHashString();

        // Redirecting to 'error' is not allowed
        if (location.hash.indexOf('/error') > -1) {
            hash = '';
        }

        // Build redirection link
        var redirectUrl = path + query;

        if (hash.indexOf('service-discovery') === -1) {
            // Hack: Pass hash part as query parameter (server doesn't handle hash part)
            if (hash.indexOf('#') === 0) {
                var concatenationCharacter = (query.length > 0) ? '&' : '?';
                hash = concatenationCharacter + 'nav=' + hash.substr(1);
                redirectUrl = redirectUrl + hash;
            }
        }

        // Add provider
        authenticationService
            .getServiceProviders(redirectUrl)
            .then(function(providers) {
                vm.providers = providers;
            });
    }
}

export default ServiceDiscoveryController;
