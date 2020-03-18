import angular from 'angular';
import _ from 'lodash';

AdminProfileFormController.$inject = [
    '$document', '$filter', '$q', '$rootScope', '$stateParams', '$state', '$translate',
    'userService', 'logger', 'config', 'authenticationService', 'dataservice.companies',
    'dataservice.dataProviders', 'sessionService', 'dataservice.roles'
];

/* @ngInject */
function AdminProfileFormController(
    $document, $filter, $q, $rootScope, $stateParams, $state, $translate,
    userService, logger, config, auth, companyService,
    dataserviceDataProviders, session, dataserviceRoles) {

    var ACTION_ADD = 'add';
    var ACTION_UPDATE = 'update';

    /*jshint validthis: true */
    var vm = this;
    vm.title = 'Profile Controller';
    vm.lang = config.lang;
    vm.config = config;

    vm.username = $stateParams.username;
    vm.domain = $stateParams.domain;
    // vm.domain = ($stateParams.domain ? $stateParams.domain : 'corporate'); //JW to change
    vm.action = $stateParams.action;
    vm.directiveIsLoaded = $q.defer();
    vm.allCompanySelected = false;
    vm.allUnitsSelected = false;
    vm.allServicesSelected = false;
    vm.newSelectedLang = getSelectedDefLang();

    vm.model = {};

    vm.error = null;
    vm.warning = null;
    vm.hasWarning = false;

    // Functions for the UI sorted by name
    vm.cancel = cancel;
    vm.isOwnProfile = isOwnProfile;
    vm.submit = submit;
    vm.search = search;
    vm.toggleAllCompanies = toggleAllCompanies;
    vm.toggleAllUnits = toggleAllUnits;
    vm.toggleAllServices = toggleAllServices;

    //vm.roles = _.map(vm.config.roles, function(role) { return { role: _.first(role) }; });
    vm.roles = [];

    activate();

    function activate() {

        if (vm.action === ACTION_UPDATE) {
            vm.title = 'Edit Profile';

            vm.loading = true;

            // data loading
            $q.all([
                userService.getUser(vm.username, vm.domain, true),
                companyService.getCompanyList(),
                dataserviceDataProviders.getDataProviderList(),
                dataserviceRoles.getRolesList()
            ])
                .then(function(values) {
                    var user = values[0];
                    var userCompanies = (_.isObject(user.companies)) ? _.values(user.companies) : user.companies;
                    var allCompanies = values[1];
                    var dataProviders = values[2];
                    _loadRoles(values[3]);

                    var myModelCompanies = convertProfileToModel(userCompanies, allCompanies, dataProviders);

                    vm.model = {
                        'userFound': user,
                        'id': user.id,
                        'profileLanguage': user.profileLanguage,
                        'companies': myModelCompanies,
                        'domain': user.domain,
                        'roles': user.roles
                    };
                })
                .then(function() {
                    // Directive directive
                    return vm.directiveIsLoaded.promiseUser;
                })
                .finally(function() {
                    vm.loading = false;
                });
        }
        else if (vm.action === ACTION_ADD) {
            vm.title = 'Add Profile';

            vm.loading = true;

            // data loading
            $q.all([
                companyService.getCompanyList(),
                dataserviceDataProviders.getDataProviderList(),
                dataserviceRoles.getRolesList()
            ])
                .then(function(values) {
                    var userCompanies = [];
                    var allCompanies = values[0];
                    var dataProviders = values[1];
                    _loadRoles(values[2]);

                    var myModelCompanies = convertProfileToModel(userCompanies, allCompanies, dataProviders);

                    vm.model = {
                        'id': null,
                        'profileLanguage': config.lang,
                        'companies': myModelCompanies,
                        'domain': vm.domain,
                        'roles': []
                    };
                })
                .then(function() {
                    return vm.directiveIsLoaded.promiseUser;
                })
                .finally(function() {
                    vm.loading = false;
                });

        } else {
            $state.go('error');
        }
    }

    function cancel() {
        if (vm.model.id) {
            $state.go('admin.users.profile', {
                username: vm.username,
                domain: vm.domain
            });
        }
        else {
            $state.go('admin.users');
        }
    }

    /**
     * Convert model object
     * @param  {[type]} modelCompanies [description]
     * @return {[type]}                [description]
     */

    //profile contains only entries for companies and units that the user has access to
    //so here we have to add only those companies/units to the output array with hasAccess == true
    function convertModelToProfile(modelCompanies) {
        var res = [];
        var nCompanies = modelCompanies.length;
        for (var i = 0; i < nCompanies; i++) {
            if (modelCompanies[i].hasAccess === true) {

                // units
                var units = [];
                modelCompanies[i].units.forEach(function(unit) {
                    if (unit.hasAccess) {
                        units.push({
                            code: unit.code,
                            codeDesc: unit.codeDesc
                        });
                    }
                });

                // services
                var services = [];
                modelCompanies[i].services.forEach(function(hospService) {
                    if (hospService.hasAccess) {
                        services.push({
                            code: hospService.code,
                            codeDesc: hospService.codeDesc
                        });
                    }
                });

                // staffInfos
                var staffInfos = [];
                modelCompanies[i].staffInfos.forEach(function(staffInfo) {
                    if (staffInfo.staffId !== '') {
                        staffInfos.push({
                            providerId: staffInfo.providerId,
                            staffId: staffInfo.staffId
                        });
                    }
                });

                // Build model object
                res.push({
                    id: modelCompanies[i].companyId,
                    units: units,
                    hospServices: services,
                    staffInfos: staffInfos
                });
            }
        }
        return res;
    }

    /**
     * Convert profile object to direct object
     * @param  {Array<Object>} profileCompanies    This is user.companies object
     * @return {Object}                     Return model object
     */

    //profile contains only entries for companies and units that the user has access to
    function convertProfileToModel(profileCompanies, allCompanies, dataProviders) {

        var companyListArray = [];

        if (allCompanies) {
            var companyListObject = {};

            allCompanies.forEach(function(element, index, array) {
                // Activate company
                if (angular.isDefined(element.id)) {
                    // Build profile object
                    companyListObject[element.id] = {
                        companyId: element.id, //id = number
                        code: element.code,
                        name: element.name, //long name
                        hasAccess: false,
                        units: convertUnitsToModel(element.units),
                        services: convertHospServicesToModel(element.hospServices),
                        staffInfos: convertDataProvidersToModel(dataProviders)
                    };
                }
            });

            profileCompanies.forEach(function(element, index, array) {
                // Activate company
                if (angular.isDefined(element.id)) {
                    // Build profile object
                    companyListObject[element.id].hasAccess = true;

                    element.units.forEach(function(unitelement, unitindex, unitarray) {
                        if (angular.isDefined(unitelement)) {
                            //NULLCHECKS
                            if (angular.isDefined(companyListObject[element.id])) {

                                //find index of unit whose code === unitelement (e.g., "01")
                                var index = _.findIndex(companyListObject[element.id].units, function(item) {
                                    return item.code === unitelement.code;
                                });
                                if (angular.isDefined(companyListObject[element.id].units[index])) {
                                    companyListObject[element.id].units[index].hasAccess = true;
                                }
                            }
                        }
                    });

                    element.hospServices.forEach(function(servicelement, serviceindex, servicearray) {
                        if (angular.isDefined(servicelement)) {
                            //NULLCHECKS
                            if (angular.isDefined(companyListObject[element.id])) {
                                //find index of unit whose code === unitelement (e.g., "01")
                                var index = _.findIndex(companyListObject[element.id].services, function(item) {
                                    return item.code === servicelement.code;
                                });
                                if (angular.isDefined(companyListObject[element.id].services[index])) {
                                    companyListObject[element.id].services[index].hasAccess = true;
                                }
                            }
                        }
                    });

                    dataProviders.forEach(function(provider) {
                        // Create provider object with providerId and providerName
                        var providerObj = {
                            providerId: provider.id,
                            providerName: provider.name,
                            staffId: ''
                        };

                        // Find staffId for provider id in element.staffids
                        element.staffInfos.forEach(function(staffInfo) {
                            if (provider.id === staffInfo.providerId) {
                                providerObj.staffId = staffInfo.staffId;
                            }
                        });
                        // Check foreach entry of staffids if this providerId already exists,
                        // if yes replace the staffId with real value
                        companyListObject[element.id].staffInfos.forEach(function(staffInfo) {
                            if (staffInfo.providerId === providerObj.providerId) {
                                //set staffId
                                staffInfo.staffId = providerObj.staffId;
                            }
                        });
                    });
                }
            });

            var listOfCompanyCodes = _.keys(companyListObject);
            listOfCompanyCodes.forEach(function(key) {
                companyListArray.push(companyListObject[key]);
            });

            return companyListArray;
        }
        else {
            return companyListArray;
        }

    }

    function convertUnitsToModel(units) {
        var unitListObject = units.map(function(item) {
            return {
                code: item.code,
                codeDesc: item.codeDesc,
                hasAccess: false
            };
        });
        return unitListObject;
    }

    function convertHospServicesToModel(hospServices) {
        var serviceListObject = hospServices.map(function(item) {
            return {
                code: item.code,
                codeDesc: item.codeDesc,
                hasAccess: false
            };
        });
        return serviceListObject;
    }

    function convertDataProvidersToModel(dataProviders) {
        var providers = dataProviders.map(function(item) {
            return {
                providerId: item.id,
                providerName: item.name,
                staffId: ''
            };
        });
        return providers;
    }

    //Get the default language
    function getSelectedDefLang() {
        $('#selectedDefLang').change(function() {
            var e = document.getElementById('selectedDefLang');
            vm.newSelectedLang = e.options[e.selectedIndex].text;
            return vm.newSelectedLang;
        });
    }

    function toggleAllCompanies() {

        vm.allCompanySelected = !vm.allCompanySelected;

        if (vm.allCompanySelected) {
            for (var i = 0; i < vm.model.companies.length; i++) {
                vm.model.companies[i].hasAccess = true;
            }
        } else {

            for (var j = 0; j < vm.model.companies.length; j++) {
                vm.model.companies[j].hasAccess = false;
            }
        }

        return vm.allCompanySelected;
    }

    /**
     * Automatically toggle all checkbox in units which are selected companies.
     * @return {Boolean false}
     */
    function toggleAllUnits() {

        vm.allUnitsSelected = !vm.allUnitsSelected;

        // For each company
        for (var i = 0; i < vm.model.companies.length; i++) {
            if (vm.model.companies[i] && vm.model.companies[i].hasAccess) {

                _.each(vm.model.companies[i].units, function(unit) {
                    unit.hasAccess = vm.allUnitsSelected;
                });
            }
        }
        return vm.allUnitsSelected;
    }

    /**
     * Automatically toggle all checkbox in units which are selected companies.
     * @return {Boolean false}
     */
    function toggleAllServices() {

        vm.allServicesSelected = !vm.allServicesSelected;

        // For each company
        for (var i = 0; i < vm.model.companies.length; i++) {
            if (vm.model.companies[i] && vm.model.companies[i].hasAccess) {

                _.each(vm.model.companies[i].services, function(service) {
                    service.hasAccess = vm.allServicesSelected;
                });
            }
        }
        return vm.allServicesSelected;
    }

    function isOwnProfile() {
        return (session.user && vm.username === session.user.username && vm.domain === session.user.domain);
    }

    function search() {
        if (vm.username && vm.domain) {
            $state.go('admin.users.profile', {
                username: vm.username,
                domain: vm.domain
            }, {
                    'reload': true,
                    'inherit': false
                });
        } else {
            $q.all([
                $translate('admin.SEARCH_NOUSERNAME'),
                $translate('admin.SEARCH_PLACEHOLDER')
            ])
                .then(function(data) {
                    logger.warning(data[1], data[0], false);
                });
        }
    }

    function submit() {
        var promise = null;
        vm.hasWarning = false;

        switch (vm.action) {
            case ACTION_ADD:
                promise = userService
                    .createUser(
                    vm.username,
                    vm.domain,
                    convertModelToProfile(vm.model.companies),
                    vm.model.roles,
                    vm.model.profileLanguage
                    );
                break;

            case ACTION_UPDATE:
                var updatedCompanies = convertModelToProfile(vm.model.companies);

                //Update roles with the data from the form
                vm.model.userFound.roles = vm.model.roles;

                //Update companies with the data from the form
                vm.model.userFound.companies = updatedCompanies;

                //Updated preferredLanguage
                vm.model.userFound.profileLanguage = vm.model.profileLanguage;

                promise = vm.model.userFound.saveUserProfile()
                    .then(function () {
                        return true;
                    })
                    .catch(function (exception) {
                        handleError(exception);

                        return false;
                    });
                break;
        }

        // Create/update user profile
        promise
            .then(function() {
                if ((vm.action === ACTION_UPDATE) && isOwnProfile() && vm.hasWarning === false) {
                    // If the edited user is the currently logged-in user,
                    // we log out --> forcing the user to re-log-in in order to reload the profile
                    return session.logout();

                    // TODO: Refactor - Reloading the user should be enough.
                    //                  Verify the side effects (when i.e. roles have changed)
                    //                  Consume 'authenticationStateChanged' event to know when the user has changed
                    // return session.loadUser();
                }
                else if (vm.hasWarning === false) {
                    $state.go('admin.users.profile', {
                        username: vm.username,
                        domain: vm.domain
                    });
                }
            })
            .catch(function(exception) {
                handleError(exception);
            })
            .finally(function() {
                return false;
            });

        //return false;
    }

    function handleError(exception) {
        var errorMessage;
        if (angular.isDefined(exception.status) && exception.status === 409) {
            vm.hasWarning = true;
            vm.warning = {
                'message': 'error.INVALID_STAFFID',
            };
            errorMessage = $filter('translate')(vm.warning.message);
        } else {
            vm.hasWarning = true;
            vm.warning = {
                'message': 'error.ERROR',
            };
            errorMessage = exception.data.message;
        }
        logger.error(errorMessage);
    }

    function _loadRoles(rolesData){
        vm.roles = rolesData;
    }
}

export default AdminProfileFormController;
