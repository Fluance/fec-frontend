(function() {
    'use strict';

    angular
        .module('app.layout')
        .controller('LayoutPatientController', LayoutPatientController);

    LayoutPatientController.$inject = ['$state', 'LayoutPatientContextBox'];

    /* @ngInject */
    function LayoutPatientController($state, ContextBox) {
        var vm = this;
        vm.context = ContextBox;
        vm.canNavigateBack = ContextBox.canNavigateBack;
        vm.canNavigateToVisitList = ContextBox.canNavigateToVisitList;
        vm.canNavigateToGuarantorList = ContextBox.canNavigateToGuarantorList;
        vm.isOwnGuarantor = ($state.params.guarantorid !== '-');

        vm.getBackContext = function() {
            return ContextBox.backContext;
        };

        return vm;
    }
})();
