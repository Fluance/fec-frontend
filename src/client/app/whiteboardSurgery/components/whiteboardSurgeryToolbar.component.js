import _ from 'lodash';
import moment from 'moment';
import template from './whiteboardSurgeryToolbar.component.html';

const WhiteboardSurgeryToolbar = {
    bindings: {
        roomName: '<?',
    },
    controller: controller,
    templateUrl: template
};

controller.$inject = [
    '$interval',
    '$stateParams',
    '$timeout',
    'config'
];

function controller(
    $interval,
    $stateParams,
    $timeout,
    config
) {
    var ctrl = this;
    var minuteRefreshHandler;

    // Events
    ctrl.$onInit = onInit;
    ctrl.$onDestroy = onDestroy;

    // ------------------------------------------------

    /**
     * Initialize the interval and set the today Date
     */
    function onInit() {
        if ($stateParams.date) {
            ctrl.selectedDate = moment($stateParams.date);
        }
        _initializeInterval();
        _setTodayDate();
    }

    /**
     * Destroy interval before leaving the component
     */
    function onDestroy() {
        _destroyInterval();
    }

    /**
     * Destroy the refresh interval
     */
    function _destroyInterval() {
        if (!_.isUndefined(minuteRefreshHandler)) {
            $interval.cancel(minuteRefreshHandler);
            minuteRefreshHandler = undefined;
        }
    }

    /**
     * Initialize the refresh interval
     */
    function _initializeInterval() {
        if (_.isUndefined(minuteRefreshHandler)) {
            const secondsUntilNextInterval = 60 - moment().seconds();
            $timeout(_setRefreshInterval, secondsUntilNextInterval * 1000);
        }
    }

    /**
     * Set the refresh interval
     */
    function _setRefreshInterval() {
        _setTodayDate();
        minuteRefreshHandler = $interval(_setTodayDate, (config.whiteboardSurgery.autoRefreshInterval * 1000));
    }

    /**
     * Set the current date and time to the todayDate variable
     */
    function _setTodayDate() {
        ctrl.todayDate = moment();
    }
}

export default WhiteboardSurgeryToolbar;
