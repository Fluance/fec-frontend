import angular from 'angular';
import _ from 'lodash';
import template from './notePictureDetails.component.html';

const NotePictureDetails = {
    bindings: {
        pictureList: '<',
        selectedPictureId: '<'
    },
    controller: ['$document', '$scope', '$timeout', '$filter', '$window', '$mdMedia', 'dataservice.pictures', 'dataservice.notes', 'notePictureFullScreen', controller],
    templateUrl: template
};

function controller($document, $scope, $timeout, $filter, $window, $mdMedia, dataservicePictures, dataserviceNotes, notePictureFullScreen) {

    var SHOW_NOTE_INFO_DEFAULT = 'true';

    var ctrl = this;

    ctrl.selectedPicturePos = 0;
    ctrl.note = {};

    ctrl.getSelectedPictureUrl = getSelectedPictureUrl;
    ctrl.getSelectedPictureAnnotation = getSelectedPictureAnnotation;
    ctrl.getSelectedPictureFileName = getSelectedPictureFileName;
    ctrl.nextPicture = nextPicture;
    ctrl.prevPicture = prevPicture;
    ctrl.getPictureNav = getPictureNav;
    ctrl.onImageLoaded = onImageLoaded;
    ctrl.onClickFullScreen = onClickFullScreen;

    // Events
    ctrl.$onInit = onInit;
    ctrl.$onDestroy = onDestroy;

    // ------------------------------------------------------------------------- Event handling

    function onInit() {
        ctrl.totalPictures = ctrl.pictureList.length;

        // Initialize optional parameters
        if (!_.isString(ctrl.showNoteInfo)) {
            ctrl.showNoteInfo = SHOW_NOTE_INFO_DEFAULT;
        }

        // find selected picture position
        ctrl.selectedPicturePos = _.findIndex(ctrl.pictureList, function(picture) { return picture.pictureId === ctrl.selectedPictureId; });
        _setNoteForSelectedPicture();

        _listenToKeyboardEvents();

        $scope.$watch(function() {
            return ctrl.selectedPicturePos;
        }, function(currentPicturePos) {
            if (angular.isDefined(currentPicturePos)) {
                $scope.$emit('onImageLoading');
                ctrl.loading = true;
            }
        });

        _lockScroll();
    }

    function onDestroy() {
        _cleanup();
    }

    // ------------------------------------------------------------------------- Component methods

    function onClickFullScreen($event) {
        var pictureUrl = dataservicePictures.getPictureUrl(ctrl.pictureList[ctrl.selectedPicturePos].pictureId);

        notePictureFullScreen.showPictureFullScreen($event, pictureUrl);
    }

    function getSelectedPictureUrl() {
        return dataservicePictures.getPictureUrl(ctrl.pictureList[ctrl.selectedPicturePos].pictureId);
    }

    function getSelectedPictureAnnotation() {
        return ctrl.pictureList[ctrl.selectedPicturePos].annotation;
    }

    function getSelectedPictureFileName() {
        return ctrl.pictureList[ctrl.selectedPicturePos].fileName;
    }

    function nextPicture() {
        if(ctrl.selectedPicturePos < ctrl.totalPictures-1) {
            ctrl.selectedPicturePos++;
            _setNoteForSelectedPicture();
        }
        else {
            ctrl.selectedPicturePos = 0;
            _setNoteForSelectedPicture();
        }
    }

    function prevPicture() {
        if(ctrl.selectedPicturePos > 0) {
            ctrl.selectedPicturePos--;
            _setNoteForSelectedPicture();
        }
        else {
            ctrl.selectedPicturePos = ctrl.totalPictures-1;
            _setNoteForSelectedPicture();
        }
    }

    function getPictureNav() {
        return ctrl.selectedPicturePos+1 + '/' + ctrl.totalPictures;
    }

    function onImageLoaded() {
        ctrl.loading = false;

        ctrl.resizing = true;
        _resize().then(function () {
            ctrl.resizing = false;
            $scope.$emit('onImageLoaded');
        });
    }


    // ---------------------------------------------------------- Helper functions
    angular.element($window).bind('resize',function(){
        if(!ctrl.loading && !ctrl.resizing){
            ctrl.resizing=true;

            $timeout(function(){
                _resize().then(function(){
                    ctrl.resizing=false;
                });
            });
        }
    });

    function _setNoteForSelectedPicture() {
        var noteId = ctrl.pictureList[ctrl.selectedPicturePos].noteId;
        dataserviceNotes
            .getNote(noteId)
            .then(function(note) {
                ctrl.note = note;
            })
            .catch(function() {
                ctrl.note = {};
            });
    }

    function _resize() {
        var imgContainer = document.getElementById("notes_picture_details_image_container");
        var imgElement = null;

        if (imgContainer !== null){
            imgElement = imgContainer.getElementsByTagName("img");
        }

        if(imgElement !== null){
            var img          = imgElement[0];
            var viewportArea = _getViewportArea();

            var height = img.naturalHeight;
            var width  = img.naturalWidth;

            if (img.naturalWidth / viewportArea.width > img.naturalHeight / viewportArea.height) {
                // adjust width to viewport
                if (img.naturalWidth > viewportArea.width) {
                    width = viewportArea.width;
                }
                height = img.naturalHeight * (width / img.naturalWidth);
            } else {
                // adjust height to viewport
                if (img.naturalHeight > viewportArea.height) {
                    height = viewportArea.height;
                }
                width = img.naturalWidth * (height / img.naturalHeight);
            }

            img.style.height = height + "px";
            img.style.width  = width + "px";
        }

        return $timeout();
    }

    function _getViewportArea() {
        var factor       = 0.9;

        var body = document.documentElement || document.body;
        var windowWidth  = window.innerWidth || body.clientWidth;
        var windowHeight = window.innerHeight || body.clientHeight;

        var area         = {
            width: (windowWidth) * factor - 70,
            height: (windowHeight) * factor - 260
        };

        return area;
    }

    function _listenToKeyboardEvents() {
        $document.bind("keydown", _keypressHandler);
    }

    function _stopListeningToKeyboardEvents() {
        $document.unbind("keydown", _keypressHandler);
    }

    function _keypressHandler(event) {
        var fn = null;
        switch (event.keyCode) {
            case 37: //"ArrowLeft":
            case 40: //"ArrowDown":
                fn = document.dir == "rtl" ? nextPicture : prevPicture;
                break;
            case 39: //"ArrowRight":
            case 38: //"ArrowUp":
                fn = document.dir == "rtl" ? prevPicture : nextPicture;
                break;
        }
        if (fn) {
            event.stopPropagation();
            event.preventDefault();
            $scope.$apply(fn);
        }
    }

    function _cleanup() {
        _stopListeningToKeyboardEvents();
        _unlockScroll();
    }

    function _lockScroll() {
        angular.element('body').css('overflow', 'hidden');
        angular.element('body').bind('touchmove', function(e) {
            e.preventDefault()
        });
    }

    function _unlockScroll() {
        angular.element('body').css('overflow', 'scroll');
        angular.element('body').unbind('touchmove');
    }

}

export default NotePictureDetails;
