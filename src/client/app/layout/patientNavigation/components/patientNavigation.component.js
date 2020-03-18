import template from './patientNavigation.component.html';

const PatientNavigation = {
    controller: [
        '$compile',
        '$element',
        '$filter',
        '$rootScope',
        '$scope',
        '$transitions',
        'fecNavigationContextService',
        'patientNavigationService',
        controller
    ],
    templateUrl: template
};

function controller(
    $compile,
    $element,
    $filter,
    $rootScope,
    $scope,
    $transitions,
    fecNavigationContextService,
    patientNavigationService
) {
    var ctrl = this;

    ctrl.navigationComponents;

    // Events
    ctrl.$onInit = _onInit;

    function _onInit() {
        var originState = patientNavigationService.getOriginState();
        var originParams = patientNavigationService.getOriginParams();
        ctrl.navigationComponents = patientNavigationService.getNavigationComponents();

        var entriesToPreserve = [];
        if (originState) {entriesToPreserve.push(originState);}
        if (originParams) {entriesToPreserve.push(originParams);}
        fecNavigationContextService.preserveContext(entriesToPreserve);

        // Create component and add it to the template
        _.each(ctrl.navigationComponents, function(navigationComponent) {
            if (!navigationComponent.allowedOrigins || (_.indexOf(navigationComponent.allowedOrigins, originState) >= 0)) {
                var kebabizedName = $filter('kebab')(navigationComponent.name);
                var template = '<' + kebabizedName +'></' + kebabizedName + '>';
                var compiled = $compile(template)($scope);
                $element.append(compiled);
            }
        });
    }
}

export default PatientNavigation;
