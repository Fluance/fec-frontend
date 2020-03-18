import angular from 'angular';
import templateJsonDialog from './jsonDialog.tmpl.html';
import templateDeleteDialog from './deleteDialog.tmpl.html';

AdminUsersProfileController.$inject = ['$state', '$stateParams', '$q',
    'userService', 'dataservice.companies', 'dataservice.dataProviders',
    '$translate', 'config', 'logger', '$mdDialog'
];

/* @ngInject */
function AdminUsersProfileController($state, $stateParams, $q, userService,
    companies, dataserviceDataProviders, $translate, config, logger, $mdDialog) {

    /*jshint validthis: true */
    var vm = this;
    var userProfileString;

    vm.title = 'Settings Controller';
    vm.config = config;

    vm.username = $stateParams.username;
    vm.domain = $stateParams.domain;

    vm.errorMessage = null;

    vm.spin = true;
    vm.userFound = null;
    vm.rolesSort = null;

    vm.userProfileUndefined = false;
    vm.userProfileFormVisible = false;

    // Functions for the UI sorted by name
    vm.equals = equals;
    vm.hasEmails = hasEmails;
    vm.hasTelephons = hasTelephons;
    vm.openJsonDialog = openJsonDialog;
    vm.openDeleteDialog = openDeleteDialog;

    vm.hasWarningMessage = false;
    vm.showWarning = showWarning;
    vm.clearWarning = clearWarning;

    activate();

    function activate() {
        vm.userInfoString = null;
        vm.errorServer = true;
        vm.userProfileFormVisible = false;

        if (vm.username.length > 2) {

            var promiseUser = userService.getUser(vm.username, vm.domain, true);
            var promiseDataProviders = dataserviceDataProviders.getDataProviderList();
            var promises = [promiseUser, promiseDataProviders];

            $('#searchForUserProgress').show();

            clearWarning();

            // Get info
            $q.all(promises)
                .then(function(values) {
                    vm.userFound = values[0];
                    var dataProviders = values[1];

                    if (vm.userFound) {
                        vm.companies = vm.userFound.companies;
                        userProfileString = JSON.stringify(vm.userFound, null, 3);
                        if (vm.userFound.roles) {
                            vm.rolesSort = vm.userFound.roles.sort();
                        }
                    } else {
                        vm.companies = [];
                        userProfileString = undefined;
                    }
                })
                .catch(function(exception) {

                    vm.errorMessage = exception.data.message;

                    if (exception.profileCorrupted) {
                        vm.profileCorrupted = true;
                    } else if (exception.hasEmptyProfile) {
                        vm.userProfileUndefined = true;
                    }

                    //switch exception status

                    switch (exception.status) {
                        case 0:
                        case 500:
                            showWarning('admin.ERROR_ACCESSING_DATA');
                            break;

                        case 404:
                            vm.hasWarningMessage = true; //enable no user message box on UI
                            break;

                        default:
                            showWarning('error.ERROR');
                    }

                }).finally(function() {
                    // Wait finally to set userInfo and display data.
                    $('#searchForUserProgress').hide();
                    vm.spin = false;
                });
        } else {
            $q.all([
                $translate('admin.USERNAME'),
                $translate('admin.SEARCH_NOUSERNAME')
            ])
            .then(function(data) {
                logger.warning(data[1], data[0], false);
            });
        }


    }

    function showWarning(messageCode) {
        logger.error($translate.instant(messageCode));
    }

    function clearWarning() {
        vm.hasWarningMessage = false;
    }

    function equals(o1, o2) {
        return angular.equals(o1, o2);
    }

    function hasEmails() {
        return (vm.userFound && vm.userFound.emails && vm.userFound.emails.length > 0);
    }

    function hasTelephons() {
        return (vm.userFound && vm.userFound.telephons && vm.userFound.telephons.length > 0);
    }

    function openJsonDialog(ev) {
        var template = templateJsonDialog;
        var ctrlAndDep = ['$mdDialog', DialogController];

        function DialogController($mdDialog) {
            var vm = this;
            vm.config = config;
            vm.userProfileString = userProfileString;
            vm.closeDialog = function() {
                $mdDialog.hide();
            };
        }
        _openDialog(ev, template, ctrlAndDep);
    }

    function openDeleteDialog(ev, userFound) {
        var template = templateDeleteDialog;
        var ctrlAndDep = ['$mdDialog', DialogController];

        function DialogController($mdDialog) {
            var vm = this;
            vm.userFound = userFound;
            vm.closeDialog = function() {
                $mdDialog.hide();
            };
            vm.deleteUser = function() {
                vm.userFound.deleteUser()
                    .then(function() {
                        $state.go('admin.users', {}, {
                            'reload': true,
                            'inherit': false
                        });
                    })
                    .catch(function(exception) {
                        logger.error('Error while deleting user', exception);
                    })
                    .finally(function() {
                        $mdDialog.hide();
                    });
            };
        }
        _openDialog(ev, template, ctrlAndDep);
    }

    function _openDialog(ev, template, ctrlAndDep) {
        $mdDialog.show({
            parent: angular.element(document.body),
            targetEvent: ev,
            templateUrl: template,
            controller: ctrlAndDep,
            controllerAs: 'vm',
            clickOutsideToClose: true,
            escapeToClose: true
        });
    }
}

export default AdminUsersProfileController;
