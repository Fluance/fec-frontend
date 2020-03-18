import _ from 'lodash';

import template from './fecPatientNavigationButtonPrescription.component.html';

const PatientNavigationButtonPrescription = {
    bindings: {
        isEnabled: '<?',
    },
    controller: [
        '$q',
        '$rootScope',
        '$state',
        '$translate',
        '$window',
        'config',
        'dataservice.visits',
        'routerService',
        'SelectVisitDialogService',
        'DocumentService',
        'sessionService',
        'LabService',
        controller
    ],
    templateUrl: template
};

function controller(
    $q,
    $rootScope,
    $state,
    $translate,
    $window,
    config,
    dataServiceVisits,
    routerService,
    selectVisitDialogService,
    documentService,
    session,
    labService
) {
    var ctrl = this;
    var pid;

    ctrl.canNavigate = canNavigate;
    ctrl.createLabPrescription = createLabPrescription;
    ctrl.generateDocument = generateDocument;
    // ctrl.navigateTo = navigateTo;

    // Events
    ctrl.$onInit = _onInit;
    ctrl.openVisitsCount = 0;
    ctrl.visits = null;
    ctrl.dlg = null;
    ctrl.isActive = true;
    ctrl.directPrescriptionURL = null;

    function _onInit() {
        if (!_.isBoolean(ctrl.isEnabled)) { ctrl.isEnabled = true; }

        ctrl.requiredContext = 'patientId';  // navigationContext.PATIENT_ID

        // add feature flag to disable button
        ctrl.isGenerateDocumentEnabled = config.patientDocuments && config.patientDocuments.generateDocumentEnabled;

        //Disable the menu entry for some roles
        if(!_.isNil(config.accessControl.navigationComponents.fecPatientNavigationButtonPrescription) &&
                !_.isNil(config.accessControl.navigationComponents.fecPatientNavigationButtonPrescription.disabledForRoles)){
            if(session.user.hasRole(config.accessControl.navigationComponents.fecPatientNavigationButtonPrescription.disabledForRoles)){
                ctrl.isEnabled = false;
            }
        }
    }

    function canNavigate(context) {
        if (context.patientId) {
            pid = context.patientId;
            return $q.all([
                _canGenerateDocument(context.patientId),
                _hasOpenVisits(context)
            ])
            .then(function (result) {
                return result[0] || result[1];
            });
        }
        else {
            return $q.resolve(false);
        }
    }

    function createLabPrescription($event) {
        ctrl.visits.forEach(function(entry, index){
            var visitNumber = entry.visit.visitInfo.number;

            selectVisitDialogService.labUrlForVisit(visitNumber)
            .then(function(labURL){
                ctrl.visits[index].visit.labURL = labURL;
            });
        });
        labService.createPrescription(ctrl.openVisitsCount, ctrl.vnb, ctrl.visits, $event);
    }

    function generateDocument($event) {
        documentService.generateDocument($event, pid);
    }

    function _canGenerateDocument(pid) {
        ctrl.isGenerateDocumentActive = false;

        // get companies
        return documentService.getCompanies()
            .then(function (companies) {
                if (companies && companies.length && companies.length > 0) {
                    //Test if there are visits for one of the companies that can generate documents
                    var requests = [];

                    _.forEach(companies, function (company) {
                        requests.push(documentService.getVisits(pid, company.companyId));
                    });

                    $q.all(requests).then(function (results) {
                        var hasVisitForCompanyWithDocument = false;

                        _.forEach(results, function (result) {
                            if (result.totalRecords > 0) {
                                hasVisitForCompanyWithDocument = true;
                            }
                        });

                        //enable menu entry
                        ctrl.isGenerateDocumentActive = hasVisitForCompanyWithDocument;
                        return hasVisitForCompanyWithDocument;
                    });
                } else {
                    return false;
                }
            });
    }

     function _hasOpenVisits(context) {
         return dataServiceVisits.getPatientVisits({ pid: context.patientId })
         .then(function (result) {
               ctrl.openVisitsCount = result.totalRecords;
               ctrl.visits = result.visits;

               ctrl.isCreatePrescriptionActive = !!ctrl.openVisitsCount;

               if (ctrl.openVisitsCount === 1) {
                    ctrl.vnb = ctrl.visits[0].visit.visitInfo.number;
                    selectVisitDialogService.labUrlForVisit(ctrl.vnb)
                    .then(function(url) {
                         ctrl.directPrescriptionURL = url;
                         return true;
                    });
               } else {
                    ctrl.directPrescriptionURL = null;
                    return !!ctrl.openVisitsCount;
               }
           })
     }
}

export default PatientNavigationButtonPrescription;
