import template from './fullSearchResultItemVisit.component.html';

const FullSearchResultItemVisit = {
    templateUrl: template,
    controller: controller,
    bindings: {
        visit: '<',
        criteria: '<'
    }
};

controller.$inject = [
    '$scope',
    '$q',
    '$filter',
    'logger',
    'dataservice.visits',
    'dataservice.interventions',
    'dataservice.companies',
    'config',
    'sessionService',
    '$sce'
];

function controller($scope, $q, $filter, logger, dataserviceVisits, dataserviceInterventions, dataserviceCompanies, config, session, $sce) {

    /* from visit controller */
    var fnFormatDate = $filter('formatDate');
    var fnTranslate = $filter('translate');

    var ctrl = this;

    ctrl.originState = 'search';

    ctrl.isInternalAccessor = !config.externalAccessor;
    ctrl.supportsReporting = _.isBoolean(config.supportsReporting) ? config.supportsReporting : true;
    ctrl.interventions = undefined;

    // events
    ctrl.$onInit = onInit;
    // interfaceo
    // Functions for the UI sorted by name
    ctrl.allowPhysicianList = allowPhysicianList;
    ctrl.displayDetails = displayDetails;
    ctrl.displayDetails = displayDetails;
    ctrl.getPatientFirstName = getPatientFirstName;
    ctrl.getPatientLastName = getPatientLastName;

    // ---------------------------------------------

    function onInit() {
        ctrl.result = {
            vnb: ctrl.visit.id,
            visit: ctrl.visit,
            isExpanded: false
        };

        if (ctrl.result && ctrl.result.visit &&
            ctrl.result.visit.companyId) {
            dataserviceCompanies.getCompanyDetail(ctrl.result.visit.companyId)
                .then(function (company) {
                    ctrl.result.visit.companyName = company.name;
                    ctrl.result.visit.companyCode = company.code;
                });
        }
    }

    function displayDetails(vnb) {
        // Notify visit state changed
        onStateChanged();

        // Load details when expanded
        if (ctrl.result.isExpanded) {
            ctrl.result.isLoadingDetails = true;
            $q
                .all([
                    getVisitById(vnb),
                    getPhysicianList(vnb),
                    _getInterventionsList(vnb)
                ])
                .catch(function (exception) {
                    var message = fnTranslate('error.ERROR');
                    logger.error(message, exception);
                })
                .finally(function () {
                    ctrl.result.isLoadingDetails = false;
                });
        }
    }

    function getPatientFirstName() {
        if (ctrl.result && ctrl.result.visit && ctrl.result.visit.firstName) {
            return normalizeName(ctrl.result.visit.firstName);
        }
    }

    function getPatientLastName() {
        if (ctrl.result && ctrl.result.visit && ctrl.result.visit.lastName) {
            return ctrl.result.visit.lastName.toUpperCase();
        }
    }

    function onStateChanged() {
        $scope.$emit('visit.stateChanged', {
            vnb: ctrl.result.vnb,
            isExpanded: ctrl.result.isExpanded,
            hasDetails: angular.isObject(ctrl.result.details)
        });
    }

    function getVisitById(vnb) {
        return dataserviceVisits
            .getVisitById(vnb)
            .then(function (visitInfo) {
                var result = {
                    visit: {
                        visitInfo: visitInfo
                    },
                    company: visitInfo.company // Have to remap so the directive works for single view too
                };
                prepareVisitData(result);
            })
            .catch(function (exception) {
                if (exception.status === 404) {
                    ctrl.isEmpty = true;
                } else {
                    ctrl.isException = true;
                    var message = fnTranslate('error.ERROR');
                    logger.error(message, exception);
                }
            });
    }

    function prepareVisitData(result) {
        // Initialize result objects
        if (result) {
            ctrl.result.isExpanded = true;
            ctrl.result.isLoadingDetails = false;
            ctrl.result.isLoadingPhysicians = false;
            ctrl.result.details = null;
            ctrl.result.physicians = null;
            ctrl.result.company = result.company;
            ctrl.result.visit.visitInfo = result.visit.visitInfo;
        }

        ctrl.isEmpty = !angular.isObject(ctrl.result);
    }

    function getPhysicianList(vnb) {
        if (allowPhysicianList()) {
            return dataserviceVisits
                .getPhysicianList(vnb)
                .then(function (physicians) {
                    if (physicians && ctrl.result) {
                        ctrl.result.physicians = physicians;
                    }
                });
        } else {
            return $q.resolve([]);
        }
    }

    function allowPhysicianList() {
        var hasRoleNurse = session.user && session.user.hasRole(['nurse']);
        var hasRoleOtherThanNurse = session.user && session.user.hasRole(
            ['admin', 'administrative', 'chef', 'financial', 'physician', 'sysadmin']);

        //If user is just Nurse he will not have access to physicians list
        if (hasRoleNurse && !hasRoleOtherThanNurse) {
            ctrl.hasAccess = false;
        } else {
            ctrl.hasAccess = true;
        }
        return ctrl.hasAccess;
    }

    // ----------------------------------------------------------------- Interventions handling

    function _getInterventionsList(vnb) {
        return dataserviceInterventions
            .getInterventionsByVisitId(vnb)
            .then(function (interventions) {
                if (_.isObject(interventions)) {
                    ctrl.interventions = {
                        DATE: fnFormatDate(interventions.interventionDate, 'date'),
                        entries: _createInterventionEntries(interventions)
                    };
                }
                else {
                    ctrl.interventions = undefined;
                }
            })
            .catch(function (error) {
                ctrl.interventions = undefined;

                switch (error.status) {
                    case 404:
                        // No intervations found; nothing to do
                        break;

                    default:
                        throw error;
                }
            });
    }

    function _createInterventionEntries(interventions) {
        var diagnoses = _.sortBy(interventions.diagnosis, 'rank');
        var operations = _.sortBy(interventions.operations, 'rank');
        var allRanks = _.map(interventions.diagnosis, 'rank').concat(_.map(interventions.operations, 'rank'));
        var minRank = _.min(allRanks);
        var maxRank = _.max(allRanks);
        var entries = [];
        var rank = minRank;
        while (rank <= maxRank) {
            var diagnosis = _.find(diagnoses, {rank: rank});
            var operation = _.find(operations, {rank: rank});
            if (diagnosis || operation) {
                entries.push({
                    DIAGNOSIS: (diagnosis) ? diagnosis.description : fnTranslate('visit.NOT_SPECIFIED'),
                    OPERATION: (operation) ? operation.description : fnTranslate('visit.NOT_SPECIFIED')
                });
            }
            rank++;
        }

        return entries;
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

export default FullSearchResultItemVisit;
