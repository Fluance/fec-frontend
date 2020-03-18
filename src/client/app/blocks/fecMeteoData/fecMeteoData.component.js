import template from './fecMeteoData.component.html';

const fecMeteoData = {
    bindings: {
        date: '@',
        companyId: '@'
    },
    controller: ['$element', 'meteoDataService', 'meteoDataDialogService', controller],
    controllerAs: 'vm',
    templateUrl: template
};

function controller($element, meteoDataService, meteoDataDialogService) {
    var ctrl = this;

    ctrl.showMeteoDialog = showMeteoDialog;

    // Remove tag, if Meteo Data component is not activated
    if (!meteoDataService.isActive()) {
        $element.remove();
    }
    else {
        ctrl.$onInit = init;
    }

    // ------------------------------------------------------------------------

    function init() {
        loadMeteoData().then(function(response) {
            if (response && response.data) {
                ctrl.data = response.data;
            }
        }, function(reason) {
            console.error(reason);
        });
    }

    function loadMeteoData() {
        console.log(ctrl.companyId);
        return meteoDataService.getMeteoPreview(ctrl.companyId, ctrl.date);
    }

    function showMeteoDialog($event) {
        if (ctrl.data) {
            var parentEl = angular.element(document.body);
            var firstDate = ctrl.date;
            var companyId = ctrl.companyId;
            meteoDataDialogService.showDialog($event, parentEl, firstDate, companyId);
        }
    }

    return ctrl;
}

export default fecMeteoData;
