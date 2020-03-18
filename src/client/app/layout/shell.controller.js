// jscs:disable requireParenthesesAroundIIFE
// Turn off jshint rules:
/*jshint -W101*/ //  Line too long
import templateCompanySelection from './components/companySelection.dialog.html';

ShellController.$inject = [
    '$mdDialog',
    '$mdMedia',
    '$mdSidenav',
    '$window',
    '$rootScope',
    '$scope',
    '$state',
    '$transitions',
    '$filter',
    'layoutService',
    'sessionService',
    'logger',
    '$q',
    //'tutorialService',
    'config',
    'dashboardFactory',
    'TabOpenerService',
    'userAgentService',
    '$anchorScroll'
];

/* @ngInject */
function ShellController(
    $mdDialog,
    $mdMedia,
    $mdSidenav,
    $window,
    $rootScope,
    $scope,
    $state,
    $transitions,
    $filter,
    layoutService,
    session,
    logger,
    $q,
    //tutorialService,
    config,
    fluanceDashboard,
    tabOpener,
    userAgent,
    $anchorScroll
) {

    var fnTranslate = $filter('translate');

    var vm = this;
    vm.companies = null;
    vm.selectedCompany = null;

    vm.isAuthenticated = function () { return session.isAuthenticated(); };
    vm.hasAccessToCompanies = function () {
        return (session.user) ? session.user.hasAccessToCompanies() : false;
    };

    vm.logger = logger;
    vm.state = $state;

    vm.showSplash = true;
    vm.searchMenuState = 'menu';
    vm.preventPageScrolling = false;

    vm.routingCurrentState = null;
    vm.routingPreviousState = null;
    vm.routingPreviousStateParams = null;
    //vm.tutorialService = tutorialService;
    //vm.sidebarSearchCurrentTutorialChapter = tutorialService.CHAPTER_NAME_SIDEBAR_SEARCH;

    vm.isChecked = null;

    vm.isSidenavSearchOpen = false;
    vm.isSidenavMenuOpen = false;

    vm.searchTemplates = [{
        title: 'criteria',
        url: 'app/search/templates/criteria.html'
    }, {
        title: 'id',
        url: 'app/search/templates/id.html'
    }, {
        title: 'location',
        url: 'app/search/templates/location.html'
    }];

    // Methods
    vm.toggleSidenavMenu = toggleSidenavMenu;
    vm.toggleSidenavSearch = toggleSidenavSearch;
    vm.canNavigateBack = canNavigateBack;
    vm.changeCompany = changeCompany;
    vm.changeSearchMenu = changeSearchMenu;
    vm.closeModal = closeModal;
    vm.collapseExtendedComponents = collapseExtendedComponents;
    vm.getTutorialClassName = getTutorialClassName;
    vm.gotToLink = gotToLink;
    vm.navigateBack = navigateBack;
    vm.openModal = openModal;
    //vm.showTutorialSidebarMenu = showTutorialSidebarMenu;
    //vm.showTutorialSidebarSearch = showTutorialSidebarSearch;
    vm.changeSelectedCompany = changeSelectedCompany;
    vm.isMobile = userAgent.isMobileSize;

    // Register events
    $rootScope.$on(session.EVENT_AUTHENTICATION_CHANGED, onAuthenticationStateChanged);
    $rootScope.$on(session.EVENT_SELECTED_COMPANY_CHANGED, onSelectedCompanyChanged);
    $transitions.onSuccess({}, onRoutingStateChanged);
    $rootScope.$on('$redirectToLogin', onRedirectToLogin);

    activate();

    // ------------------------------------------------------------------------- Event handlers

    function onAuthenticationStateChanged(e, args) {
        if (args.isAuthenticated) {
            // Initialize list of assigned companies
            vm.companies = (session.user) ? session.user.companies : [];
        }
        else {
            switch (args.reason) {
                case session.AUTHENTICATION_CHANGED_REASONS.LOGOUT:
                    // Logging out -> nothing to do
                    break;

                case session.AUTHENTICATION_CHANGED_REASONS.SESSION_TIMEOUT:
                    $state.go('error', { errorCode: 'SESSION_TIMEOUT' });
                    break;

                default:
                    throw new Error('Unknown authenticationChanged reason: ' + args.reason);
            }
        }
    }

    function onSelectedCompanyChanged() {
        // initialize/update company selection
        vm.selectedCompany = session.getSelectedCompany();

        vm.isLoadingSelectedCompany = true;
        _loadCompanyLogo();
    }

    function onRoutingStateChanged(transition) {
        var toState = transition.to();
        var fromState = transition.from();
        var fromParams = transition.params('from');

        // Close Sidenavs
        if (vm.isSidenavMenuOpen) {
            $mdSidenav('menu').close();
        }
        if (vm.isSidenavSearchOpen) {
            $mdSidenav('search').close();
        }

        vm.routingCurrentState = toState;
        if ((angular.isDefined(toState.canNavigateBack) &&
            toState.canNavigateBack) && // Check for navigate-back support
            (angular.isString(fromState.name) &&
                fromState.name.length > 0)) // has previous state to naviagate back too
        {
            vm.routingPreviousState = fromState;
            vm.routingPreviousStateParams = fromParams;
        } else {
            vm.routingPreviousState = null;
            vm.routingPreviousStateParams = null;
        }

        vm.hideNavigation = toState.hideNavigation;
    }

    function onRedirectToLogin() {
        session.logout();
    }

    // ------------------------------------------------------------------------- Initialization

    function activate() {
        // Set scrollable container (relevant for infinite-scroll)
        layoutService.scrollableContainerSelector = '.fec-shell md-content[ui-view]';

        // Deal with goTopButton and Feedback button
        var container = angular.element(document);
        var topButtonIsVisible = false;
        container.on('scroll', function () {
            if (!topButtonIsVisible && container.scrollTop() > config.scrollTopLimit) {
                $('#btn-scrolltop').addClass('show');
            } else {
                $('#btn-scrolltop').removeClass('show');
            }
        });
        $('#btn-scrolltop').on('click', function () {
            $('html, body').animate({ scrollTop: 0 }, 400);
        });

        // Set on close for the sidenavs
        $mdSidenav('search').onClose(function () {
            vm.isSidenavSearchOpen = false;
        });
        $mdSidenav('menu').onClose(function () {
            vm.isSidenavMenuOpen = false;
        });

        //configureTutorialSidebarMenu();
        //configureTutorialSidebarSearch();
    }

    // --------------------------------------------------------------- Interface implementation

    function toggleSidenavMenu() {
        vm.isSidenavMenuOpen = !vm.isSidenavMenuOpen;
        if (vm.isSidenavSearchOpen) _closeSidenavSearch();
        $mdSidenav('menu').toggle();
    }

    function _closeSidenavMenu() {
        vm.isSidenavMenuOpen = false;
        $mdSidenav('menu').close();
    }

    function toggleSidenavSearch() {
        vm.isSidenavSearchOpen = !vm.isSidenavSearchOpen;
        if (vm.isSidenavMenuOpen) _closeSidenavMenu();
        $mdSidenav('search').toggle();
    }

    function _closeSidenavSearch() {
        vm.isSidenavSearchOpen = false;
        $mdSidenav('search').close();
    }

    function closeSidenavs() {
        vm.isSidenavMenuOpen = false;
        vm.isSidenavSearchOpen = false;
        $mdSidenav('menu').close();
        $mdSidenav('search').close();
    }

    function canNavigateBack() {
        return (vm.routingPreviousState !== null);
    }

    function navigateBack() {
        if (vm.canNavigateBack()) {
            $state.go(vm.routingPreviousState, vm.routingPreviousStateParams);
        }
    }

    function changeCompany(companyId) {
        if (!session.user) { return; }

        vm.isLoadingSelectedCompany = true;

        session.user.setUserData({
            companyId: companyId
        }).then(function () {
            vm.selectedCompany = session.getSelectedCompany();
            $rootScope.$broadcast('companyChanged', vm.selectedCompany);
            $state.go('mycockpit');
            _loadCompanyLogo();
        }).catch(function (exception) {
            $translate('error.ERROR').then(function (data) {
                logger.error(data, exception, true);
            });
        });
    }

    function changeSearchMenu(searchState) {
        vm.searchMenuState = searchState;

        /*
        switch (searchState) {
            case 'criteria':
                vm.sidebarSearchCurrentTutorialChapter = tutorialService.CHAPTER_NAME_SIDEBAR_SEARCH_CRITERIA;
                break;

            case 'id':
                vm.sidebarSearchCurrentTutorialChapter = tutorialService.CHAPTER_NAME_SIDEBAR_SEARCH_PATIENT_ID;
                break;

            case 'location':
                vm.sidebarSearchCurrentTutorialChapter = tutorialService.CHAPTER_NAME_SIDEBAR_SEARCH_LOCATION;
                break;

            default:
                vm.sidebarSearchCurrentTutorialChapter = tutorialService.CHAPTER_NAME_SIDEBAR_SEARCH;
                break;
        }*/
    }

    function closeModal() {
        $('#forCompanyChange').closeModal();
    }

    function gotToLink(link) {
        tabOpener.openInNewTab(link);
    }

    function openModal() {
        $('#forCompanyChange').openModal();
    }

    /*
    function showTutorialSidebarMenu(event) {
        event.stopPropagation();
        $scope.$applyAsync(function () { tutorialService.show(tutorialService.CHAPTER_NAME_SIDEBAR_MENU); });
    }

    function showTutorialSidebarSearch(event) {
        event.stopPropagation();
        $scope.$applyAsync(function () { tutorialService.show(tutorialService.CHAPTER_NAME_SIDEBAR_SEARCH); });
    }
    */

    function collapseExtendedComponents() {
        var dashboard = fluanceDashboard.get('cockpit');
        dashboard.disableExtended();
    }

    function getTutorialClassName(state) {
        return 'tutorial-' + state.name.replace('.', '-');
    }

    function changeSelectedCompany() {
        function onComplete() {
            $anchorScroll('company-' + vm.selectedCompany.id);
        }
        $mdDialog
            .show({
                controller: 'CompanySelectionController',
                controllerAs: 'vm',
                templateUrl: templateCompanySelection,
                clickOutsideToClose: true,
                locals: {
                    selectedCompany: vm.selectedCompany
                },
                bindToController: true,
                fullscreen: $mdMedia('xs'),
                onComplete: onComplete
            })
            .then(function (selectedCompany) {
                // Validate
                if (!session.user) { return; }

                var selectedCompanyId = (selectedCompany) ? selectedCompany.id : undefined;
                var currentCompanyId = (session.getSelectedCompany()) ? session.getSelectedCompany().id : undefined;
                if (currentCompanyId === selectedCompanyId) { return; }

                vm.isLoadingSelectedCompany = true;

                // Update selected company
                session.user.setUserData({
                    companyId: (selectedCompany) ? selectedCompany.id : undefined
                }).then(function () {
                    vm.selectedCompany = session.getSelectedCompany();
                    _loadCompanyLogo();
                }).catch(function (exception) {
                    var message = $filter('translate')('error.ERROR');
                    logger.error(message, exception, true);
                }).finally(function () {
                    // Navigate to dashboard
                    $state.go('mycockpit');
                });
            })
            .catch(function () {
                // cancel
            })
    }

    // ------------------------------------------------------------------------------- Tutorial

    /*
    function configureTutorialSidebarMenu() {
        tutorialService.setSteps(tutorialService.CHAPTER_NAME_SIDEBAR_MENU, 0, [{
            element: '.tutorial-mycockpit',
            introKey: 'layout.GUIDE_MENU_COCKPIT',
            position: 'right',
            isValid: function () {
                return session.isAuthenticated();
            }
        }, {
            element: '.tutorial-admin-users',
            introKey: 'layout.GUIDE_MENU_ADMIN',
            position: 'right',
            isValid: function () {
                return session.isAuthenticated() && session.user && session.user.hasRole(['sysadmin']);
            }
        }, {
            element: '.tutorial-settings',
            introKey: 'layout.GUIDE_MENU_USER',
            position: 'right',
            isValid: function () {
                return session.isAuthenticated();
            }
        }, {
            element: '.tutorial-language',
            introKey: 'layout.GUIDE_MENU_LANGUAGE',
            position: 'right'
        }, {
            element: '.tutorial-feedback',
            introKey: 'layout.FEEDBACK_CONTACT_US',
            position: 'top'
        }]);
    }
    */

    /*
    function configureTutorialSidebarSearch() {
        tutorialService.setSteps(tutorialService.CHAPTER_NAME_SIDEBAR_SEARCH, 0, [{
            element: '#btn-sidebar-criteria',
            introKey: 'layout.GUIDE_SEARCH_BY_CRITERIA',
            position: 'left'
        }, {
            element: '#btn-sidebar-ids',
            introKey: 'layout.GUIDE_SEARCH_BY_IDS',
            position: 'left'
        }, {
            element: '#btn-sidebar-location',
            introKey: 'layout.GUIDE_SEARCH_BY_LOCATION',
            position: 'left'
        }]);
    }
    */

    // ------------------------------------------------------------------------------- Helper functions

    function _imageExists(url, callback) {
        var img = new Image();
        img.onload = function () { callback(true); };
        img.onerror = function () { callback(false); };
        img.src = url;
    }

    function _loadCompanyLogo() {
        if (config.company && config.company.logoUrlBase && vm.selectedCompany) {
            let logoUrl = config.company.logoUrlBase + vm.selectedCompany.logoFilename;
            _imageExists(logoUrl, function(exists) {
                vm.isCompanyLogoAvailable = exists;
                vm.selectedCompanyLogoUrl = logoUrl;
                vm.isLoadingSelectedCompany = false;
            });
        } else {
            vm.isCompanyLogoAvailable = false;
            vm.isLoadingSelectedCompany = false;
        }
    }
}

export default ShellController;
