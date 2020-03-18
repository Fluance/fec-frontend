import template from './patientDocumentItem.component.html';

const PatientDocumentItem = {
    bindings: {
        item: '<'
    },
    templateUrl: template,
    controller: ['PdfViewerDialog', 'DocumentService', controller]
};

function controller(pdfViewerDialog, documentService) {
    var ctrl = this;

    // Methods
    ctrl.showDocument = showDocument;

    // ------------------------------------------------------------------------- Public methods

    function showDocument(document, $event) {
        var params = {pid: document.pid, documentId: document.id};
        pdfViewerDialog.show(documentService.getDocumentPdf, params, $event);
    }
}

export default PatientDocumentItem;
