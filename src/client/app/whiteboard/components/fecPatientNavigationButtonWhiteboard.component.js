import template from './fecPatientNavigationButtonWhiteboard.component.html';

const PatientNavigationButtonWhiteboard = {
    controller: ['$element', '$location', '$state', 'whiteboardService', 'fecNavigationContextService', controller],
    templateUrl: template
};

function controller($element, $location, $state, whiteboardService, fecNavigationContextService) {
    var ctrl = this;

    ctrl.requiredContext = 'companyId';

    //methods
    ctrl.navigateTo = navigateTo;
    ctrl.canNavigate = canNavigate;

    // Events
    ctrl.$onInit = onInit;

    // API

    // ------------------------------------------------------- Event methods

    function onInit() {
        // check if feature is enabled
        if (!whiteboardService.isActive()) {
            $element.remove();
            return;
        }

        // 1.look in query parameters
        var queryParams = $location.search();
        var companyId = queryParams['companyid'];
        var hospService = queryParams['hospservice'];

        if (companyId && hospService) {
            ctrl.companyId = companyId;
            ctrl.hospService = hospService;
        }
        // 2. ask service
        else {
            // get state from whiteboard service
            var state = whiteboardService.getWhiteboardState();
            if (state && state.companyId && state.hospService) {
                ctrl.companyId = state.companyId;
                ctrl.hospService = state.hospService;
            }
            // cannot find params: hide button
            else {
                ctrl.isWhiteboardAvailable = false;
                $element.remove();
                return;
            }
        }

        //set companyId to context
        fecNavigationContextService.setContextItem(ctrl.requiredContext, ctrl.companyId);

        ctrl.isWhiteboardAvailable = false;

        // check availability
        _checkIsWhiteboardAvailable();
    }

    // ------------------------------------------------------- Methods

    function navigateTo() {
        $state.go('whiteboard', {'companyId': ctrl.companyId, 'hospService': ctrl.hospService});
    }

    function canNavigate() {
        return ctrl.isWhiteboardAvailable;
    }

    // ------------------------------------------------------- API methods

    // check if the whiteboard is available (for a company and service)
    function _checkIsWhiteboardAvailable() {
        ctrl.isWhiteboardAvailable = false;
        whiteboardService.isWhiteboardAvailable({
            companyId: ctrl.companyId,
            hospService: ctrl.hospService
        })
            .then(function (result) {
                ctrl.isWhiteboardAvailable = result;
            });
    }
}

export default PatientNavigationButtonWhiteboard;
