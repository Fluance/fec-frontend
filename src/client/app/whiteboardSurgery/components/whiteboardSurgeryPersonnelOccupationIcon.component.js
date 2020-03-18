import template from "./whiteboardSurgeryPersonnelOccupationIcon.component.html";
import _ from "lodash";

const WhiteboardSurgeryPersonnelOccupationIcon = {
    bindings: {
        size: '@',
        codeOccupation: '@',
        defaultCodeOccupation: '@'
    },
    controller: controller,
    templateUrl: template
};

controller.$inject = ['config'];

function controller(config) {
    var ctrl = this;

    //default value
    const DEFAULT_OCCUPATION = {
        iconType: 'employee',
        translation: 'PERSONNEL_OCCUPATION_ASSISTANT'
    };

    ctrl.$onInit = onInit;

    function onInit() {
        let occupation;

        if(!_.isNil(ctrl.codeOccupation)){
            occupation = _findOccupation(ctrl.codeOccupation);
        }

        if(_.isNil(occupation) && !_.isNil(ctrl.defaultCodeOccupation)) {
            occupation = _findOccupation(ctrl.defaultCodeOccupation);
        }

        if(_.isNil(occupation)) {
            occupation = DEFAULT_OCCUPATION;
        }

        ctrl.iconType = occupation.iconType;
        ctrl.translation = occupation.translation;
    }

    function _findOccupation(occupationCode) {
        return _.find(config.whiteboardSurgery.resource.occupations, (occupation) => {
            return occupation.codeOccupation === occupationCode;
        });
    }
}

export default WhiteboardSurgeryPersonnelOccupationIcon;
