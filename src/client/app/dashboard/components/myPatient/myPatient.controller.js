myPatientController.$inject = [
    '$rootScope',
    '$scope',
    'sessionService'
];

function myPatientController($rootScope, $scope, session) {
    var unsuvscribeCompanyChange;

    var vm = this;

    vm.$onInit = onInit;
    vm.$onDestroy = onDestroy;

    return vm;

    function onInit() {
        unsuvscribeCompanyChange = $rootScope.$on(session.EVENT_SELECTED_COMPANY_CHANGED, function () {
            $scope.$parent.scope.onCompanyChange();
        });
    }

    function onDestroy() {
        if(unsuvscribeCompanyChange) {unsuvscribeCompanyChange();}
    }
}

export default myPatientController;
