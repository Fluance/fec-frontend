import template from './pdfViewer.component.html';

const pdfViewer = {
    bindings: {
        pdfData: '<',
        pdfFilename: '<'
    },
    templateUrl: template,
    controller: ['$location', controller]
};

function controller($location) {
    var ctrl = this;
    var PDF_VIEWER_PAGE_PATH = 'viewers/pdf-viewer.html';

    // Events
    ctrl.$onInit = onInit;

    // ------------------------------------------------------------------------- Event handle

    function onInit() {
        // initialization for PDF JS viewer
        _initializeForJSViewer();
    }

    // ------------------------------------------------------------------------- Helper methods

    function _initializeForJSViewer() {
        var url = $location.absUrl(); // keep same-origin in the iframe

        // set url to local (same origin) pdf JS viewer
        ctrl.pdfViewerUrl = url.slice(0, url.indexOf('#')) + PDF_VIEWER_PAGE_PATH;

        // set (fec) global data for PDF viewer in iframe
        window.fec = {
            pdfViewer: {
                pdfData: ctrl.pdfData,
                pdfFilename: ctrl.pdfFilename
            }
        };
    }
}


export default pdfViewer;
