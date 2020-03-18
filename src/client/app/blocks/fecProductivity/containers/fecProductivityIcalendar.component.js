
const fecProductivityIcal = {
    bindings: {
        eventName: '@',
        eventStart: '<',
        eventEnd: '<',
        url: '<',
        location: '<',
        patient: '<',
        responsible: '<',
        tooltip: '@?'
    },
    controller: controller,
    template: '<fec-productivity-widget ng-if="$ctrl.isValidDate" url="$ctrl.url" filename="$ctrl.filename" icon-type="$ctrl.ICON_ICALENDAR" tooltip="{{$ctrl.tooltip}}"></fec-productivity-widget>'
};

controller.$inject = [
    '$element',
    '$filter',
    'dataservice.productivity',
    'productivityService'
];

function controller($element, $filter, productivityDataservice, productivityService) {
    /*jshint validthis: true */
    var ctrl = this;

    var FILE_PREFIX = 'event';
    var FILE_EXTENSION = 'ics';

    // Remove tag if Productivity Tie-Ins feature is not activated
    if (!productivityService.isActive()) {
        $element.remove();
    }
    else {
        ctrl.$onInit = onInit;
    }

    // -------------------------------------------------------------- Events

    function onInit() {
        ctrl.ICON_ICALENDAR = 'exportCalendar';

        if (_.isUndefined(ctrl.eventStart) || _.isNull(ctrl.eventStart)) {
            ctrl.isValidDate = false;
        } else {
            ctrl.isValidDate = true;
            ctrl.url = productivityDataservice.getCalendarEventUrl(ctrl.eventName, ctrl.eventStart, ctrl.eventEnd, ctrl.url, ctrl.location, ctrl.patient, ctrl.responsible);
            ctrl.filename = _getEventFilename();
        }
    }

    function _getEventFilename() {
        return FILE_PREFIX + '-' + $filter('formatDate')(ctrl.eventStart, 'date') + '-' + $filter('formatDate')(ctrl.eventStart, 'time') + '.' + FILE_EXTENSION;
    }
}

export default fecProductivityIcal;

