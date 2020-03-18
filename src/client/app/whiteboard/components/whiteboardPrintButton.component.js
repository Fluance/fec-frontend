import template from './whiteboardPrintButton.component.html';

const WhiteboardPrintButton = {
    bindings: {
        companyId: '<',
        service: '<',
        printingDisabled: '<',
        date: '<',
        occupancy: '<'
    },
    controller: controller,
    controllerAs: 'vm',
    templateUrl: template
};

controller.$inject = [
    '$rootScope',
    'dataservice.whiteboard',
    'whiteboardService',
    'PdfViewerDialog',
    'sessionService'
];

function controller(
    $rootScope,
    dataserviceWhiteboard,
    whiteboardService,
    pdfViewerDialog,
    session
) {

    var vm = this;

    vm.viewPdf = viewPdf;
    // ----------------------------------------------------------------------------- Interface methods

    function viewPdf($event) {

        $rootScope.$broadcast(whiteboardService.EVENT_LEAVE_NURSE_EDIT_MODE, {});

        var params = {
            companyId: vm.companyId,
            hospService: vm.service,
            language: session.getUILanguage(),
            date: vm.date,
            occupancy: vm.occupancy

        };

        pdfViewerDialog.show(dataserviceWhiteboard.getWhiteboardPdf, params, $event);
    }
}


export default WhiteboardPrintButton;
