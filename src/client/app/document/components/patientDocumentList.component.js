import temlate from './patientDocumentList.component.html';

const PatientDocumentList = {
    bindings: {
        pid: '<',
        item: '<',
        resetResults: '<'
    },
    controller: ['DocumentService', controller],
    templateUrl: temlate
};

function controller(documentService) {
    var ctrl = this;

    // Events
    ctrl.$onInit = onInit;

    // Methods
    ctrl.getCompanyList = getCompanyList;
    ctrl.getDataList = getDataList;
    ctrl.getDataListCount = getDataListCount;

    // ------------------------------------------------------------------------- Event handling

    function onInit() {
        ctrl.columns = [
            {text: 'core.COMPANY', name: 'companyId', flex: 20},
            {text: 'core.DATE', name: 'creationDate', flex: 20},
            {text: 'document.HEADER_FILENAME', name: 'fileName', flex: 50}
        ];

        ctrl.options = {
            columns: ctrl.columns,
            filter: {
                idName: 'companyId',
                textName: 'name',
                translate: false
            },
            rowComponent: 'fec-patient-document-item',
            footerLabelCode: 'document.TITLE_LIST'
        };
    }

    // ------------------------------------------------------------------------- Public methods

    function getCompanyList() {
        return documentService.getCompaniesByPatient(ctrl.pid);
    }

    function getDataList(params) {
        return documentService.getDocuments(params);
    }

    function getDataListCount(params) {
        return documentService.getDocumentsCount(params);
    }
}

export default PatientDocumentList;
