import angular from 'angular';
import template from './fluanceServiceFee.component.html';

const fluanceServiceFee = {
    templateUrl: template,
    controller: controller,
    bindings: {
        result: '='
    }
};

controller.$inject = [
    '$scope',
    '$translate',
    'dataservice.servicefees',
    'logger',
    'sessionService'
    ];

function controller($scope, $translate, dataserviceBenefits, logger, session) {
    /*jshint validthis: true */
    var vm = this;
    vm.displayDetails = displayDetails;

    function displayDetails() {

        onStateChanged();

        // Load details when expanded
        if (vm.result.isExpanded) {
            vm.result.isLoadingDetails = true;
            getBenefit()
                .catch(function (exception) {
                    $translate('error.ERROR').then(function (translation) {
                        logger.error(translation, exception);
                    });
                })
                .finally(function () {
                    vm.result.isLoadingDetails = false;
                });
        }
    }

    function getBenefit() {
        var params = {
            id: vm.result.benefit.benefitId,
            lang: session.getUILanguage(),
        };

        return dataserviceBenefits
            .getServiceFeeDetails(vm.result.benefit.benefitId, params.lang)
            .then(function (benefit) {
                vm.result.details = benefit;
            });
    }

    function onStateChanged() {
        $scope.$emit('benefit.stateChanged', {
            isExpanded: vm.result.isExpanded,
            hasDetails: angular.isObject(vm.result.details)
        });
    }
}

export default fluanceServiceFee;


