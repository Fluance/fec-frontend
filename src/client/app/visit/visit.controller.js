// jscs:disable requireParenthesesAroundIIFE

VisitController.$inject = [
    '$stateParams'
];

/* @ngInject */
function VisitController($stateParams) {

    /*jshint validthis: true */
    var vm = this;
    vm.title = 'VisitController';
    vm.vnb = $stateParams.vnb;

    //Check if user has access to physician list
    vm.hasAccess = true;

    // Populate our scope (as vm)
    $.extend(vm, {
        singleResultSearch: false, // Is single result page
        isComplete: false,
        isEmpty: false,
        isException: false,
        result: {},
        isLoading: true
    });

    activate();

    // -----------------------------------------------------------------

    function activate() {
    }
}

export default VisitController;
