// jscs:disable requireParenthesesAroundIIFE

IcdChopController.$inject = [
    '$stateParams'
];

function IcdChopController($stateParams) {
    var vm = this;
    vm.vnb = $stateParams.vnb;
}

export default IcdChopController;
