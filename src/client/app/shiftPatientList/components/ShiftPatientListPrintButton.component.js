import template from './ShiftPatientListPrintButton.component.html';

const ShiftPatientListPrintButton = {
    bindings: {
        companyId: '=',
        unit: '='
    },
    controller: controller,
    controllerAs: 'vm',
    templateUrl: template
};

controller.$inject = ['$window', '$filter', 'logger', 'dataservice.shiftPatients', 'moment'];

function controller($window, $filter, logger, dataserviceShiftPatients, moment) {
    var vm = this;
    var pdfUrl;
    vm.test = true;

    vm.printPdf = printPdf;
    vm.openInNewTab = openInNewTab;
    vm.downloadPdf = downloadPdf;

    // ----------------------------------------------------------------------------- Interface methods

    function printPdf() {
        var dlg, isChrome, filename, currentDate;

        currentDate = $filter('formatDate')(moment(), 'date');
        filename = 'PatientList-' + currentDate + '.pdf';
        vm.isIE10plus = $window.navigator && $window.navigator.msSaveOrOpenBlob;
        isChrome = !!window.chrome && !!window.chrome.webstore;

        dataserviceShiftPatients.getReport(vm.companyId, vm.unit)
            .then(function(result) {
                var pdfFile = new Blob([result.data], {
                    type: 'application/pdf'
                });
                // use createObjectURL
                pdfUrl = URL.createObjectURL(pdfFile);

                // IE10+: window open access denied
                if (vm.isIE10plus) {
                    $window.navigator.msSaveOrOpenBlob(pdfFile, filename);
                } else {
                    vm.test = false;
                }
            })
            .then(function() {
                var openPdfButton = document.getElementById('fecOpenNewTab');
                openPdfButton.href = pdfUrl;
                openPdfButton.target = '_blank';
            })
            .catch(function(exception) {
                console.log(exception);
                logger.error("Error printing Patient List");
            });
    }

    function openInNewTab() {
        vm.test = true;
    }

    function downloadPdf() {
        var filename = 'PatientList-' + $filter('formatDate')(moment(), 'date') + '.pdf';
        var link = document.createElement('a');
        link.href = pdfUrl;
        link.download = filename;
        link.click();
        vm.test = true;
    }
}


export default ShiftPatientListPrintButton;
