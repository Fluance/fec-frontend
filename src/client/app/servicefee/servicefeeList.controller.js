// jscs:disable requireParenthesesAroundIIFE

ServiceFeeListController.$inject = [
    '$stateParams'
];

function ServiceFeeListController($stateParams) {
    /*jshint validthis: true */
    var vm = this;
    vm.vnb = $stateParams.vnb;
}
export default ServiceFeeListController;
