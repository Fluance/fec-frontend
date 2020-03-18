// jscs:disable requireParenthesesAroundIIFE
import $ from 'jquery';

NoteCategoriesController.$inject = ['$stateParams', '$q', '$translate', 'logger', '$filter'];

/* @ngInject */
function NoteCategoriesController($stateParams, $q, $translate, logger, $filter) {

    /*jshint validthis: true */
    var vm = this;
    vm.title = 'NoteCategoriesController';

    vm.patientId = $stateParams.pid;

    // Populate our scope (as vm)
    $.extend(vm, {
        currentPage: 1, // Current page number
        totalRecords: 0, // Total records in a result list
        pageSize: 40, // Number of item per page
        isLoadingMore: false, // Is currently loading
        singleResultSearch: false, // Is single result page
        isComplete: false,
        isEmpty: false
    });

    activate();

    function activate() {
        /*
        if (tutorialService.isActive()) {
            // Configure tutorials
            configureTutorial();
            tutorialService.current(vm.title);
        }*/
    }

    function configureTutorial() {
        tutorialService
            .setSteps(vm.title, 0, [{
                element: '#patientDetail',
                introKey: 'dashboard.MY_PATIENTS_TITLE',
                position: 'bottom-middle-aligned'
            }, {
                element: '#visitDetail',
                introKey: 'dashboard.MY_PATIENTS_TITLE',
                position: 'bottom-middle-aligned'
            }, {
                element: '#guarantorDetail',
                introKey: 'dashboard.MY_PATIENTS_TITLE',
                position: 'bottom-middle-aligned'
            }, {
                element: '#btn-guarantors-invoices',
                introKey: 'dashboard.MY_PATIENTS_TITLE',
                position: 'floating'
            }, {
                element: '#btn-contactus',
                introKey: 'dashboard.MY_PATIENTS_TITLE',
                position: 'top-right-aligned'
            }]);
    }
}


export default NoteCategoriesController;
