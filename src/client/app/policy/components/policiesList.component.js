import _ from 'lodash';
import template from './policiesList.component.html';

const PoliciesList = {
    bindings: {
        vnb: '<'
    },
    controller: PoliciesListController,
    templateUrl: template
};

PoliciesListController.$inject = [
    '$scope',
    '$translate',
    '$q',
    'dataservice.visits',
    'policyDetailDialogService'
];

function PoliciesListController($scope, $translate, $q, dataServiceVisits, policyDetailDialogService) {
    var ctrl = this;

    //-----------------------Constants parameters
    ctrl.selectedColumn = {'name': '', 'sortDesc': true};

    ctrl.columns = [
        {
            'text': 'policy.GUA_ASSURANCE_NAME',
            'name': 'name',
            'canSort': true,
            'flex': '30',
            'align': 'start center'
        },
        {
            'text': 'policy.GUA_CODE',
            'name': 'code',
            'canSort': false,
            'flex': '10',
            'align': 'start center'
        },
        {
            'text': 'policy.GUA_SUBPRIORITY',
            'name': 'subPriority',
            'canSort': false,
            'flex': '15',
            'align': 'center center'

        },
        {
            'text': 'policy.GUA_HOSPCLASS',
            'name': 'hospClass',
            'canSort': false,
            'flex': '10',
            'align': 'center center'
        },
        {
            'text': 'policy.GUA_STATUS',
            'name': 'inactive',
            'canSort': false,
            'flex': '10',
            'align': 'start center'
        },
        {
            'text': 'policy.GUA_ACCIDENT_DT',
            'name': 'accidentDate',
            'canSort': true,
            'flex': '15',
            'align': 'start center'
        },
        {
            'text': '',
            'name': '',
            'canSort': false,
            'flex': '10',
            'align': 'start center'
        }
    ];

    ctrl.$onInit = onInit;
    ctrl.showDetail = showDetail;
    ctrl.sortBy = sortBy;
    ctrl.openInvoices = openInvoices;

    // ------------------------------------------------------------------------ Lifecycle-hooks
    function onInit() {

        ctrl.isLoading = true;

        var params = {
            vnb: ctrl.vnb
        };

        dataServiceVisits
            .getPolicyList(params)
            .then(function (result) {

                ctrl.result = result;

                var promises = [];

                _.forEach(ctrl.result.policies, function (policy) {
                    promises.push(
                        dataServiceVisits
                            .getPolicy({
                                guarantorid: policy.guarantorId,
                                priority: policy.priority,
                                subpriority: policy.subPriority,
                                visitnb: ctrl.vnb
                            })
                            .then(function (detail) {
                                policy.hasDetails = ((detail.coverCardNb && detail.coverCardNb != 0) || detail.policyNb || detail.accidentNb);
                                policy['details'] = detail;
                            })
                    );
                });

                $q.all(promises).finally(function () {
                        ctrl.isLoading = false;
                    }
                );

            })
            .catch(function () {
                var result = {};
                result['policies'] = [];
                result['totalRecords'] = 0;

                ctrl.result = result;
            });
    }

    // ------------------------------------------------------------------------ Public methods
    function showDetail($event, policy) {
        policyDetailDialogService.showPolicyDetail($event, policy);
    }

    /* @deprecated? */
    function openInvoices($event, guarantor) {
        invoicesDialogService.showInvoices($event, ctrl.vnb, guarantor.guarantor_id);
    }

    function sortBy(colName) {
        if (colName === ctrl.selectedColumn.name) {
            ctrl.selectedColumn.sortDesc = !ctrl.selectedColumn.sortDesc;
        } else {
            ctrl.selectedColumn.name = colName;
            ctrl.selectedColumn.sortDesc = true;
        }
    }
}

export default PoliciesList;
