import _ from 'lodash';
import template from './visit.component.html';

const visit = {
    bindings: {
        result: '='
    },
    controller: controller,
    controllerAs: 'vm',
    templateUrl: template
};

controller.$inject = [
    '$scope',
    '$q',
    '$filter',
    'logger',
    'dataservice.visits',
    'dataservice.interventions',
    'config',
    'sessionService'
];

function controller($scope, $q, $filter, logger, dataserviceVisits,
    dataserviceInterventions, config, session) {

    var fnFormatDate = $filter('formatDate');
    var fnTranslate = $filter('translate');

    /*jshint validthis: true */
    var vm = this;

    // Functions for the UI sorted by name
    vm.allowPhysicianList = allowPhysicianList;
    vm.displayDetails = displayDetails;
    vm.isInternalAccessor = !config.externalAccessor;
    vm.supportsReporting = _.isBoolean(config.supportsReporting) ? config.supportsReporting : true;
    vm.interventions = undefined;
    //vm.result = { physicians: {} };

    function allowPhysicianList() {
        var hasRoleNurse = session.user && session.user.hasRole(['nurse']);
        var hasRoleOtherThanNurse = session.user && session.user.hasRole(
            ['admin', 'administrative', 'chef', 'financial', 'physician', 'sysadmin']);

        //If user is just Nurse he will not have access to physicians list
        if (hasRoleNurse && !hasRoleOtherThanNurse) {
            vm.hasAccess = false;
        } else {
            vm.hasAccess = true;
        }
        return vm.hasAccess;
    }

    function displayDetails(vnb) {
        // Notify visit state changed
        onStateChanged();

        // Load details when expanded
        if (vm.result.isExpanded) {
            vm.result.isLoadingDetails = true;
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
                    vm.result.isLoadingDetails = false;
                });
        }
    }

    function getPhysicianList(vnb) {
        if (allowPhysicianList()) {
            return dataserviceVisits
                .getPhysicianList(vnb)
                .then(function (physicians) {
                    if (physicians && vm.result) { vm.result.physicians = physicians; }
                })
                .catch(function(error) {
                    console.error(error);
                });
        } else {
            return $q.resolve([]);
        }
    }

    function getVisitById(vnb) {
        return dataserviceVisits
            .getVisitById(vnb)
            .then(function (visitdetails) {
                if (vm.result) { vm.result.details = visitdetails; }
            })
            .catch(function(error) {
                console.error(error);
            });
    }

    function onStateChanged() {
        $scope.$emit('visit.stateChanged', {
            vnb: vm.result.visit.visitInfo.number,
            isExpanded: vm.result.isExpanded,
            hasDetails: angular.isObject(vm.result.details)
        });
    }

    // ----------------------------------------------------------------- Interventions handling

    function _getInterventionsList(vnb) {
        return dataserviceInterventions
            .getInterventionsByVisitId(vnb)
            .then(function (interventions) {
                if (_.isObject(interventions)) {
                    vm.interventions = {
                        DATE: fnFormatDate(interventions.interventionDate, 'date'),
                        entries: _createInterventionEntries(interventions)
                    };
                } else {
                    vm.interventions = undefined;
                }
            })
            .catch(function (error) {
                vm.interventions = undefined;

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
            var diagnosis = _.find(diagnoses, { rank: rank });
            var operation = _.find(operations, { rank: rank });
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

export default visit;
