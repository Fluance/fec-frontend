myAppointmentController.$inject = [
    '$rootScope',
    '$scope',
    'sessionService'
];

function myAppointmentController($rootScope, $scope, session) {
    var unsubscribeCompanyChange;
    var unsubscribeTranslateChange;

    var vm = this;

    vm.$onInit = onInit;
    vm.$onDestroy = onDestroy;

    return vm;

    function onInit() {
        unsubscribeCompanyChange = $rootScope.$on(session.EVENT_SELECTED_COMPANY_CHANGED, function () {
            $scope.$parent.scope.onCompanyChange();
        });

        unsubscribeTranslateChange = $rootScope.$on('translationChanged', function () {
            $scope.$parent.scope.onCompanyChange();
        });
    }

    function onDestroy() {
        if(unsubscribeCompanyChange) {unsubscribeCompanyChange();}
        if(unsubscribeTranslateChange) {unsubscribeTranslateChange();}
    }
}

export default myAppointmentController;
