import template from './pictureGallery.component.html';

const PictureGallery = {
    bindings: {
        patientId: '<'
    },
    controller: ['dataservice.notes', 'dataservice.pictures', controller],
    controllerAs: 'vm',
    templateUrl: template
};

function controller(dataserviceNotes, dataservicePictures) {
    var vm = this;

    vm.$onInit = onInit;
    vm.hasAnnotation = hasAnnotation;

    // ------------------------------------------------------

    function onInit() {
        dataservicePictures
            .getPicturesFromGallery(vm.patientId)
            .then(function(galleryList) {
                vm.galleryList = galleryList;
            });
    }

    // -----------------------------------------------------

    function hasAnnotation(picture) {
        return vm.showHasAnnotation === 'true' && picture.annotation;
    }
}

export default PictureGallery;
