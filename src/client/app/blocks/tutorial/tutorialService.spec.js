/* jshint -W117, -W030 */
describe('blocks.tutorialGuide', function() {

    // Do not test any auth or user related stuff in here, this is a tutorialService dedicated test file only!

    var tutorialService,
        cacheFactory,
        today;

    var STEP_SET = [{
        element: '.my-patient-title',
        intro: '$filter(\'translate\')(\'dashboard.MENU\')',
        position: 'bottom-middle-aligned'
    }, {
        element: '#myPatientsToday',
        intro: '$filter(\'translate\')(\'dashboard.MENU\')',
        position: 'floating',
        isValid: function() {
            return true;
        }
    }, {
        element: '#myPatientsThisWeek',
        intro: '$filter(\'translate\')(\'dashboard.SEARCH\')',
        position: 'floating',
        isValid: function() {
            false;
        }
    }];

    beforeEach(function() {
        module('app');
        inject(['tutorialService', 'CacheFactory',
            function($tutorialService, $CacheFactory) {
                tutorialService = $tutorialService;
                cacheFactory = $CacheFactory;
                cacheFactory.destroyAll();
            }
        ]);
        tutorialService.setSteps('testSteps', STEP_SET);
    });

    // Check if a given step set has already been read
    it('tutorialService add a chapter and check that it has been read', function() {
        tutorialService.hasSeenTutorial('testSteps', 0);
        expect(true).toBe(tutorialService.isLatestTutorial('testSteps', 0));
    });


    // Check if a given step set has not been read
    it('tutorialService add a chapter and check that it has not been read', function() {
        tutorialService.hasSeenTutorial('testSteps', 0);
        expect(false).toBe(tutorialService.isLatestTutorial('testSteps', 1));
    });

    // Delete the tutorials object resetting all read stati
    it('check resetting the tutorial', function() {
        tutorialService.clearTutorials();
        expect(false).toBe(tutorialService.isLatestTutorial('testSteps', 1));
        expect(false).toBe(tutorialService.isLatestTutorial('testSteps', 0));
        expect(false).toBe(tutorialService.isLatestTutorial('deletedSteps', 1));

    });

    // Check that the tutorials object is handled correctly
    it('test current() as getter and setter', function() {
        tutorialService.current('testSteps_OLD');
        expect('testSteps_OLD').toBe(tutorialService.current('testSteps_NEW'));
        expect('testSteps_NEW').toBe(tutorialService.current());
    });

});
