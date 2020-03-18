import template from './imagingOrder.component.html';

const ImagingOrder = {
    bindings: {
        result: '<',
        itemIndex: '<',
        item: '<',
        reportDelegate: '<'
    },
    controller: controller,
    controllerAs: 'vm',
    templateUrl: template
};

controller.$inject = [
    '$scope'
];

function controller($scope) {
    var vm = this;

    // events
    vm.$onInit = onInit;
    // Interface
    vm.displayDetails = displayDetails;
    vm.showReport = showReport;
    vm.showImageSetURL = showImageSetURL;

    //vm.onButtonClicked = onButtonClicked;

    // --------------------------------------- Events

    function onInit() {
        vm.delegate = vm.reportDelegate;
    }

    // -------------------------------------- Interface

    function displayDetails() {
        // Notify imagingOrder state changed
        onStateChanged();
    }

    function showReport() {
        var delegate = vm.reportDelegate;
        // If no delegate set, return...
        if (!_.isObject(delegate)) return;

        // ... else ask the delegate to display Report Dialog
        delegate.showReportDialog(vm.item, vm.itemIndex);
    }

    function showImageSetURL() {
        var delegate = vm.reportDelegate;
        if (!_.isObject(delegate)) return;

        return delegate.showImageSetURL(vm.item.imagingOrder);
    }

    function closeDialog() {

    }

    function onButtonClicked(type) {
        //var onClickedHandler = vm.onClicked();
        if (_.isFunction(onClickedHandler)) {
            vm.delegate.onImagingOrderClicked({
                type: type,
                imagingOrder: vm.result.imagingOrder,
                itemIndex: vm.itemIndex
            });
        }
    }

    function onStateChanged() {
        $scope.$emit('imagingOrder.stateChanged', {
            orderNumber: vm.item.imagingOrder.orderNumber,
            isExpanded: vm.item.isExpanded,
            hasDetails: true
        });
    }
}

export default ImagingOrder;
