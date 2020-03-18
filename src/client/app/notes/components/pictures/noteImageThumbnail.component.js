import template from './noteImageThumbnail.component.html';

const NoteImageThumbnail = {
    bindings: {
        picture: '<',
        showDetails: '<',
        onClickShowDetails: '&'
    },
    controller: [controller],
    controllerAs: 'vm',
    templateUrl: template
};

function controller() {
    var vm = this;

    vm.showPictureDetails = showPictureDetails;

    // ------------------------------------------------------------------------- Component methods

    function showPictureDetails($event, pictureId) {
        if(vm.showDetails) {
            // show note picture details when image is clicked
            vm.onClickShowDetails({$event: $event, pictureId: pictureId});

            // prevent event propagation (eg: ui-sref navigation on parent element)
            $event.stopPropagation();
        }
    }
}

export default NoteImageThumbnail;
