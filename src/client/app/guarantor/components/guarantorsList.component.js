import template from './guarantorsList.component.html';

const GuarantorsList = {
    bindings: {
        vnb: '<',
        showTitle: '<?'
    },
    controller: GuarantorListController,
    templateUrl: template
};

GuarantorListController.$inject = [
    '$scope',
    '$translate',
    'dataservice.visits',
    'invoicesDialogService',
    'dataservice.invoices'
];

function GuarantorListController($scope,
    $translate,
    dataserviceVisits,
    invoicesDialogService,
    dataserviceInvoices
) {
    var ctrl = this;

    //-----------------------Constants parameters
    ctrl.selectedColumn = {'name': '', 'sortDesc': true};

    ctrl.columns = [
        {
            'text': 'guarantor.GUA_CODE',
            'name': 'guarantor_id',
            'canSort': true,
            'flex': '10',
            'align': 'start center'
        },
        {
            'text': 'core.NAME',
            'name': 'name',
            'canSort': true,
            'flex': '15',
            'align': 'start center'
        },
        {
            'text': 'guarantor.GUA_VALIDITY',
            'name': 'begindate',
            'canSort': true,
            'flex': '10',
            'align': 'start center'
        },
        {
            'text': 'guarantor.GUA_OCCASIONAL',
            'name': 'ocasional',
            'canSort': false,
            'flex': '15',
            'align': 'center center'
        },
        {
            'text': 'guarantor.GUA_COMPLEMENT',
            'name': 'complement',
            'canSort': false,
            'flex': '20',
            'align': 'start center'
        },
        {
            'text': 'core.ADDRESS',
            'name': 'address',
            'canSort': false,
            'flex': '20',
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
    ctrl.sortBy = sortBy;
    ctrl.openInvoices = openInvoices;
    ctrl.hasInvoices = hasInvoices;

    // ------------------------------------------------------------------------ Lifecycle-hooks
    function onInit() {
        ctrl.isLoading = true;

        ctrl.selectedColumn = {'name': '', 'sortDec': true};

        var params = {
            vnb: ctrl.vnb
        };

        dataserviceVisits
            .getGuarantorList(params)
            .then(function (result) {
                _.each(result.guarantors, function (guarantor) {
                    ctrl.hasInvoices(guarantor.guarantor_id).then(function (data) {
                        guarantor.hasInvoices = data;
                    });
                });
                ctrl.result = result;
            })
            .catch(function () {
                var result = {};
                result['guarantors'] = [];
                result['totalRecords'] = 0;

                ctrl.guarantors = result;
            })
            .finally(function () {
                ctrl.isLoading = false;
            });
    }

    // ------------------------------------------------------------------------ Public methods
    function openInvoices($event, guarantor) {
        invoicesDialogService.showInvoices($event, ctrl.vnb, guarantor.guarantor_id);
    }

    function hasInvoices(guarantorId) {
        return dataserviceInvoices.hasInvoiceData(ctrl.vnb, guarantorId);
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

export default GuarantorsList;
