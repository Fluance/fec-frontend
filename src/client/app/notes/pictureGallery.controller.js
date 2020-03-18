(function() {
    'use strict';

    angular
        .module('app.notes')
        .controller('NotesPictureGalleryController', NotesPictureGalleryController);

    NotesPictureGalleryController.$inject = ['$stateParams'];
    function NotesPictureGalleryController($stateParams) {
        var vm = this;

        vm.patientId = $stateParams.pid || $state.params.pid;
    }
})();
