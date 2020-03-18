import template from './fullSearchResultItemPatient.component.html';

const FullSearchResultItemPatient = {
    templateUrl: template,
    controller: controller,
    bindings: {
        patient: '<',
        criteria: '<'
    }
};

controller.$inject = [
    '$filter',
    '$scope',
    '$q',
    'logger',
    'searchStateManager',
    'dataservice.patients'
];

function controller($filter, $scope, $q, logger, searchStateManager, dataservicePatients) {

    var ctrl = this;
    var fnTranslate = $filter('translate');

    ctrl.originState = 'search';

    // events
    ctrl.$onInit = onInit;
    // interface
    ctrl.displayDetails = displayDetails;
    ctrl.getAddress = getAddress;
    ctrl.getPatientLastName = getPatientLastName;
    ctrl.getPatientFirstName = getPatientFirstName;

    // --------------------------------------------- Events

    function onInit() {
        ctrl.result = {
            patient: ctrl.patient,
            isExpanded: false
        };
    }

    // --------------------------------------------- Interface

    function displayDetails(pid) {
        // Notify patient state changed
        onStateChanged();
        searchStateManager.setPatientSearchSelectedPid(pid);

        if (ctrl.result.isExpanded) {
            ctrl.isDetailLoading = true;
            return $q
                .all([
                    _getPatientDetail(pid),
                    _getNextOfKin(pid)
                ])
                .catch(function (exception) {
                    var message = fnTranslate('error.ERROR');
                    logger.error(message, exception);
                })
                .finally(function () {
                    ctrl.isDetailLoading = false;
                });
        }
    }

    function getAddress() {
        var address = '';
        if (!_.isUndefined(ctrl.result.patient) && !_.isUndefined(ctrl.result.patient.address)) {
            address = ctrl.result.patient.address;
            if (!_.isUndefined(ctrl.result.patient.postcode)) {
                address += ', ' + ctrl.result.patient.postcode;
            }
            if (!_.isUndefined(ctrl.result.patient.locality)) {
                if (_.isUndefined(ctrl.result.patient.postcode)) {
                    address += ',';
                }
                address += ' ' + ctrl.result.patient.locality;
            }
        }
        return address ? address : '-';
    }


    function getPatientLastName() {
        if (ctrl.result && ctrl.result.patient && ctrl.result.patient.lastName) {
            return ctrl.result.patient.lastName.toUpperCase();
        }
    }

    function getPatientFirstName() {
        if (ctrl.result && ctrl.result.patient && ctrl.result.patient.firstName) {
            return normalizeName(ctrl.result.patient.firstName);
        }
    }

    function onStateChanged() {
        $scope.$emit('patient.stateChanged', {
            isExpanded: ctrl.result.isExpanded,
            hasDetails: angular.isObject(ctrl.result.details)
        });
    }

    function _getPatientDetail(pid) {
        return dataservicePatients
            .getPatientDetail(pid)
            .then(function (patient) {
                ctrl.result.details = patient;
            });
    }

    function _getNextOfKin(pid) {
        return dataservicePatients
            .getPatientNextOfKinList(pid)
            .then(function (nok) {
                var promises = [];
                if (nok !== null && nok !== undefined) {
                    ctrl.result.nextofkin = nok;

                    // For each nok, we query contacts details
                    for (var j = 0; j < ctrl.result.nextofkin.length; j = j + 1) {
                        promises.push(_getNextOfKinContact(ctrl.result.nextofkin[j].nextOfKinId));
                    }
                }

                _getBillingContacts();

                // we query each nok to get details of it.
                return $q.all(promises);
            });
    }

    function _getBillingContacts() {
        if (ctrl.result.nextofkin) {
            ctrl.result.billingContacts = _.filter(ctrl.result.nextofkin, function (item) {
                return item.addressType && item.addressType.indexOf('billing') > -1;
            });
        } else {
            ctrl.result.billingContacts = [];
        }
    }

    function _getNextOfKinContact(nokid) {
        return dataservicePatients.getPatientNextOfKinContactList(nokid)
            .then(function (contacts) {
                nok.contacts = contacts;
            });
    }
}

/**
 * private method
 **/
function normalizeName(name) {
    if (name !== null) {
        return name.replace(/([^\W_]+[^\s-]*) */g, function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    } else {
        return null;
    }
}


export default FullSearchResultItemPatient;
