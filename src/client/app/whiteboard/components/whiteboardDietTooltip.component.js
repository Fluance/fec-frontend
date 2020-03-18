import _ from 'lodash';
import template from './whiteboardDietTooltip.component.html';

const WhiteboardDietTooltip = {
    bindings: {
        companyId: '<',
        hospService: '<',
        diet: '<',
        dietsCatalog: '<',
        lang: '<'
    },
    controller: controller,
    controllerAs: '$ctrl',
    templateUrl: template
};

function controller() {
    var ctrl = this;

    ctrl.dietValues = [];

    ctrl.$onInit = onInit;
    ctrl.$onChanges = onChanges;

    ctrl.isEmpty = isEmpty;

    function onInit() {
        _processDiet();
    }

    function onChanges(values) {
        if ((!_.isUndefined(values.diet) && (values.diet.previousValue !== values.diet.current && !_.isUndefined(values.diet.currentValue))) ||
            (!_.isUndefined(values.lang) && (values.lang.previousValue !== values.lang.current && !_.isUndefined(values.lang.currentValue)))
        ) {
            _processDiet();
        }
    }

    function isEmpty() {
        return _.isUndefined(ctrl.diet) || ctrl.diet === null || ctrl.diet.length === 0 ||
            _.isUndefined(ctrl.dietValues) || ctrl.dietValues === null || ctrl.dietValues.length === 0;
    }

    // ---------------------------------------------- Private methods
    function _processDiet() {
        var newDietValues = [];

        if (ctrl.diet) {
            _.forEach(ctrl.diet, function (dietCode) {
                var dietCatalog = _.find(ctrl.dietsCatalog, function (dietCatalog) {
                    if (dietCatalog.code === dietCode && dietCatalog.lang === ctrl.lang) return dietCatalog;
                });

                if (!_.isUndefined(dietCatalog)) {
                    newDietValues.push(dietCatalog);
                }
            });
        }

        ctrl.dietValues = newDietValues;
    }
}


export default WhiteboardDietTooltip;
