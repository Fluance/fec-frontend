import template from './fecIconButton.component.html';

/**
 * @ngdoc component
 * @scope
 * @module app
 * @name fecIconButton
 *
 * @param {String} type icon as String
 * @param {String} size  as String
 * @param {String} color as String
 * @param {Object} action callback
 *
 *
 * @description
 *
 * A Directive that display icons that executes the callback when it's clicked and have ripple effect
 *
 * <fec-icon-button type="patient" size="xs, small" color="red, blue..." action="onClickAction()"></fec-icon-button>
 **/

const fecIconButton = {
    bindings: {
        type: '@',
        size: '@',
        color: '@',
        action: '&',
        tooltip: '@'
    },
    controller: controller,
    controllerAs: 'vm',
    templateUrl: template
};

function controller() {
    var vm = this;

    vm.$onInit = onInit;

    function onInit() {
    }

    return vm;
}

export default fecIconButton;
