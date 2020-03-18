import _ from 'lodash';
import template from './whiteboardButton.component.html';

const WhiteboardButton = {
    bindings: {
        companyId: '<?',
        hospService: '<?'
    },
    controller: controller,
    templateUrl: template
};

/*jshint maxparams: 20 */
controller.$inject = [
    '$element',
    '$location',
    'whiteboardService'
];

function controller($element, $location, whiteboardService) {
    var ctrl = this;

    ctrl.isDisabled = false;
    ctrl.isActive = true;
    ctrl.isWhiteboardAvailable = false;

    // Events
    ctrl.$onInit = onInit;
    ctrl.$onChanges = onChanges;

    // API

    // ------------------------------------------------------- Event methods

    function onInit() {
        // check if feature is enabled
        if(!whiteboardService.isActive()) {
            $element.remove();
            return;
        }

        // 1. params values not found in component params
        if(!ctrl.companyId || !ctrl.hospService) {
            // 2.look in query parameters
            var queryParams = $location.search();
            var companyId = queryParams['companyid'];
            var hospService = queryParams['hospservice'];

            if(companyId && hospService) {
                ctrl.companyId = companyId;
                ctrl.hospService = hospService;
            }
            // 3. ask service
            else {
                // get state from whiteboard service
                var state = whiteboardService.getWhiteboardState();
                if(state && state.companyId && state.hospService) {
                    ctrl.companyId = state.companyId;
                    ctrl.hospService = state.hospService;
                }
                // cannot find params: hide button
                else {
                    ctrl.isWhiteboardAvailable = false;
                    return;
                }
            }
        }

        // check availability
        _checkIsWhiteboardAvailable();
    }

    function onChanges(changesObj) {
        // check if feature is enabled
        if(!whiteboardService.isActive()) {
            $element.remove();
            return;
        }

        if (!_.isUndefined(changesObj)) {
            // $onChanges runs before $onInit. Skip first run.
            if (!_.isUndefined(changesObj.isDisabled) && changesObj.isDisabled.isFirstChange()) { return; }

            // verify there is data available
            if (changesObj.companyId || changesObj.hospService) {
                _checkIsWhiteboardAvailable();
            }
        }
    }

    // ------------------------------------------------------- API methods

    // check if the whiteboard is available (for a company and service)
    function _checkIsWhiteboardAvailable() {
        ctrl.isWhiteboardAvailable = false;

        // Defensive checking to prevent bad calls to whiteboard API
        if (ctrl.companyId === undefined) return;
        if (ctrl.hospService === undefined) return;

        whiteboardService.isWhiteboardAvailable({
            companyId: ctrl.companyId,
            hospService: ctrl.hospService
        })
            .then(function(result) {
                ctrl.isWhiteboardAvailable = result;
            });
    }
}

export default WhiteboardButton;
