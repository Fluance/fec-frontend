import _ from 'lodash';
import moment from 'moment';
import template from './whiteboardSurgeryEditNote.component.html';

function whiteboardSurgeryNoteEditConfig(ngQuillConfigProvider) {
    ngQuillConfigProvider.set({
        placeholder: ''
    });
}

const config = ['ngQuillConfigProvider', whiteboardSurgeryNoteEditConfig];

const WhiteboardSurgeryEditNote = {
    controller: controller,
    templateUrl: template
};

controller.$inject = [
    '$scope',
    '$state',
    '$stateParams',
    '$translate',
    'logger',
    'sessionService',
    'smDatePickerLocalizationService',
    'whiteboardSurgeryService'
];

function controller(
    $scope,
    $state,
    $stateParams,
    $translate,
    logger,
    sessionService,
    smDatePickerLocalizationService,
    whiteboardSurgeryService
) {
    var ctrl = this;

    ctrl.itemId = 0;
    ctrl.isLocked = {};

    // Public methods
    ctrl.cancel = cancel;
    ctrl.save = save;

    // Events
    ctrl.$onInit = onInit;

    // ------------------------------------------------

    /**
     * Initialize the page
     */
    function onInit() {
        ctrl.selectedDate = $stateParams.date ? new Date($stateParams.date) : new Date(); // Given date, today as default
        ctrl.selectedDateToShow = moment(ctrl.selectedDate); // Date to show in the UI
        ctrl.originDate = moment(ctrl.selectedDate); // Remember origin date to be able to go back

        smDatePickerLocalizationService.setTranslation();

        $scope.$watch("$ctrl.selectedDate", function (newValue, oldValue) {
            if (newValue && newValue !== oldValue) {
                _unlockRessource(sessionService.user.companyId, oldValue);
                _lockRessource(sessionService.user.companyId, newValue);
                ctrl.selectedDateToShow = moment(newValue);
                _loadSurgeryboard();
            }
        });
        _lockRessource(sessionService.user.companyId, ctrl.selectedDate);
        _loadSurgeryboard();
    }

    /**
     * Save the note for the surgeryboard of the selected date
     */
    function save() {
        whiteboardSurgeryService.setSurgeryboard({
            companyId: sessionService.user.companyId,
            date: moment(ctrl.selectedDate).format('YYYY-MM-DD'),
            note: ctrl.surgeryboardNote
        }).then((data) => {
            logger.success($translate.instant('core.OPERATION_SUCCESSFUL'));
            _unlockRessource(sessionService.user.companyId, ctrl.selectedDate);
            $state.go('whiteboardSurgery', { 'date': moment(ctrl.originDate).format('YYYY-MM-DD') });
        }).catch((data) => {
            logger.success($translate.instant('core.OPERATION_FAILED'));
        });
    }

    /**
     * cancel and go back to the surgery board
     */
    function cancel() {
        _unlockRessource(sessionService.user.companyId, ctrl.selectedDate);
        $state.go('whiteboardSurgery', { 'date': moment(ctrl.originDate).format('YYYY-MM-DD') });
    }

    /**
     * Load the surgery board for the given date
     */
    function _loadSurgeryboard() {
        let date = moment(ctrl.selectedDate);
        whiteboardSurgeryService.getSurgeryboard({
            companyId: sessionService.user.companyId,
            date: date.format('YYYY-MM-DD')
        }).then((data) => {
            ctrl.surgeryboardNote = data ? data.note : '';
        });
    }

    /**
     * Lock the Surgeryboard
     * @param {*} companyId
     * @param {*} date
     */
    function _lockRessource(companyId, date) {
        ctrl.itemId = companyId + moment(date).format('YYYYMMDD');
        const itemId = ctrl.itemId;
        ctrl.checkForLock = true;
        return whiteboardSurgeryService
            .lockSurgeryboard(itemId)
            .then(function (data) {
                ctrl.isLocked[itemId] = false;
                ctrl.checkForLock = false;
            }).catch(function (reason) {
                ctrl.isLocked[itemId] = true;
                ctrl.checkForLock = false;
            });
    }

    /**
     * Unlock the Surgeryboard
     * @param {*} companyId
     * @param {*} date
     */
    function _unlockRessource(companyId, date) {
        const itemId = companyId + moment(date).format('YYYYMMDD');
        if (!ctrl.isLocked[itemId]) {
            return whiteboardSurgeryService
                .unlockSurgeryboard(itemId)
                .then(function (data) {
                    ctrl.isLocked[itemId] = false;
                }).catch(function (reason) {
                    ctrl.isLocked[itemId] = true;
                });
        }
    }
}

export {
    WhiteboardSurgeryEditNote,
    config
};
