import angular from 'angular';
import _ from 'lodash';
import template from './components/selectTemplateInfo.tmpl.html';

DocumentService.$inject = ['$mdDialog', 'dataservice.documents', 'dataservice.visits'];

function DocumentService($mdDialog, documentsDataService, visitsDataService) {
    var _config,
        _isActive;

    var service = {
        init: init,
        isActive: isActive,
        generateDocument: generateDocument,
        getCompanies: getCompanies,
        getCompaniesByPatient: getCompaniesByPatient,
        getDocuments: getDocuments,
        getDocumentsCount: getDocumentsCount,
        getTemplates: getTemplates,
        getVisits: getVisits,
        getDocumentPdf: getDocumentPdf,
        getDocumentUrl: getDocumentUrl,
        getDocumentPdfFromTemplate: getDocumentPdfFromTemplate,
        hasDocumentData: hasDocumentData
    };

    return service;

    // -------------------------------------------------------- Interface methods

    // retrieve Documents button enabled/disabled status from config
    function init(config) {
        if (!_.isObject(config)) { return; }

        _config = config;
        service.isActive(config.active);
    }

    // Accessor Mutator
    function isActive(value) {
        if (_.isUndefined(value)) {
            return _isActive;
        }
        else {
            var oldValue = _isActive;
            _isActive = value;
            return oldValue;
        }
    }

    function generateDocument($event, pid) {
        $mdDialog.show({
            parent: angular.element(document.body),
            targetEvent: $event,
            templateUrl: template,
            controller: ['DocumentService', 'PdfViewerDialog', 'sessionService', DialogController],
            controllerAs: '$ctrl',
            clickOutsideToClose: true,
            escapeToClose: true
        });

        function DialogController(documentService, pdfViewerDialog, session) {
            var dialogCtrl = this;

            dialogCtrl.closeDialog = closeDialog;
            dialogCtrl.showDocument = showDocument;

            dialogCtrl.$onInit = init;

            // ----------------------------------------------

            function init() {

                //Get selected company
                dialogCtrl.company = session.getSelectedCompany();

                // get templates
                documentService.getTemplates(dialogCtrl.company.id)
                    .then(function(templates) {
                        dialogCtrl.templates = templates;
                    });
                // get visits
                documentService.getVisits(pid, dialogCtrl.company.id)
                    .then(function(visits) {
                        dialogCtrl.visits =  visits.visits;

                        // only 1 visit, automatically select it
                        if(!_.isEmpty(visits.visits) && visits.visits.length === 1) {
                            dialogCtrl.visitNb = visits.visits[0].visit.visitInfo.number;
                        }
                    });
            }

            function closeDialog() {
                $mdDialog.cancel();
            }

            function showDocument($event) {
                var params;

                $mdDialog.cancel();

                params = {
                    pid: pid,
                    visitNb: dialogCtrl.visitNb,
                    templateId: dialogCtrl.templateId,
                    companyId: dialogCtrl.company.id
                };
                pdfViewerDialog.show(documentService.getDocumentPdfFromTemplate, params, $event);
            }
        }
    }

    function getCompanies() {
        return documentsDataService.getCompanies();
    }

    function getCompaniesByPatient(pid) {
        return documentsDataService.getCompanies(pid);
    }

    function getDocuments(params) {
        return documentsDataService.getDocuments(params);
    }

    function getDocumentsCount(params) {
        return documentsDataService.getDocumentsCount(params);
    }

    function getTemplates(companyid) {
        return documentsDataService.getDocumentTemplates(companyid);
    }

    function getVisits(pid, companyid) {
        return visitsDataService.getPatientVisits({pid: pid, companyid: companyid});
    }

    function getDocumentPdf(params) {
        return documentsDataService.getDocumentFile(params.pid, params.documentId);
    }

    function getDocumentUrl(pid,documentId) {
        return documentsDataService.getDocumentFileUrl(pid, documentId);
    }

    function getDocumentPdfFromTemplate(params) {
        return documentsDataService.getDocumentFileFromTemplate(params.pid, params.visitNb, params.companyId, params.templateId);
    }

    function hasDocumentData(pid) {
        return documentsDataService.getDocumentsCount({pid: pid})
            .then(function(count) {
                return count > 0;
            })
            .catch(function(error) {
                return false;
            });
    }
}
export default DocumentService;
