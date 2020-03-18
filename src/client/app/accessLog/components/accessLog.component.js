import template from './accessLog.component.html';

const AccessLog = {
    templateUrl: template,
    bindings: {
        item: '=',
        patient: '=',
        isExpanded: '=?',
        isExpandedChanged: '&'
    },
    controller: ['$filter', AccessLogController],
    controllerAs: 'vm'
};

function AccessLogController($filter) {
    var vm = this;

    vm.firstName = firstName;
    vm.lastName = lastName;
    vm.userName = userName;
    vm.hasActualUsername = hasActualUsername;
    vm.mainUserName = mainUserName;
    vm.$onInit = onInit;
    vm.formatTimestamp = formatTimestamp;

    // -------------------------------------------------

    function onInit() {
        vm.spin = true;
    }

    function firstName(item) {
        if(item && item.user) {
            if (hasActualUsername(item)) {
                return item.user.actualFirstName;
            } else {
                return item.user.firstName;
            }
        } else {
            return '';
        }
    }

    function lastName(item) {
        if(item && item.user) {
            if (hasActualUsername(item)) {
                return item.user.actualLastName;
            } else {
                return item.user.lastName;
            }
        } else {
            return '';
        }
    }

    function hasActualUsername(item) {
        return item && item.user && item.user.actualUsername;
    }

    function formatTimestamp(logDate) {
        // ISO8601, RFC3339 - momentjs
        // http://stackoverflow.com/questions/16616950/date-function-returning-invalid-date-in-safari-and-firefox
        // TODO: replace with 'new to come' formatDate filter by type (date, time, datetime...)
        //return $filter('formatDate')(item.logDate);
        return $filter('formatDate')(logDate, 'dateTime');
    }

    function userName(item) {
        if(hasActualUsername(item)){
            return item.user.actualUsername;
        } else {
            if (item && item.user && item.user.username) {
                return item.user.username.split('/')[1];
            } else {
                return '';
            }
        }
    }

    function mainUserName(item) {
        if (item && item.user && item.user.username) {
            return item.user.username.split('/')[1];
        } else {
            return '';
        }
    }
}

export default AccessLog;
