/**
  * Add redirect feature to ui-router (in config)
  * Only npm package, no bower. Create and add to project.
  * https://www.npmjs.com/package/angular-ui-router-redirect
 **/
(function () {
    "use strict";

    // ====================================
    // @DEPRECATED
    // ====================================

    /*
    angular
        .module("blocks.router")
        .run(RedirectConfig);

    RedirectConfig.$inject = ["$rootScope", "$state"];
    function RedirectConfig($rootScope, $state) {
        $rootScope.$on("$stateChangeStart", redirect);

        function redirect(event, toState, params) {
            if(toState.redirectTo) {
                event.preventDefault();
                $state.go(toState.redirectTo, params, {location: "replace"});
            }
        }
    }
    */
})();

