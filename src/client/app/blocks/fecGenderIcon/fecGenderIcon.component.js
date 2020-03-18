import template from './fecGenderIcon.component.html';

/**
 * @ngdoc component
 * @scope
 * @module app
 * @name fecGenderIcon
 *
 * @description
 *
 * Component that display an icon corresponding to a gender
 *
 */
const fecGenderIcon = {
    bindings: {
        gender: '@',
        size: '@',
        color: '@'
    },
    controller: controller,
    controllerAs: '$ctrl',
    templateUrl: template
};

function controller() {
    var vm = this;

    // constants
    vm.GENDER_UNKNOWN = 'u';

    vm.$onInit = onInit;

    function onInit() {
    }
}

export default fecGenderIcon;
