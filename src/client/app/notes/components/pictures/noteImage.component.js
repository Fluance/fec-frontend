import _ from 'lodash';
import template from './noteImage.component.html';

const NoteImage = {
    bindings: {
        imageType: '@',
        imageUrl: '@',
        pictureId: '<',
        showAnnotationIcon: '<',
        showDetails: '<',
        onClickShowDetails: '&',
        onImageLoaded: '&',
        isLoading: '=',
        isResizing: '='
    },
    controller: [controller],
    controllerAs: 'vm',
    templateUrl: template,
    transclude: true
};

function controller() {
    var vm = this;

    // events
    vm.$onInit = onInit;
    // interface
    vm.onClick = onClick;

    // ------------------------------------------------------------------------- EVent methods

    function onInit() {
        vm.showAnnotationIcon = _.isBoolean(vm.showAnnotationIcon) ? vm.showAnnotationIcon : false; // default: don't show annotation icon
        vm.showDetails = _.isBoolean(vm.showDetails) ? vm.showDetails : true; // default: show picture details
    }

    // ------------------------------------------------------------------------- Interface methods

    function onClick($event) {
        if(vm.showDetails) {
            // show note picture details when image is clicked
            vm.onClickShowDetails({$event: $event, pictureId: vm.pictureId});
        }

        // prevent event propagation (eg: ui-sref navigation on parent element)
        $event.stopPropagation();
    }
}


export default NoteImage;
