import templateAdmin from './admin.html';
import templateUsers from './users/users.html';
import templateUsersProfile from './users/usersProfile.html';
import templateUserProfileForm from './users/profile.form.html';
run.$inject = ['routerService'];

/* @ngInject */
function run(routerService) {
    routerService.configureStates(getStates());
}

function getStates() {
    return [{
        state: 'admin',
        config: {
            url: '/admin',
            templateUrl: templateAdmin,
            controller: 'AdminController',
            controllerAs: 'vm',
            titleI18n: 'admin.ADMIN'
        }
    },
    {
        state: 'admin.users',
        parent: 'admin',
        config: {
            url: '/users',
            templateUrl: templateUsers,
            titleI18n: 'admin.USERS',
            settings: {
                nav: 2,
                i18n: 'ADMIN',
                content: 'lock',
                mobilewarn: true
            },
            requiredTranslationParts: ['admin']
        }
        // config: {
        //     url: '/users',
        //     templateUrl: 'app/admin/profile/usersearch.component.html',
        //     controller: 'adminSearchController',
        //     controllerAs: 'vm',
        //     titleI18n: 'admin.USERS',
        //     restrictAccess: 'sysadmin',
        //     requiredTranslationParts: ['admin', 'layout', 'dashboard', 'settings']
        // }
    }, {
        state: 'admin.users.profile',
        parent: 'admin.users',
        config: {
            url: '/:username/:domain',
            templateUrl: templateUsersProfile,
            controller: 'AdminUsersProfileController',
            controllerAs: 'vm',
            titleI18n: 'admin.USERS',
            requiredTranslationParts: ['admin', 'settings', 'layout', 'search', 'patient', 'visit']
        }
    }, {
        state: 'admin.users.form',
        parent: 'admin.users',
        config: {
            url: '/:username/:domain/:action',
            templateUrl: templateUserProfileForm,
            controller: 'AdminProfileFormController',
            controllerAs: 'vm',
            titleI18n: 'admin.USERS',
            requiredTranslationParts: ['admin', 'layout', 'dashboard', 'settings']
        }
    }];
    /*
    ==> NOT USED, DEPRECATED??
    {
        state: 'admin.usersearch',
        parent: 'admin',
        config: {
            url: '/users',
            templateUrl: 'app/admin/profile/usersearch.component.html',
            controller: 'adminSearchController',
            controllerAs: 'vm',
            titleI18n: 'admin.USERS',
            requiredTranslationParts: ['admin', 'layout', 'dashboard', 'settings']
        }
    },
    {
        state: 'admin.profile',
        parent: 'admin',
        config: {
            url: '/:username/:domain/:action',
            templateUrl: 'app/admin/profile/profile.component.html',
            controller: 'profileController',
            controllerAs: 'vm',
            titleI18n: 'admin.USERS',
            requiredTranslationParts: ['admin', 'layout', 'dashboard', 'settings']
        }
    },
    {
        state: 'admin.logs',
        parent: 'admin',
        config: {
            url: '/logs',
            templateUrl: 'app/admin/logs/logs.component.html',
            controller: 'logsController',
            controllerAs: 'vm',
            titleI18n: 'admin.USERS',
            requiredTranslationParts: ['admin', 'layout', 'dashboard', 'settings']
        }
    },
    {
        state: 'admin.config',
        parent: 'admin',
        config: {
            url: '/config',
            templateUrl: 'app/admin/configuration/configuration.component.html',
            controller: 'configurationController',
            controllerAs: 'vm',
            titleI18n: 'admin.USERS',
            requiredTranslationParts: ['admin', 'layout', 'dashboard', 'settings']
        }
    }];
    */
}

export default run;
