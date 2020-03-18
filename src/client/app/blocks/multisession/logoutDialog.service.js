LogoutDialogService.$inject = ['$mdDialog', '$rootScope', 'userAgentService', 'MultiSessionService', 'sessionService'];
function LogoutDialogService($mdDialog, $rootScope, userAgentService, multiSessionService, sessionService) {
    var service;

    service = {
        EVENT_LOGOUT_OTHER_SESSIONS: '$logoutOtherSessions',
        openLogoutDialog: openLogoutDialog
    };

    return service;

    // -------------------------------------------------------------

    function openLogoutDialog($event) {
        //var dialog = document.querySelector('#logoutDialog')
        //dialog.setAttribute("class", "ng-show");
        var parentEl = document.querySelector('#btnLogout');
        console.log('openLogoutDialog', multiSessionService.isDeviceLogoutEnabled());
        $mdDialog.show({
            locals: {
                openSessionList: multiSessionService.getDeviceSessions(),
                isDeviceLogoutEnabled: multiSessionService.isDeviceLogoutEnabled()
            },
            bindToController: true,
            controller: [DialogController],
            controllerAs: '$ctrl',
            targetEvent: $event,
            clickOutsideToClose: true,
            escapeToClose: true,
            template: '<logout-dialog open-session-list="$ctrl.openSessionList" is-device-logout-enabled="$ctrl.isDeviceLogoutEnabled" on-close="$ctrl.closeLogoutDialog()" on-logout="$ctrl.userLogout()"></logout-dialog>'
        });

        function DialogController() {
            var vm = this;

            console.log('DialogController');

            //vm.openSessionList = openSessionList;
            vm.closeLogoutDialog = closeLogoutDialog;
            vm.userLogout = userLogout;

            // -------------------------------------------------

            function userLogout() {
                var ownSessionId;
                var sessionList = [];
                vm.openSessionList.forEach(function(session) {
                    if (session.current && session.selected) {
                        ownSessionId = session.id;
                    } else if(session.selected) {
                        sessionList.push(session.id);
                    }
                });

                if (!_.isUndefined(ownSessionId)) {
                    multiSessionService.logoutDevices(sessionList).then(function () {
                        sessionService.logout();
                    });
                } else {
                    $rootScope.$broadcast(service.EVENT_LOGOUT_OTHER_SESSIONS, {});
                }
                closeLogoutDialog();
            }

            function closeLogoutDialog() {
                $mdDialog.hide();
            }

            function getOSFromUserAgent(userAgent) {
            }

            function getDeviceTypeFromUserAgent(userAgent) {
                var deviceType = userAgentService.get(mockNav);
                console.log('browser: ', browser);
                return browser;
            }

            function getBrowserFromUserAgent(userAgent) {
                var browser = userAgentService.getBrowser(userAgent);
                console.log('browser: ', browser);
                return browser;
            }
        }
    }

}


export default LogoutDialogService;
