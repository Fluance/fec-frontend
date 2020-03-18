import template from './visit-details.component.html';

const VisitDetails = {
    bindings: {
        vnb: '<'
    },
    templateUrl: template,
    controller: controller
};

controller.$inject = ['$q', '$translate', '$stateParams', 'logger', 'dataservice.visits', 'sessionService'];
function controller($q, $translate, $stateParams, logger, dataServiceVisits, session) {
    var ctrl = this;

    ctrl.$onInit = onInit;

    // --------------------------------------------------------------

    function onInit() {
        ctrl.vnb = $stateParams.vnb;

        //Check if user has access to physician list
        ctrl.hasAccess = true;

        // Populate our scope (as vm)
        $.extend(ctrl, {
            isComplete: false,
            isEmpty: false,
            isException: false,
            result: {}
        });

        _getVisit(ctrl.vnb);
    }
    // --------------------------------------------------------------

    function __getVisit(vnb) {
        return dataServiceVisits
            .getVisitById(vnb) // .getVisitInfoById(vnb)
            .then(function(visitInfo) {
                var result = {
                    visit: {
                        visitInfo: visitInfo
                    },
                    company: visitInfo.company // Have to remap so the directive works for single view too
                };
                _prepareVisitData(result);
            })
            .catch(function(exception) {
                if (exception.status === 404) {
                    ctrl.isEmpty = true;
                } else {
                    ctrl.isException = true;
                    $translate('error.ERROR').then(function(translation) {
                        logger.error(translation, exception);
                    })
                    .catch(function(error) {
                        console.error(error);
                    });
                }
            });
    }

    function __prepareVisitData(result) {
        // Initialize result objects
        if (result) {
            result.isExpanded = true;
            result.isLoadingDetails = false;
            result.isLoadingPhysicians = false;
            result.details = null;
            result.physicians = null;
            ctrl.result = result;
        }

        ctrl.isEmpty = !angular.isObject(ctrl.result);
    }


    function _getVisit(vnb) {

        return $q
            .all([
                _getVisitById(vnb),
                _getPhysicianList(vnb)
            ])
            .catch(function (exception) {
                if (exception.status === 404) {
                    ctrl.isEmpty = true;
                } else {
                    ctrl.isException = true;
                    $translate('error.ERROR').then(function (translation) {
                        logger.error(translation, exception);
                    })
                    .catch(function(error) {
                        console.error(error)
                    });
                }
            })
            .finally(function () {
                ctrl.isLoading = false;
            });
    }

    function _getVisitById(vnb) {
        return dataServiceVisits
            .getVisitById(vnb)
            .then(function (visitDetails) {
                ctrl.result.details = visitDetails;
            })
            .catch(function(error) {
                console.error(error);
                ctrl.result.physicians = [];
            });
    }


    function _getPhysicianList(vnb) {
        return (!_allowPhysicianList()) ?

            // Not allowed (nurse only role) => bye bye...
            $q.resolve([]) :

            // Get the physicians list
            dataServiceVisits
                .getPhysicianList(vnb)
                .then(function (physicians) {
                    ctrl.result.physicians = physicians;
                })
                .catch(function(error) {
                    console.error(error);
                    ctrl.result.physicians = [];
                });
    }

    // TODO (FK): Should be a user method
    function _allowPhysicianList() {
        var hasRoleNurse = session.user && session.user.hasRole(['nurse']);
        var hasRoleOtherThanNurse = session.user && session.user.hasRole(
            ['admin', 'administrative', 'chef', 'financial', 'physician', 'sysadmin']);

        //If user is just Nurse he will not have access to physicians list
        return (hasRoleNurse && !hasRoleOtherThanNurse) ? false : true;
    }
}

export default VisitDetails;
