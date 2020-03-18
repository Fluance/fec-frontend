const fecLastState = {
    bindings: {},
    controller: ['$mdToast', '$state', '$translate', 'sessionService', controller],
};

function controller($mdToast, $state, $translate, sessionService) {
    var vm = this;

    if ($state.fluanceLastState === undefined && sessionService.isAuthenticated() && _.isObject(sessionService.user.lastState) && sessionService.user.lastState.name !== 'mycockpit') {
        var lastState = sessionService.user.lastState;
        if (lastState) {
            var toastText = $translate.instant('dashboard.LAST_SESSION');

            var toast = $mdToast.simple()
                .textContent(toastText)
                .action($translate.instant('core.OK'))
                .highlightAction(true)
                .highlightClass('md-accent')
                .position('bottom right')
                .hideDelay(10000)
                .theme('fluance-toast');

            $mdToast.show(toast).then(function(response) {
                if (response === 'ok') {
                    $state.go(lastState.name, lastState.params);
                }
            });
        }
    }

    return vm;

    // ------------------------------------------------------------------------- Event handling
}

export default fecLastState;


// (function() {
//     'use strict';

//     angular
//         .module('blocks.fecLastState')
//         .factory('fecLastState', fecLastState);

//     fecLastState.$inject = ['$mdToast', 'localStorageService', '$state', 'sessionService', 'routerService'];

//     function fecLastState($mdToast, localStorageService, $state, sessionService, routerService) {

//         var service = {
//             test: test
//         };

//         return service;

//         routerService.stateChangedSuccess.subscribe(_stateChanged(args));

//         function _stateChanged(args) {
//             console.log('args');
//         }

//         function test() {
//             var lastState = localStorageService.get('lastState');
//             if (lastState) {
//                 var toastText = 'Do you want to go back to ' + lastState.name + '?';

//                 var toast = $mdToast.simple()
//                     .textContent(toastText)
//                     .action('GO')
//                     .highlightAction(true)
//                     .highlightClass('md-accent') // Accent is used by default, this just demonstrates the usage.
//                     .position('bottom right')
//                     .hideDelay(10000)
//                     .theme('fluance-toast');

//                 $mdToast.show(toast).then(function(response) {
//                     if (response === 'ok') {
//                         $state.go(lastState.name, lastState.params);
//                     }
//                 });
//             }
//         }
//     }
// }());
