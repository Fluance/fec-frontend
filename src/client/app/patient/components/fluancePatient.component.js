// jscs:disable requireParenthesesAroundIIFE

import template from './fluancePatient.component.html';

const fluancePatient = {
    bindings: {
        result: '<',
        query: '<'
    },
    controller: [
        'searchQuery',
        '$q',
        '$translate',
        '$scope',
        'logger',
        'searchStateManager',
        'dataservice.patients',
        'dataservice.notes',
        'dataservice.notecategories',
        'dataservice.accessLogs',
        'config',
        controller
    ],
    templateUrl: template
};

function controller(
    SearchQuery,
    $q,
    $translate,
    $scope,
    logger,
    searchStateManager,
    dataservicePatients,
    dataserviceNotes,
    dataserviceNoteCategories,
    config
) {
    /*jshint validthis: true */
    var ctrl = this;

    // events
    ctrl.$onInit = onInit;
    // interface
    ctrl.displayDetails = displayDetails;
    ctrl.getAddress = getAddress;
    ctrl.getPatientName = getPatientName;
    ctrl.getPatienMaideName = getPatienMaideName;
    ctrl.getPatientFirstName = getPatientFirstName;

    // -------------------------------------- Events

    function onInit() {
        ctrl.patient = ctrl.result.patient;

        ctrl.isDetailLoading = true;
        ctrl.isInternalAccessor = !config.externalAccessor;
        ctrl.hasAccessLogData = true;
        ctrl.stateParams = _.merge(ctrl.query.toStateParams(), { pid: ctrl.result.patient.pid, originState: 'search' });

        ctrl.criteria = new SearchQuery(ctrl.query).toStateParams();
    }

    // -------------------------------------- Interface

    function getAddress() {
        var address = '';
        if (ctrl.patient && ctrl.patient.address) {
            address = ctrl.patient.address;
            if (ctrl.patient.postcode) {
                address += ', ' + ctrl.patient.postcode;
            }
            if (ctrl.patient.locality) {
                if (!ctrl.patient.postcode) {
                    address += ',';
                }
                address += ' ' + ctrl.patient.locality;
            }
        }

        return address ? address : '-';
    }

    function getPatientName() {
        var patientName = '';
        if (ctrl.patient && ctrl.patient.lastName) {
            patientName = ctrl.patient.lastName + ' ';
        }

        return patientName;
    }
    function getPatienMaideName() {
        var maidenName = '';
        if (ctrl.patient && ctrl.patient.maidenName) {
            maidenName = '(-' + ctrl.patient.maidenName + ') ';

        }

        return maidenName;
    }
    function getPatientFirstName() {
        var firstName = '';
        if (ctrl.patient && ctrl.patient.firstName) {
            firstName = ctrl.patient.firstName + ' ';
        }

        return firstName;
    }

    function displayDetails(pid) {
        // Notify patient state changed
        onStateChanged();
        searchStateManager.setPatientSearchSelectedPid(pid);

        if (ctrl.result.isExpanded) {
            ctrl.isDetailLoading = true;
            return $q
                .all([
                    _getPatientDetail(pid),
                    getNextOfKin(pid)
                ])
                .catch(function (exception) {
                    $translate('error.ERROR').then(function (translation) {
                        logger.error(translation, exception);
                    });
                })
                .finally(function () {
                    ctrl.isDetailLoading = false;
                });
        }
    }

    function getNextOfKin(pid) {
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

    function _getNextOfKinContact(nokid) {
        return dataservicePatients.getPatientNextOfKinContactList(nokid)
            .then(function (contacts) {
                nok.contacts = contacts;
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

    function _getPatientDetail(pid) {
        return dataservicePatients
            .getPatientDetail(pid)
            .then(function (patient) {
                ctrl.result.details = patient;
            });
    }

    function getNoteCategories(patientId) {
        dataserviceNoteCategories
            .getNoteCategories()
            .then(function (categories) {
                ctrl.noteCategories = _.each(categories, function (category) {
                    dataserviceNotes.getPatientNotes(patientId, category.id).then(function (notes) {
                        category.notes = notes;
                    });
                });
            });
    }

    function onStateChanged() {
        $scope.$emit('patient.stateChanged', {
            isExpanded: ctrl.result.isExpanded,
            hasDetails: angular.isObject(ctrl.result.details)
        });
    }
}

export default fluancePatient;
