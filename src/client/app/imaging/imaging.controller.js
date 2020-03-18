import angular from 'angular';
import _ from 'lodash';
import templateReport from './report-dialog.tmpl.html';
import templateRecipient from './recipient-dialog.tmpl.html';

ImagingController.$inject = [
    '$scope',
    '$stateParams',
    '$q',
    '$mdDialog',
    '$window',
    'moment',
    //'LayoutPatientContextBox',
    'dataPager',
    'dataservice.imaging',
    'imagingReportEmailingService',
    'dataservice.patients',
    'dataservice.accessLogs',
    //'tutorialService',
    'layoutService',
    'config',
    'sessionService',
    'TabOpenerService'
];

function ImagingController(
    $scope,
    $stateParams,
    $q,
    $mdDialog,
    $window,
    moment,
    //ContextBox,
    DataPager,
    dataServiceImaging,
    imagingReportEmailingService,
    dataServicePatients,
    dataServiceAccessLogs,
    //tutorialService,
    layoutService,
    config,
    session,
    tabOpener) {

    var standaloneReports = [];

    /*jshint validthis: true */
    var vm = this;
    vm.title = 'ImagingController';

    // Properties
    vm.dialogContext = null;

    // Sort options
    vm.sortCriteria = dataServiceImaging.sortCriteria;
    var DEFAULT_SORT_CRITERIA = ($stateParams.orderby) ? $stateParams.orderby : (vm.sortCriteria.length > 0) ? vm.sortCriteria[0].key : undefined;
    var DEFAULT_SORT_DIRECTION = ($stateParams.sortorder) ? $stateParams.sortorder : 'desc';
    vm.selectedSortBy = DEFAULT_SORT_CRITERIA;
    vm.selectedSortDirection = DEFAULT_SORT_DIRECTION;

    // Paging
    vm.dataPagerImaging = new DataPager();
    vm.dataPagerImaging.pageSize = 1000000;
    vm.dataPagerImaging.loadPage = loadImagingPage;
    vm.dataPagerImaging.sortBy = vm.selectedSortBy;
    vm.dataPagerImaging.sortDirection = vm.selectedSortDirection;

    // Paging for reports without links
    vm.dataPagerReports = new DataPager();
    vm.dataPagerReports.pageSize = 1000000;
    vm.dataPagerReports.loadPage = loadReportPage;
    vm.dataPagerReports.sortBy = vm.selectedSortBy;
    vm.dataPagerReports.sortDirection = vm.selectedSortDirection;

    // Operation methods
    vm.refresh = refresh;
    vm.canSort = function () { return vm.dataPagerImaging.items.length > 1; };

    // Imaging and reports displaying methods
    vm.showAllImagingURL = showAllImagingURL;
    vm.showImageSetURL = showImageSetURL;
    vm.showReportDialog = showReportDialog;
    vm.showRecipientDialog = showRecipientDialog;
    vm.previousReport = previousReport;
    vm.nextReport = nextReport;

    // Report Dialog Context
    vm.dialogContext = {
        patient: null,
        elementId: 'report-dialog',
        message: 'imaging.WARN_LEAVE_MSG',
        report: null,
        reportIndex: 0,
        reportArray: 0,
        deferredPromise: $q.defer()
    };

    // Events
    //$scope.$on('imagingOrder.stateChanged', onImagingOrderStateChanged);

    activate();
    return vm;

    // ------------------------------------------------------------------- Interface operations

    function activate() {
        _setScrollableContainerForInfiniteScroll();

        /*
        if (tutorialService.isActive()) {
            // Configure tutorials
            configureTutorial();
            configureTutorialImagingOrder();
            tutorialService.current(vm.title);
        }*/

        // Load view
        refresh();
    }

    function refresh() {
        // Set "sort by" and "sort direction" according to data-pager-sort element
        vm.dataPagerImaging.sortBy = vm.selectedSortBy;
        vm.dataPagerImaging.sortDirection = vm.selectedSortDirection;
        vm.dataPagerReports.sortBy = vm.selectedSortBy;
        vm.dataPagerReports.sortDirection = vm.selectedSortDirection;

        vm.dataPagerImaging.reset();
        vm.dataPagerImaging
            .getNextPage()
            .then(function () {
                // Expand if only 1 item
                if (vm.dataPagerImaging.items.length === 1) {
                    vm.dataPagerImaging.items[0].isExpanded = true;
                }
            })
            .then(function () {
                vm.dataPagerReports.reset();
                return vm.dataPagerReports.getNextPage();
            })
            .then(function () {
                // Expand if only 1 item
                if (vm.dataPagerReports.items.length === 1) {
                    vm.dataPagerReports.items[0].isExpanded = true;
                }
            });
    }

    // --------------------------------------------------------------- Dialogs & Outgoing links

    function showAllImagingURL() {
        var telemisUrl = config.imagingURL +
            session.getUILanguage().toUpperCase() +
            config.imagingStartApp +
            $stateParams.pid;

        //navigateTo(telemisUrl);
        return telemisUrl;
    }

    function showImageSetURL(imagingOrder) {
        //navigateTo(imagingOrder.orderUrl);
        return imagingOrder.orderUrl;
    }

    function showReportDialog(item) {
        // Set the correct array as current
        vm.dialogContext.reportArray = item.imagingOrder.images && item.imagingOrder.images.length > 0 ? 0 : 1;

        $mdDialog.show({
            controller: ['$mdDialog', reportDialogController],
            controllerAs: 'reportDialogCtrl',
            parent: angular.element(document.body),
            templateUrl: templateReport,
            clickOutsideToClose: true,
            escapeToClose: true,
            fullscreen: true
        });

        function reportDialogController($mdDialog) {
            this.context = vm.dialogContext;
            this.context.report = item.imagingOrder.report;
            this.context.reportIndex = item.imagingOrder.reportIndex;
            this.context.reportsNumber = vm.reports.length;
            this.delegate = vm;
            this.isServiceActive = imagingReportEmailingService.isActive();

            this.enterRecipient = function () {
                this.delegate.showRecipientDialog();
            };

            this.hide = function () {
                $mdDialog.hide();
            };

            this.cancel = function () {
                $mdDialog.cancel();
            };

            this.answer = function (answer) {
                $mdDialog.hide(answer);
            };
        }
    }

    function showRecipientDialog(item, itemIndex) {
        $mdDialog.show({
            controller: ['$mdDialog', 'dataservice.imaging', 'logger', '$translate', recipientDialogController],
            controllerAs: 'recipientDialogCtrl',
            parent: angular.element(document.body),
            templateUrl: templateRecipient,
            clickOutsideToClose: true,
            escapeToClose: true,
            fullscreen: true
        });
    }

    function recipientDialogController($mdDialog, dataServiceImaging, logger, translate) {

        // We rely on the report dialog context to retrieve data
        this.context = vm.dialogContext;
        this.isSending = false;

        var that = this;

        this.submit = function (recipientAddress) {
            // We send the report by email
            var report = vm.dialogContext.report;
            var studyUniqueId = report.studyUid;
            var patientId = report.patientId;
            var emailAddress = recipientAddress;
            that.isSending = true;

            imagingReportEmailingService
                .sendReportByEmail(studyUniqueId, patientId, emailAddress)
                .then(function successCallback(response) {
                    that.isSending = false;
                    logger.success(translate.instant('core.OPERATION_SUCCESSFUL'));
                }, function errorCallback(response) {
                    that.isSending = false;
                    logger.error(translate.instant('core.OPERATION_FAILED'));
                }).then(function () {
                    $mdDialog.hide();
                });
        };

        this.cancel = function () {
            $mdDialog.cancel();
        };
    }

    // --------------------------------------------------------------------------- Data loading

    function loadReportPage(pageIndex, pageSize, sortBy, sortDirection) {

        // Convert items to viewmodel objects
        var imagingOrderViewModel = standaloneReports.map(function (standaloneReport) {
            return {
                imagingOrder: new ImagingOrder(null, standaloneReport),
                isExpanded: false,
            };
        });

        // Initialize total record count
        vm.dataPagerReports.setTotalItemsCount(imagingOrderViewModel.length);

        // Sorting by date
        var sortedImagingOrderViewModel = _.orderBy(imagingOrderViewModel, function (imagingOrderViewModel) {
            return imagingOrderViewModel.imagingOrder.date;
        }, [sortDirection]);

        _setReportIndex(sortedImagingOrderViewModel);

        _sortReportsByDate(sortDirection);

        return $q.resolve(sortedImagingOrderViewModel);
    }

    function loadImagingPage(pageIndex, pageSize, sortBy, sortDirection) {
        var params = {
            pid: $stateParams.pid,
            offset: pageIndex * pageSize,
            limit: pageSize,
            orderby: sortBy,
            sortorder: sortDirection
        };

        return $q
            .all([
                dataServiceImaging.getExams($stateParams.pid),
                dataServiceImaging.getReports($stateParams.pid),
                dataServicePatients.getPatientByPid($stateParams.pid)
            ])
            .then(function (result) {
                var images = result[0];
                var reports = result[1];
                var patient = result[2];

                // all reports
                var tmpReports = reports;
                vm.reports = [[], []];

                // set patient info
                vm.dialogContext.patient = patient.patient;

                var imagingOrders = _buildImagingOrders(images, tmpReports);
                standaloneReports = _buildStandaloneReports(images, tmpReports);

                // Initialize total record count
                vm.dataPagerImaging.setTotalItemsCount(vm.dataPagerImaging.totalItemsCount + imagingOrders.length);

                // Convert items to viewmodel objects
                var sortedImagingOrderViewModel = _.sortBy(imagingOrders.map(function (imagingOrder) {
                    return {
                        imagingOrder: imagingOrder,
                        isExpanded: false,
                    };
                }),
                function (imagingOrderViewModel) { // sortBy hook
                    return imagingOrderViewModel.imagingOrder.date;
                });
                _sortReportsByDate(params.sortorder);
                var sortedItems = params.sortorder === 'asc' ? sortedImagingOrderViewModel : sortedImagingOrderViewModel.reverse();

                _setReportIndex(sortedItems);

                return sortedItems;
            });
    }

    function _buildImagingOrders(images, reports) {
        // Group images by orders, patients and companies
        var groupedImages = _.values(_.groupBy(images, function (image) {
            return image.orderNb + image.patientId + image.companyId;
        }));

        // Create imaging orders
        return groupedImages.map(function (images) {
            var reportIndex = _.findIndex(reports, { orderNb: images[0].orderNb });
            var report = reports[reportIndex];

            return new ImagingOrder(images, report);
        });
    }

    function _buildStandaloneReports(images, reports) {
        var orderNumbers = _.uniq(_.map(images, 'orderNb'));

        // Get all reports, that are not assigned to a known imaging-order
        return _.filter(reports, function (report) {
            return !_.includes(orderNumbers, report.orderNb);
        });
    }

    function _setReportIndex(items) {
        var reportIndex = 0;
        _.each(items, function (item) {
            if (item.imagingOrder.reportIndex >= 0) {
                item.imagingOrder.reportIndex = reportIndex;
                reportIndex += 1;
            }
        });
    }

    function _sortReportsByDate(sortOrder) {
        var tmpReports = [];
        _.each(vm.reports, function(reportArray) {
            tmpReports.push(_.orderBy(reportArray, ['studyDate'], [sortOrder]));
        });
        vm.reports = tmpReports;
    }

    // ------------------------------------------------------------------------------- Tutorial

    function configureTutorial() {
        var contextBoxSteps = ContextBox.getTutorialSteps(),
            steps = [{
                element: '[tutorial-step="imaging-list"]',
                introKey: 'imaging.GUIDE_VISITS_IMAGING',
                position: 'floating'
            },
            {
                element: '[tutorial-step="report-list"]',
                introKey: 'imaging.GUIDE_VISITS_REPORT',
                position: 'floating'
            }
            ];

        tutorialService.setSteps(vm.title, 0, contextBoxSteps.concat(steps));
    }

    function configureTutorialImagingOrder() {
        // tutorialService
        //     .setSteps(tutorialService.CHAPTER_NAME_IMAGING_ORDER, 0, [
        //         // ToDo: Add steps
        //     ]);
    }

    function onImagingOrderStateChanged() {
        // Set tutorial chapter
        var chapter = (_.some(vm.dataPagerImaging.items, function (r) {
            return r.isExpanded;
        })) ? tutorialService.CHAPTER_NAME_IMAGING_SET : vm.title; // jshint ignore:line
        tutorialService.current(chapter);
    }

    // ------------------------------------------------------------------------ Dialog handling

    function navigateTo(input) {
        // the input can be an imageOrder objector a string containing the url
        var url = _.isObject(input) ? input.orderUrl : input;

        // Log the access
        dataServiceAccessLogs.writeLog($stateParams.pid, 'imaging', undefined);

        // open new tab/window
        tabOpener.openInNewTab(url);
    }

    function previousReport() {
        vm.dialogContext.reportIndex -= 1;
        if (vm.dialogContext.reportIndex < 0) {
            _setReportArray();
            vm.dialogContext.reportIndex = vm.reports[vm.dialogContext.reportArray].length - 1;
        }
        _setReport();
    }

    function nextReport() {

        vm.dialogContext.reportIndex += 1;
        if (vm.dialogContext.reportIndex >= vm.reports[vm.dialogContext.reportArray].length) {
            _setReportArray();
            vm.dialogContext.reportIndex = 0;
        }
        _setReport();
    }

    function _setReport() {
        vm.dialogContext.report = vm.reports[vm.dialogContext.reportArray][vm.dialogContext.reportIndex];
    }

    function _setReportArray() {
        var nextArray = vm.dialogContext.reportArray === 1 ? 0 : 1;
        if (vm.reports[nextArray].length > 0) {
            vm.dialogContext.reportArray = nextArray;
        }
    }

    // -------------------------------------------------------------------------- Model objects

    // ImagingOrder constructor
    function ImagingOrder(images, report) {
        if (!images && !report) { throw new Error('Invalid arguments sent to ImagingOrder constructor.'); }
        if (report) {
            var hasImages = images && images.length > 0 ? 0 : 1;
            vm.reports[hasImages].push(report);
            this.reportIndex = (vm.reports[hasImages].length - 1);
        } else {
            this.reportIndex = -1;
        }
        this.images = _.isArray(images) ? images : [];
        this.report = report;
        this.date = (this.images.length > 0) ? _.first(this.images).serieObsDate : this.report.studyDate;
        this.orderNumber = (this.images.length > 0) ? this.images[0].orderNb : this.report.orderNb;
        this.orderObservation = (this.images.length > 0) ? this.images[0].orderObs : _.first(this.report.report.split('\n'));
        this.orderUrl = (this.images.length > 0) ? this.images[0].orderUrl : undefined;
    }

    // ----------------------------------------------------------------------- Helper functions

    function _setScrollableContainerForInfiniteScroll() {
        // Set scrollable container property (relevant for infinite-scroll)
        vm.scrollableContainer = layoutService.getScrollableContainer();
    }
}

export default ImagingController;
