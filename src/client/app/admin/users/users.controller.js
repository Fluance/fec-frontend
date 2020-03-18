import _ from 'lodash';

AdminUsersController.$inject = [
    '$q',
    '$state',
    '$stateParams',
    '$translate',
    'dataservice.domain',
    'dataservice.users',
    'logger'
];

/* @ngInject */
function AdminUsersController($q, $state, $stateParams, $translate, dataServiceDomain, dataServiceUsers, logger) {
    /*jshint validthis: true */
    var vm = this;
    vm.title = 'Settings Controller';

    // Properties
    vm.username = $stateParams.username;
    vm.foundUsers = null;
    vm.domain = $stateParams.domain || 'PRIMARY';
    vm.domains = [];
    vm.isLoading = false;

    // Methods
    vm.onKeyUp = onKeyUp;
    vm.search = search;
    vm.goToUser = goToUser;
    vm.isUsernameMatching = isUsernameMatching;
    vm.goToCreateProfile = goToCreateProfile;

    _activate();
    return vm;

    // ------------------------------------------------------------------------- Initialization

    function _activate() {
        _loadDomains();
    }

    // --------------------------------------------------------------- Interface implementation

    function onKeyUp(event) {
        if (event.keyCode === 13) { this.search(); }
    }

    function search() {
        vm.searchedUsername = vm.username;
        if (vm.username && vm.username.length > 2 && vm.domain) {
            dataServiceUsers.searchUserProfiles(vm.searchedUsername, vm.domain).then((profiles) => {
                if (profiles && profiles.length == 1) {
                    goToUser(profiles[0].username);
                } else {
                    vm.foundUsers = profiles;
                }
            });
        } else {
            $q.all([
                $translate('admin.USERNAME'),
                $translate('admin.SEARCH_USER_MIN_LETTER')
            ])
            .then(function(data) {
                logger.warning(data[1], data[0], false);
            });
        }
    }

    function goToUser(username) {
        vm.foundUsers = null;
        $state.go('admin.users.profile', {
            username: username,
            domain: vm.domain
        }, {
            'reload': true,
            'inherit': false
        });
    }

    function goToCreateProfile(username, domain) {
        vm.foundUsers = null;
        $state.go('admin.users.form', {
            username: username,
            domain: domain,
            action: 'add'
        }, {
            'reload': true,
            'inherit': false
        });
    }

    function isUsernameMatching(username, userList) {
        let isMatching = false;
        _.each(userList, (user) => {
            if (user.username === username) {
                isMatching = true;
            }
        });
        return isMatching;
    }

    // ------------------------------------------------------------------------- Helper methods

    function _loadDomains() {
        vm.isLoading = true;
        dataServiceDomain.getDomainList()
            .then(function(data) {
                vm.domain = vm.domain ? vm.domain : data[0].name;
                _.each(data, function(domain) {
                    vm.domains.push(domain.name);
                });
            })
            .finally(function() {
                vm.isLoading = false;
            });
    }
}

export default AdminUsersController;
