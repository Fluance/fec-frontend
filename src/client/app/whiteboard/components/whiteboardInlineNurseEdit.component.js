import _ from 'lodash';
import template from './whiteboardInlineNurseEdit.component.html';

const WhiteboardInlineNurseEdit = {
    bindings: {
        item: '='
    },
    controller: controller,
    templateUrl: template
};

/*jshint maxparams: 20 */
controller.$inject = [
    '$rootScope',
    '$translate',
    'logger',
    'whiteboardService'
];

function controller($rootScope, $translate, logger, whiteboardService) {
    var ctrl = this;
    ctrl.editMode;

    // Events
    ctrl.$onInit = onInit;

    // API
    ctrl.enterEditMode = enterEditMode;
    ctrl.selectedItemChange = selectedItemChange;
    ctrl.nurseChanged = nurseChanged;

    // ------------------------------------------------------- Event methods
    function nurseChanged() {
        ctrl.editItem.nurseName = ctrl.selectedNurse;
        saveItem();
    }

    function onInit() {
        ctrl.editMode = false;
        ctrl.editItem = angular.copy(ctrl.item);
    }

    // ------------------------------------------------------- API methods

    function enterEditMode() {
        if (!ctrl.editMode) {
            $rootScope.$broadcast(whiteboardService.EVENT_LEAVE_NURSE_EDIT_MODE, {});
            ctrl.editCanceled = false;
            _lockItem(ctrl.item.id).then((lock) => {
                // IF LOCK SUCCESS
                _loadNurses().then(function (nurses) {
                    var body = document.getElementsByTagName('body')[0];
                    body.addEventListener("click", _clickEventListener);
                    ctrl.nurses = nurses;
                    ctrl.selectedNurse = ctrl.editItem.nurseName;
                    ctrl.editMode = true;
                    ctrl._handleLeaveNurseEditMode = $rootScope.$on(whiteboardService.EVENT_LEAVE_NURSE_EDIT_MODE, function () {
                        _removeClickEventListener();
                        _unlockItem(ctrl.item.id);
                    });
                });
            }).catch((error) => {
                logger.warning($translate.instant('whiteboard.ITEM_IS_LOCKED'), false);
            });
        }
    }

    function saveItem() {
        whiteboardService.updateWhiteboardItem(ctrl.editItem).then((updatedItem) => {
            ctrl.item = updatedItem;
            logger.success($translate.instant('whiteboard.SUCCESS_ON_ACTION_SAVE'), false);
            _removeClickEventListener();
            _unlockItem(ctrl.item.id);
        });
    }

    function selectedItemChange(item) {
        if (!_.isEmpty(item)) {
            ctrl.editItem.nurseName = item.display;
        }
    }

    function _loadNurses() {
        return whiteboardService.getNurses()
            .then(function (nurses) {
                return nurses;
            });
    }

    function _checkIfElementOrParentContainsSpecificClass(element) {
        if (_.indexOf(element.classList, 'nurse-inline-selection') >= 0) {
            return true;
        } else if (element.parentNode) {
            return _checkIfElementOrParentContainsSpecificClass(element.parentNode);
        } else {
            return false;
        }
    }

    function _clickEventListener(event) {
        event = event || window.event;
        if (!_checkIfElementOrParentContainsSpecificClass(event.target)) {
            _removeClickEventListener();
            _unlockItem(ctrl.item.id);
        }
    }

    function _removeClickEventListener() {
        const body = document.getElementsByTagName('body')[0];
        body.removeEventListener("click", _clickEventListener, false);
    }

    function _lockItem(itemId) {
        if (whiteboardService.stopAutoRefresh) {
            whiteboardService.stopAutoRefresh();
        }
        return whiteboardService.lockWhiteboardItem(itemId);
    }

    function _unlockItem(itemId) {
        if (whiteboardService.startAutoRefresh) {
            whiteboardService.startAutoRefresh();
        }
        ctrl.editMode = false;
        ctrl._handleLeaveNurseEditMode();
        return whiteboardService.unlockWhiteboardItem(itemId);
    }
}

export default WhiteboardInlineNurseEdit;
