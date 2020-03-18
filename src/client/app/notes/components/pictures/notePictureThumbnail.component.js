import template from './notePictureThumbnail.component.html';

const NotePictureThumbnail = {
    bindings: {
        picture: '<',
        showDetails: '<',
        onClickShowDetails: '&'
    },
    controller: ['notePictureDetails', controller],
    controllerAs: 'vm',
    templateUrl: template
};

function controller(notePictureDetails) {
    var vm = this;

    vm.showPictureDetails = showPictureDetails;

    // ------------------------------------------------------------------------- Component methods

    function showPictureDetails($event, pictureId) {
        if(!vm.onClickShowDetails) {
            // show note picture details when image is clicked
            notePictureDetails.showPictureDetails($event, pictureId);
        }
        else {
            vm.onClickShowDetails({$event: $event, pictureId: pictureId});
        }

        // prevent event propagation (eg: ui-sref navigation on parent element)
        $event.stopPropagation();
    }
}

export default NotePictureThumbnail;
