// jscs:disable requireParenthesesAroundIIFE

SidebarController.$inject = ['$window', '$rootScope', '$state', 'sessionService',
    '$translate', 'moment', 'logger', 'dashboardFactory'
];

/* @ngInject */
function SidebarController($window, $rootScope, $state, session, $translate, moment,
    logger, fluanceDashboard) {
    var vm = this;
    var states = $state.get();

    // Properties
    vm.currentLang = null;
    vm.langSelection = ['de', 'en', 'fr', 'it'];
    vm.isMobile = $window.innerWidth < 1024;
    vm.username = null;

    // Methods
    vm.changeLang = changeLang;
    vm.collapseExtendedComponents = collapseExtendedComponents;
    vm.logout = logout;

    // Register events
    $rootScope.$on(session.EVENT_AUTHENTICATION_CHANGED, onDataInit);

    activate();
    return;

    function activate() {
        $(document).ready(function() {
            $('#notificationLink').click(function() {
                $('#notificationContainer').fadeToggle(300);
                return false;
            });

            // Document Click hiding the popup
            $(document).click(function() {
                $('#notificationContainer').hide();
            });

            // Popup on click
            $('#notificationContainer').click(function() {
                return false;
            });

            $('#sidebarPanel').bind('touchmove', function(e) {
                e.preventDefault();
            });
        });

        $rootScope.$on('$viewContentLoaded', function() {
            setTimeout(function() {
                $('#language-select').material_select();    // jshint ignore:line
            }, 250);
        });

        onDataInit();
    }

    function onDataInit() {
        // Set current user
        vm.username = (session.user) ? session.user.username : '';

        // Set language selection to current UI language
        vm.currentLang = session.getUILanguage();

        // Build left navigation sidebar menu
        getNavRoutes();
    }

    function logout() {
        session.logout();
    }

    function changeLang(lang) {
        if (!lang) { return; }

        $translate.use(lang);
        moment.locale(lang);
        vm.currentLang = lang;
        $rootScope.$broadcast('translationChanged', lang);

        if (session.user && session.user.preferredLanguage !== lang) {
            session.user
                .setUserData({
                    preferredLanguage: lang
                })
                .catch(function(exception) {
                    logger.error('Error while changing user preferredLanguage', exception);
                });
        }
    }

    function getNavRoutes() {
        vm.navRoutes = states.filter(function(state) {
            // Check role
            var display = !_.isUndefined(state.settings && state.settings.nav);

            // Check role based access control
            if (display && session.user && (state.accessControl.restrictToRoles.length > 0)) {
                display = session.user.hasRole(state.accessControl.restrictToRoles);
            }

            return display;
        }).sort(function(r1, r2) {
            return r1.settings.nav - r2.settings.nav;
        });
    }

    function collapseExtendedComponents() {
        var dashboard = fluanceDashboard.get('cockpit');
        dashboard.disableExtended();
    }
}

export default SidebarController;
