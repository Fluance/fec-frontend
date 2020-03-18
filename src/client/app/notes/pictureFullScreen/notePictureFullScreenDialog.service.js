
import angular from 'angular';
import template from './notePictureFullScreenDialog.html';

NotePictureFullScreenService.$inject = ['$mdDialog', '$timeout'];

function NotePictureFullScreenService($mdDialog, $timeout) {

    var service = {};

    // Public API
    service.showPictureFullScreen = showPictureFullScreen;

    return service;

    // ------------------------------------------------------------------------- Interface methods

    function showPictureFullScreen($event, pictureUrl) {
        $event.stopPropagation();

        var parentEl = angular.element(document.body);


        $mdDialog.show({
            parent: parentEl,
            targetEvent: $event,
            templateUrl: template,
            controller: ['$scope', '$mdDialog', '$timeout', '$window', DialogController],
            controllerAs: 'vm',
            fullscreen: true,
            multiple: true,
            clickOutsideToClose: true,
            escapeToClose: true
        });

        function DialogController($scope, $mdDialog, $timeout, $window) {
            var vm = this;
            vm.isLoading = true;
            vm.pictureUrl = pictureUrl;
            vm.onImageLoaded = onImageLoaded;

            vm.closeDialog = function() {
                $mdDialog.hide();
            };

            function onImageLoaded() {
                vm.loading = false;

                vm.resizing = true;
                _resize().then(function () {
                    vm.resizing = false;
                    $scope.$emit('onImageLoaded');
                });
            }

            // ---------------------------------------------------------- Helper functions
            angular.element($window).bind('resize',function(){
                if(!vm.loading&&!vm.resizing){
                    vm.resizing=true;
                    _resize().then(function(){
                        vm.resizing=false;
                    });
                }
            });

            function _resize() {
                var imgContainer   = document.getElementById("notes_picture_full_screen_image_container");
                var imgElement     = imgContainer.getElementsByTagName("img");

                if(imgContainer != null && imgElement !== null) {
                    var img = imgElement[0];
                    var viewportArea = _getViewportArea();

                    var height = 0;
                    var width = 0;

                    if (img.naturalHeight > img.naturalWidth) {
                        height = viewportArea.height;
                        width = img.naturalWidth * (height / img.naturalHeight);

                        if (width > viewportArea.width) {
                            width = viewportArea.width;
                            height = img.naturalHeight * (width / img.naturalWidth);
                        }
                    } else {
                        width = viewportArea.width;
                        height = img.naturalHeight * (width / img.naturalWidth);

                        if (height > viewportArea.height) {
                            height = viewportArea.height;
                            width = img.naturalWidth * (height / img.naturalHeight);
                        }
                    }

                    imgContainer.style.height = height + "px";
                    imgContainer.style.width = width + "px";

                    //Ensure that the image size is equal to the container. Is it necessary?
                    img.style.height = height + "px";
                    img.style.width = width + "px";
                }

               return $timeout();
            }

            function _getViewportArea() {
                var factor       = 1;
                var paddings     = 90;
                var windowWidth  = window.innerWidth;
                var windowHeight = window.innerHeight;
                var area         = {
                    width: (windowWidth) * factor - paddings,
                    height: (windowHeight) * factor - paddings
                };

                return area;
            }

        }
    }
}

export default NotePictureFullScreenService;

