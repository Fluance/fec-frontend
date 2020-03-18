import template from './patientNavigationButton.component.html';

const PatientNavigationButton = {
    bindings: {
        buttonLabel: '@',
        isEnabled: '<?',
        isActive: '<?',
        canNavigate: '&',
        navigateTo: '&',
        requiredContext: '<',
        iconType: '@',
        askAlways: '<?',
        requiredOriginState: '@',
        preventNavigation: '&?'
    },
    transclude: {
        'navigationComponent': '?navigationComponent'
    },
    controller: ['$q', '$rootScope', 'fecNavigationContextService', controller],
    templateUrl: template
};

function controller($q, $rootScope, navigationContextService) {
    var ctrl = this;
    var refreshEvent;

    // state
    ctrl.isBusy = false;
    ctrl.canNavigateResult = false;
    ctrl.context = [];

    // methods
    ctrl.$onInit = _onInit;
    ctrl.$onChanges = _onChanges;
    ctrl.$onDestroy = _onDestroy;
    ctrl.onNavigateTo = onNavigateTo;


    // ------------------------------------------------------ Public functions

    function _onInit() {
        /*
        // Remove tag, if <?> components are not activated
        if (!ctrl.isActive()) {
            ctrl.isActive = false;
        } else {
            if (!_.isBoolean(ctrl.isEnabled)) { ctrl.isEnabled = true; }
            canNavigate();
        }
        */
        if (!_.isBoolean(ctrl.isEnabled)) { ctrl.isEnabled = true; }
        if (!_.isBoolean(ctrl.isActive)) { ctrl.isActive = true; }

        // get current navigation context
        ctrl.context = navigationContextService.getContext();


        // verify if button can navigate
        canNavigate();

        // subscribe to navigation context change event
        refreshEvent = $rootScope.$on('fecNavigationContextChanged', _navigationContextChangedEvent);
    }


    function _onChanges(changesObj) {
        // $onChanges runs before $onInit. Skip first run.
        if (changesObj.isEnabled && changesObj.isEnabled.isFirstChange()) { return; }

        if (changesObj.isEnabled) {
            canNavigate();
        }
    }

    function _onDestroy() {
        refreshEvent();
    }

    // ------------------------------------------------------------------------- Public methods

    function canNavigate() {
        // is button enabled ?
        if (!ctrl.isEnabled) { return; }

        var fnCanNavigate = (_.isFunction(ctrl.canNavigate)) ? ctrl.canNavigate({context: ctrl.context}) : true;

        ctrl.isBusy = true;
        $q.resolve(fnCanNavigate)
            .then(function (result) {
                ctrl.canNavigateResult = result;
            })
            .catch(function (exception) {
                if (_.isEqual(403, exception.status)) {
                    ctrl.canNavigateResult = false;
                }
            })
            .finally(function () {
                ctrl.isBusy = false;
            });
    }

    function onNavigateTo() {
        if (ctrl.canNavigateResult) {
            //prevent that the execution continues because performance reasons, this function is optional
            if ((_.isFunction(ctrl.preventNavigation)) ? ctrl.preventNavigation() : false) {
                return;
            }

            // context
            var contextItemName = ctrl.requiredContext; // eg 'patientId
            if (contextItemName) {
                ctrl.isLoading = true;
                navigationContextService.getContextItem(contextItemName, ctrl.askAlways).then(function (contextItemId) {
                    ctrl.isLoading = false;
                    if (!_.isUndefined(contextItemId) && !_.isNull(contextItemId)) {
                        ctrl.contextItemId = contextItemId;
                        // navigateTo ...
                        var context = navigationContextService.getContext();
                        ctrl.navigateTo({context: context});
                    }
                });
            } else {
                ctrl.navigateTo();
            }
        }
    }

    // ------------------------------------------------------ Private functions

    function _navigationContextChangedEvent(event, params) {
        _refreshComponentData(params.key, params.value);
    }

    function _refreshComponentData(key, value) {
        if ((_.isString(ctrl.requiredContext) && ctrl.requiredContext === key) || (_.isArray(ctrl.requiredContext) && _.includes(ctrl.requiredContext, key))) {
            ctrl.context[key] = value;
            canNavigate();
        }
    }
}

export default PatientNavigationButton;
