
import template from './invoicesList.component.html';

const InvoicesList = {
    bindings: {
        vnb: '<',
        guarantorId: '<'
    },
    controller: FecInvoicesListController,
    templateUrl: template
};

FecInvoicesListController.$inject = [
    '$scope',
    '$q',
    '$translate',
    '$translatePartialLoader',
    'dataservice.invoices'
];

function FecInvoicesListController($scope, $q, $translate, $translatePartialLoader, dataServiceInvoices) {

    //Load translations for the screen
    $translatePartialLoader.addPart('invoice');
    $translate.refresh();

    var ctrl = this;

    ctrl.columns = [
        {name: 'id', translate: 'Nr', flex: '15', align: 'start ', order: null},
        {name: 'date', translate: 'invoice.INV_DATE', flex: '15', align: 'start ', order: null},
        {name: 'guarantorName', translate: 'invoice.GUA_NAME', flex: '30', align: 'start ', order: null},
        {name: 'guarantorCode', translate: 'invoice.GUA_CODE', flex: '15', align: 'start ', order: null},
        {name: 'totalAmount', translate: 'invoice.INV_TOTAL_PAID', flex: '15', align: 'end ', order: null},
        {name: 'balance', translate: 'invoice.BALANCE', flex: '10', align: 'end ', order: null}
    ];

    ctrl.total = null;

    ctrl.$onInit = onInit;

    ctrl.setOrder = setOrder;

    function onInit() {
        ctrl.isLoading = true;

        dataServiceInvoices.getInvoiceList(ctrl.vnb, ctrl.guarantorId).then(function (result) {
            var invoicesNoDetails = result;
            ctrl.invoices = [];

            ctrl.total = 0;

            var promises = [];

            _.forEach(invoicesNoDetails, function (invoiceNoDetails) {
                promises.push(
                    dataServiceInvoices
                        .getInvoice(invoiceNoDetails.id)
                        .then(function (invoice) {
                            //Set date as Date object
                            if (invoice.date && invoice.date !== null) {
                                invoice.date = new Date(invoice.date);
                            }
                            ctrl.invoices.push(invoice);
                            ctrl.total++;
                        })
                );
            });

            if (promises.length > 0) {
                $q.all(promises).finally(function () {
                    ctrl.isLoading = false;
                });
            } else {
                ctrl.total = 0;
                ctrl.isLoading = false;
            }

        }).catch(function () {
            ctrl.isLoading = false;
            ctrl.total = 0;
        })
    }

    function setOrder(column) {

        _.forEach(ctrl.columns, function (otherColumn) {
            if (otherColumn.name !== column.name) {
                otherColumn.order = null;
            }
        });

        if (column.order === null || column.order === 'asc') {
            column.order = 'desc';
        } else {
            column.order = 'asc';
        }

        ctrl.invoices = _.orderBy(ctrl.invoices, column.name, column.order);
    }

}

export default InvoicesList;
