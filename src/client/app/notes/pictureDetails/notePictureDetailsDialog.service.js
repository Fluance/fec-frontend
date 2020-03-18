import angular from 'angular';
import template from './notePictureDetailsDialog.html';

NotePictureDetailsService.$inject = ['$mdDialog', '$timeout'];

function NotePictureDetailsService($mdDialog, $timeout) {

    var service = {};

    // Public API
    service.showPictureDetails = showPictureDetails;

    return service;

    // ------------------------------------------------------------------------- Interface methods

    function showPictureDetails($event, selectedPictureId, pictureList) {
        $event.stopPropagation();
        var parentEl = angular.element(document.body);

        var backdropOpacity = 0.6;

        $mdDialog.show({
            parent: parentEl,
            targetEvent: $event,
            templateUrl: template,
            controller: ['$scope', '$mdDialog', DialogController],
            controllerAs: '$ctrl',
            onShowing: function() {
                $timeout(function() {
                    if (angular.isNumber(backdropOpacity)) {
                        document.getElementsByClassName("md-dialog-backdrop")[0].style.opacity = backdropOpacity;
                    }
                });
            },
            clickOutsideToClose: true,
            escapeToClose: true,
            fullscreen: true
        });

        function DialogController($scope, $mdDialog) {
            var ctrl = this;
            ctrl.pictureList = pictureList;
            ctrl.selectedPictureId = selectedPictureId;

            // Event listening
            $scope.$on('onImageLoading', onImageLoading);
            $scope.$on('onImageLoaded', onImageLoaded);

            ctrl.closeDialog = function() {
                $mdDialog.hide();
            };

            // -------------------------------------------------------- Event handling

            function onImageLoading() {
                ctrl.isLoading = true;
            }

            function onImageLoaded() {
                ctrl.isLoading = false;
            }
        }
    }
}

export default NotePictureDetailsService;
