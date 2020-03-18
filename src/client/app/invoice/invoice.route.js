// jscs:disable requireParenthesesAroundIIFE

import templateInvoiceList from './invoices.html';
import templateInvoice from './invoice.html';

run.$inject = ['routerService'];

/* @ngInject */
function run(routerService) {
    routerService.configureStates(getStates());
}

function getStates() {
    return [
        {
            state: 'invoiceListByGuarantor',
            config: {
                parent: 'layoutPatient',
                url: '/visits/:vnb/guarantors/:guarantorid/invoices',
                templateUrl: templateInvoiceList,
                controller: 'InvoicesController',
                controllerAs: 'vm',
                titleI18n: 'invoice.TITLE_LIST',
                requiredTranslationParts: ['invoice', 'patient']
            }
        },
        {
            state: 'invoiceListByVisit',
            config: {
                parent: 'layoutPatient',
                url: '/visits/:vnb/invoices',
                templateUrl: templateInvoiceList,
                controller: 'InvoicesController',
                controllerAs: 'vm',
                titleI18n: 'invoice.TITLE_LIST',
                requiredTranslationParts: ['invoice', 'patient']
            }
        },
        {
            state: 'invoice',
            config: {
                parent: 'layoutPatient',
                url: '/visits/:vnb/guarantors/:guarantorid/invoices/:invoiceid',
                templateUrl: templateInvoice,
                controller: 'InvoiceController',
                controllerAs: 'vm',
                titleI18n: 'invoice.TITLE',
                requiredTranslationParts: ['invoice', 'patient']
            }
        }
    ];
}

export default run;
