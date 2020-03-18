import template from './noteDetails.component.html';

const NoteDetails = {
    bindings: {
        noteId: '<',
        note: '<',
        notePictures: '<',
        pictureDisplayMode: '@',
        isDisabled: '<',
        hidePictures: '<'
    },
    controller: ['dataservice.pictures', controller],
    templateUrl: template
};

function controller(dataservicePictures) {
    var ctrl = this;

    ctrl.$onInit = onInit;

    function onInit() {
        if (!ctrl.hidePictures) {
            //ensure that there are pictures, set hidePicture to true if there aren't
            dataservicePictures.getPicturesCount(ctrl.noteId)
                .then(function (count) {
                    if (count > 0) {
                        ctrl.hidePictures = false;
                    } else {
                        ctrl.hidePictures = true;
                    }
                });
        }
    }

}

export default NoteDetails;
