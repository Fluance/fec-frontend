(function() {
    'use strict';

    angular
        .module('blocks.tutorialGuide')
        .component('fecTutorialGuide', {
            bindings: {
                chapterName: '@',
                iconType: '@',
                styleClass: '@',
            },
            controller: controller,
            controllerAs: 'vm',
            templateUrl: 'app/blocks/tutorial/tutorialGuide.directive.html',

        });

    controller.$inject = ['$element', 'tutorialService'];

    /**
     * @ngdoc directive
     * @module blocks
     * @name tutorialGuide
     * @restrict 'E'
     * @scope
     * @param {string} styleClass                   style class applied to the compass icon
     * @param {string} chapterName                  the chapter of tutorial, which is started when the icon is clicked
     * @return {Object} directive
     *
     * @description
     * This is a directive to create the small compass (or similar icon) the user can click to show the tutorial.
     *
        <fec-tutorial-guide  
            chapter-version="1" 
            chapter-name="{{vm.tutorialService.CHAPTER_NAME_SIDEBAR_MENU}}">
        </fec-tutorial-guide>
     */
    function controller($element, tutorialService) {

        /*jshint validthis: true */
        var vm = this;
        vm.hasCompletedTutorial = false;

        // Methods
        vm.hasChapterName = hasChapterName;
        vm.showTutorial = showTutorial;

        vm.$onInit = onInit;
        vm.$onDestroy = onDestroy;

        return vm;

        // ------------------------------------------------------------------------- Initialization

        function onInit() {
            if (!tutorialService.isActive()) {
                $element.remove();
            } else {
                // Default icon
                if (!_.isString(vm.iconType) || vm.iconType.length === 0) { vm.iconType = 'tutorial'; }

                // Register events
                tutorialService.onTutorialsChanged.subscribe(_onTutorialsChanged);

                _refreshInactiveClass();
            }
        }

        function onDestroy() {
            tutorialService.onTutorialsChanged.unsubscribe(_onTutorialsChanged);
        }

        // --------------------------------------------------------------- Interface implementation

        function hasChapterName() {
            return vm.chapterName || tutorialService.current();
        }

        //Show the tutorial and if the user 'gets it', save the 'igotit'-version to the profile
        function showTutorial() {
            tutorialService
                .show(vm.chapterName)
                .then(function(success) {
                    if (success) {
                        tutorialService.markAsCompleted(vm.chapterName);
                        //Update highlight state so there is no need for watches
                        _refreshInactiveClass();
                    }
                });
        }

        // ------------------------------------------------------------------------- Helper methods

        function _refreshInactiveClass() {
            vm.hasCompletedTutorial = tutorialService.hasCompleted(vm.chapterName);
        }

        function _onTutorialsChanged() {
            _refreshInactiveClass();
        }
    }
})();