import template from './fecPatientNavigationButtonDocument.component.html';

const PatientNavigationButtonDocument = {
    templateUrl: template,
    controller: ['$q', '$state', 'DocumentService', controller]
};

function controller($q, $state, documentService) {
    var ctrl = this;

    // State
    ctrl.isActive = true;

    // Events
    ctrl.$onInit = onInit;

    // Methods
    ctrl.canNavigate = canNavigate;
    ctrl.navigateTo = navigateTo;

    // ------------------------------------------------------------------------- Event handling

    function onInit() {
        // Remove tag, if Patient Document components are not activated
        if(!documentService.isActive()) {
            ctrl.isActive = false;
        }
        else {
            if (!_.isBoolean(ctrl.isEnabled)) { ctrl.isEnabled = true; }
            ctrl.requiredContext = 'patientId';
        }
    }

    // ------------------------------------------------------------------------- Public methods

    function canNavigate(context) {
        if (context.patientId) {
            return documentService.hasDocumentData(context.patientId);
        } else {
            return $q.resolve(false);
        }
    }

    function navigateTo(context) {
        $state.go('patientDocuments', {'pid': context['patientId']});
    }
}

export default PatientNavigationButtonDocument;
