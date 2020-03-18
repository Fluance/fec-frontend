roomListController.$inject = [
    '$rootScope',
    '$scope',
    'sessionService'
];

function roomListController($rootScope, $scope, session) {
    let unsubscribeCompanyChange;
    let unsubscribeUserDataChange;
    let unsubscribeUserProfileChange;

    var vm = this;

    vm.$onInit = onInit;
    vm.$onDestroy = onDestroy;

    return vm;

    function onInit() {
        unsubscribeCompanyChange = $rootScope.$on(session.EVENT_SELECTED_COMPANY_CHANGED, function () {
            $scope.$parent.scope.onSelectedCompanyChanged();
        });

        unsubscribeUserDataChange = $rootScope.$on(session.EVENT_USER_DATA_CHANGED, function () {
            $scope.$parent.scope.onUserDataChanged();
        });

        unsubscribeUserProfileChange = $rootScope.$on(session.EVENT_USER_PROFILE_CHANGED, function () {
            $scope.$parent.scope.onUserProfileChanged();
        });
    }

    function onDestroy() {
        if(unsubscribeCompanyChange) {unsubscribeCompanyChange();}
        if(unsubscribeUserDataChange) {unsubscribeUserDataChange();}
        if(unsubscribeUserProfileChange) {unsubscribeUserProfileChange();}
    }
}

export default roomListController;
