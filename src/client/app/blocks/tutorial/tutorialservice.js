// jscs:disable requireParenthesesAroundIIFE
// Turn off jshint rules:
/*jshint -W101*/ //  Line too long
(function() {
    'use strict';

    angular
        .module('blocks.tutorialGuide')
        .factory('tutorialService', tutorialService);

    tutorialService.$inject = ['$q', '$filter', 'Event', 'routerService', 'sessionService'];

    /**
     * @ngdoc service
     * @module app
     * @name tutorialService
     * @description
     *
     * This factory handels the tutorial.<br/>
     * A tutorial is based on the <a href="http://introjs.com" target="_blank">IntroJS</a> compoment and is defined by tutorial steps.<br/>
     *
        angular
            .module('myModule')
            .controller('myController', ctrlFunction);

        ctrlFunction.$inject = ['tutorialService'];

        function ctrlFunction(tutorialService) {
            tutorialService
                .setSteps('myChapter', 0, [
                    {
                        element: '#btn-contactus',
                        intro: $filter('translate')('layout.FEEDBACK_MSG'),
                        position: 'top'
                    }, {
                        element: '#btn-guidelines',
                        intro: $filter('translate')('settings.GUIDELINES'),
                        position: 'top',
                        isValid: function() { return session.isAuthenticated(); }  // optional property
                    }
                ])
                .show()
                .then(function(success) {
                    // Perform further tasks once the tutorial has been completed (success=true)
                    // or cancelled (success=false).
                });
        }
     */
    function tutorialService($q, $filter, Event, routerService, session) {

        var _isActive = false;
        var _config;

        var CONSOLE_PREFIX = 'TutorialService: ';

        var tutorial;
        var currentChapter;
        var tutorialChapters = {};
        var onHideDeferred;

        var service = {
            // Public constants
            BUTTON_BACK_PREFIX: '← ',
            BUTTON_BACK_SUFFIX: '',
            BUTTON_NEXT_PREFIX: '',
            BUTTON_NEXT_SUFFIX: ' →',
            CHAPTER_NAME_SIDEBAR_MENU: 'sidebar-menu',
            CHAPTER_NAME_SIDEBAR_SEARCH: 'sidebar-search',
            CHAPTER_NAME_SIDEBAR_SEARCH_CRITERIA: 'sidebar-search-criteria',
            CHAPTER_NAME_SIDEBAR_SEARCH_PATIENT_ID: 'sidebar-search-patient-id',
            CHAPTER_NAME_SIDEBAR_SEARCH_LOCATION: 'sidebar-search-location',
            CHAPTER_NAME_MY_COCKPIT: 'mycockpit',
            CHAPTER_NAME_IMAGING_ORDER: 'fec-imaging-order',
            CHAPTER_NAME_VISIT: 'visit',
            CHAPTER_NAME_GUARANTOR: 'fluance-guarantor',
            CHAPTER_NAME_PATIENT: 'fluance-patient',
            CHAPTER_NAME_POLICY: 'patient-policy',
            CHAPTER_NAME_APPOINTMENT: 'patient-appointment',
            onTutorialsChanged: new Event(),

            // Properties
            isVisible: false,

            // Functions
            init: init,
            isActive: isActive,
            hide: hide,
            show: show,
            setOptions: setOptions,
            setSteps: setSteps,
            current: current,
            hasCompleted: hasCompleted,
            markAsCompleted: markAsCompleted,
            notifyOnTutorialsChanged: notifyOnTutorialsChanged
        };

        // Subscribe to events
        routerService.stateChangedSuccess.subscribe(_onStateChangedSuccess);

        return service;

        function init(config) {
            if (!_.isObject(config)) { return; }

            _config = config;
            service.isActive(true);
        }

        function isActive(value) {
            if (_.isUndefined(value)) {
                return _isActive;
            } else {
                var oldValue = _isActive;
                _isActive = value;
                return oldValue;
            }
        }

        function _onStateChangedSuccess(args) {
            // Clear chapter name
            currentChapter = undefined;
        }

        /**
         * @ngdoc method
         * @name tutorialService#hasCompleted
         * @param {String} chapterName name of chapter to check if it has been read
         * @description
         *
         * Checks if the user has already read the given chapters tutorial
         * @returns boolean True if the versions match, false if the version in the profile is
         * lower than the given version
         */
        function hasCompleted(chapterName) {
            chapterName = chapterName || current();
            if (_.isObject(session.user) && _.isObject(session.user.tutorials) && _.isObject(tutorialChapters[current()])) {
                return (session.user.tutorials[chapterName] >= tutorialChapters[current()].version);
            } else {
                return false;
            }
        }

        /**
         * @ngdoc method
         * @name tutorialService#markAsCompleted
         * @param {String} chapterName name of chapter
         * @description
         *
         * Sets a new version for the given chapter name, marking this chapter for the moment as read
         * If the chapter does not exist, it gets created.
         */
        function markAsCompleted(chapterName) {
            // Validate
            if (!session.isAuthenticated()) { return $q.resolve(); }

            chapterName = chapterName || current();
            if (_.isObject(session.user) && _.isObject(session.user.tutorials) && _.isObject(tutorialChapters[current()])) {
                var tutorials = session.user.tutorials;
                tutorials[chapterName] = tutorialChapters[current()].version;
                return session.user.setUserData({ tutorials: tutorials });
            } else {
                throw '\'Chaptername\' / current() must be defined to mark as completed.';
            }
        }

        /**
         * @ngdoc method
         * @name tutorialService#current
         * @param {string} chapterName  Currently active chapter to set, will be shown when calling show
         * (except if show is called with optional chapter name parameter)
         * @description
         *
         * Sets the new chapter name as current, returns old chapter name, in case of no parameter it just returns the old current
         */
        function current(chapterName) {
            var retCurrent = currentChapter;
            if (_.isString(chapterName)) {
                currentChapter = chapterName;
                notifyOnTutorialsChanged();
            }
            return retCurrent;
        }


        /**
         * @ngdoc method
         * @name tutorialService#hide
         * @param {Boolean} hasCompleted  The value indicating whether the tutorial has been completed (true) or cancelled (false).
         * @description
         *
         * Hides the tutorial, resolving the promise returned by {@link tutorialService#show show}.
         */
        function hide(hasCompleted) {
            hasCompleted = hasCompleted || false;

            unregisterEvents();
            tutorial = undefined;
            service.isVisible = false;

            if (onHideDeferred) {
                onHideDeferred.resolve(hasCompleted);
                onHideDeferred = undefined;
            }
        }

        /**
         * @ngdoc method
         * @name tutorialService#show
         * @param {String} chapterName  The name of the chapter to display.
         * @return {Promise}           Returns a promise that will resolve once the tutorial has been completed or cancelled.
         * @description
         *
         * Shows the first step of the tutorial.
         */
        function show(chapterName) {

            // Validate
            if (!chapterName || chapterName.length === 0) {
                if (_.isUndefined(currentChapter)) {
                    var warnMsg1 = '\'chapterName\' missing (no current chapter is available either).';
                    console.warn(CONSOLE_PREFIX + warnMsg1);
                    return $q.reject(new Error(warnMsg1));
                } else {
                    chapterName = currentChapter;
                }
            }

            var steps = (_.isObject(tutorialChapters[chapterName])) ? tutorialChapters[chapterName].steps : undefined;
            var positionPrecedence = (_.isObject(tutorialChapters[chapterName])) ? tutorialChapters[chapterName].positionPrecedence : undefined;

            if (!_.isArray(steps) || steps.length === 0) {
                var errorMsg2 = 'No steps defined in chapter \'' + chapterName + '\'.';
                console.warn(CONSOLE_PREFIX + errorMsg2);
                return $q.reject(new Error(errorMsg2));
            }

            // Filer chapter to show steps valid in the current context
            steps = $filter('filter')(steps, function(step) {
                return (_.isFunction(step.isValid)) ? step.isValid() : true;
            });
            if (steps.length === 0) {
                return $q.resolve(false);
            }

            angular.forEach(steps, function(step) {
                if (step.introKey) {
                    step.intro = $filter('translate')(step.introKey);
                }
            });

            // Create and configure tutorial
            if (_.isUndefined(tutorial)) {
                tutorial = getInstance();
            }
            tutorial.setOption('steps', steps);

            // set position precedence array, used by 'auto' position steps in the chapter
            if (positionPrecedence !== undefined) {
                tutorial.setOption('positionPrecedence', positionPrecedence);
            }

            tutorial.onbeforechange(onEnteringStep);
            tutorial.onafterchange(onLeavingStep);
            registerEvents();

            tutorial.start();
            service.isVisible = true;

            onHideDeferred = $q.defer();
            return onHideDeferred.promise;
        }

        /**
         * @ngdoc method
         * @name tutorialService#setSteps
         * @param {String} chapterName  The name of the chapter that identifies the steps.
         * @param {number} version  Version of the chapter, should be incremented everytime a step changes
         * @param {Array} steps         An array of steps that define the tutorial.
         *                              <ul>
         *                              <li><b>element</b>: Node id or class name that identifies the element to be highlighted.</li>
         *                              <li><b>intro</b>: The introduction text to display in the bubble.</li>
         *                              <li><b>position</b>: The position of the bubble. Possible values are:
         *                                  top, top-left-aligned, top-middle-aligned, top-right-aligned,
         *                                  bottom, bottom-left-aligned, bottom-middle-aligned, bottom-right-aligned,
         *                                  left, right, floating
         *                              </li>
         *                              </ul>
         * @param {Array} positionPrecedence An array of positions (ordered) used to determine the position of 'auto' positioned steps.
         *                              <ul>
         *                              <li>Possible values are:
         *                                  top, top-left-aligned, top-middle-aligned, top-right-aligned,
         *                                  bottom, bottom-left-aligned, bottom-middle-aligned, bottom-right-aligned,
         *                                  left, right, floating (default)
         *                              </li>
         *                              </ul>
         * @return {tutorialService}    Returns the TutorialService for method chaining.
         * @description
         *
         * Sets the steps that define the tutorial.<br />
         * Check-out this <a href="https://github.com/usablica/intro.js/blob/master/example/programmatic/index.html">IntroJS example</a> for a definition of steps.
         *

            tutorialService
                .setSteps('chapterName', 0, [
                {
                    element: '#btn-contactus',
                    intro: $filter('translate')('layout.FEEDBACK_MSG'),
                    position: 'top'
                }, {
                    element: '#btn-guidelines',
                    intro: $filter('translate')('settings.GUIDELINES'),
                    position: 'top',
                    isValid: function() { return session.isAuthenticated(); }  // optional property
                }, {
                    element: '#btn-bookmarks',
                    intro: $filter('translate')('menu.BOOKMARKS'),
                    position: 'auto'
                }
                ], ['bottom-middle-aligned','top-middle-aligned']);

         *
         *  <h2>Versioning and chapters</h2>
         *  When setting new steps, the function accepts a chapterName and a version. With these two parameters the tutorial service determines the state of the tutorial compass icon.<br/>
         *  If there is an update on the UI and therefore the tutorial, the version should be incremented accordingly, letting users know, that the content of this site has changed at one or more places.
         *  Refer to <a href="https://confluence.fluance.net:8090/display/FT/concept.tutorialService">Tutorial Service</a> for more details.
         */
        function setSteps(chapterName, version, steps, positionPrecedence) {
            // Validate chapterName
            if (!chapterName || chapterName.length === 0) {
                var errorMsg = '\'chapterName\' missing.';
                console.error(CONSOLE_PREFIX + errorMsg);
                return $q.reject(new Error(errorMsg));
            }

            // Validate version
            if (!_.isNumber(version)) {
                var errorMsg2 = '\'version\' missing.';
                console.error(CONSOLE_PREFIX + errorMsg2);
                return $q.reject(new Error(errorMsg2));
            }

            if (!_.isArray(steps) || steps.length === 0) {
                throw '\'steps\' must be an array.';
            }

            tutorialChapters[chapterName] = {
                steps: steps,
                positionPrecedence: positionPrecedence,
                version: version
            };

            notifyOnTutorialsChanged();

            return service;
        }

        /**
         * @ngdoc method
         * @name tutorialService#notifyOnTutorialsChanged
         * @description
         *
         * Notify all listeners that the content of the tutorials service has changed

            tutorialService.notifyOnTutorialsChanged();
         */
        function notifyOnTutorialsChanged() {
            service.onTutorialsChanged.raise();
        }
        /**
         * @ngdoc method
         * @name tutorialService#setOptions
         * @param {Object} options      An object defining the options to override.
         * @return {tutorialService}    Returns the TutorialService for method chaining.
         * @description
         *
         * Sets the options that configure the bubble of the steps.<br />
         * Check-out the <a href="https://github.com/usablica/intro.js/wiki/Documentation#introjssetoptionoption-value">IntroJS documentation</a> for details.

            tutorialService
                .setOptions({
                    showStepNumbers: true,
                    showBullets: true
                });
         */
        function setOptions(options) {
            if (_.isObject(options.steps)) {
                console.warn(CONSOLE_PREFIX + 'Use \'setSteps\' to define the steps in a chapter.');
            }

            if (_.isObject(options)) {
                if (angular.isDefined(options.nextLabel)) {
                    options.nextLabel = service.BUTTON_NEXT_PREFIX + options.nextLabel + service.BUTTON_NEXT_SUFFIX;
                }

                if (angular.isDefined(options.nextLabel)) {
                    options.prevLabel = service.BUTTON_BACK_PREFIX + options.prevLabel + service.BUTTON_BACK_SUFFIX;
                }

                if (_.isUndefined(tutorial)) {
                    tutorial = getInstance();
                }
                tutorial.setOptions(options);
            }
            return service;
        }

        function getInstance() {
            var instance = introJs(); // jshint ignore:line

            instance.setOptions({
                'showStepNumbers': false,
                'showBullets': true,
                'doneLabel': $filter('translate')('core.TUTORIAL_OK_BTN'),
                'nextLabel': service.BUTTON_NEXT_PREFIX + $filter('translate')('core.TUTORIAL_NEXT_BTN') + service.BUTTON_NEXT_SUFFIX,
                'prevLabel': service.BUTTON_BACK_PREFIX + $filter('translate')('core.TUTORIAL_BACK_BTN') + service.BUTTON_BACK_SUFFIX,
                'skipLabel': $filter('translate')('core.TUTORIAL_SKIP_BTN'),
            });

            return instance;
        }

        function registerEvents() {
            if (tutorial) {
                tutorial.oncomplete(function() {
                    service.hide(true); // Tutorial completed successfully
                });

                tutorial.onexit(function() {
                    service.hide(false); // Tutorial was skipped or cancelled
                });

                // Register events for CSS transition support
                if (tutorial._options) {
                    angular.forEach(tutorial._options.steps, function(step) {
                        if (angular.isDefined(step.element)) {
                            $(step.element).on('transitionend', function() {
                                tutorial.refresh();
                            });
                        }
                    });
                }
            }
        }

        function unregisterEvents() {
            // Unregister events from CSS transition support
            if (tutorial && tutorial._options) {
                angular.forEach(tutorial._options.steps, function(step) {
                    if (angular.isDefined(step.element)) {
                        $(step.element).off('transitionend');
                    }
                });
            }
        }

        function onEnteringStep(element) {
            if (tutorial && tutorial._options && tutorial._options.steps) {
                var currentStep = tutorial._options.steps[tutorial._currentStep];
                if (currentStep && _.isFunction(currentStep.onEnteringStep)) {
                    currentStep.onEnteringStep();
                }
            }
        }

        function onLeavingStep(element) {
            if (tutorial && tutorial._options && tutorial._options.steps) {
                var currentStep = tutorial._options.steps[tutorial._currentStep];
                if (currentStep && _.isFunction(currentStep.onLeavingStep)) {
                    currentStep.onLeavingStep();
                }
            }
        }
    }
})();