import template from './fecStateIconButton.component.html';

const fecStateIconButton = {
    bindings: {
        type: '@',
        size: '@',
        color: '@',
        state: '@',
        stateParams: '<',
        tooltip: '@'
    },
    controller: controller,
    templateUrl: template
};


controller.$inject = ['$state'];
function controller($state) {
    var ctrl = this;

    ctrl.getLinkUrl = getLinkUrl;
    ctrl.goToState = goToState;

    // ----------------------------------------------------- Public methods

    /**
     * Build URL link from state and state parameters
     * @returns {*}
     */
    function getLinkUrl() {
        var params = {};
        if(ctrl.stateParams) {
            // pid
            if(ctrl.stateParams.pid) {
                params['pid'] = ctrl.stateParams.pid;
            }
        }
        return $state.href(ctrl.state, params);
    }

    /**
     * Navigate to a state with state parameters
     */
    function goToState() {
        $state.go(ctrl.state, ctrl.stateParams);
    }
}

export default fecStateIconButton;
