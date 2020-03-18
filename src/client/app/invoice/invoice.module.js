import angular from 'angular';
import { dataServiceInvoices, run as runDataServiceInvoices } from './data/invoices.dataservice';
import runRoute from './invoice.route';
import InvoiceController from "./invoice.controller";
import InvoicesController from "./invoices.controller";
import fluanceInvoice from "./components/fluanceInvoice.component";
import InvoicesDialogService from "./components/invoicesDialog.service";
import InvoicesList from "./components/invoicesList.component";
import NavButtonInvoiceList from "./components/navButtonInvoiceList.component";

angular
    .module('app.invoice', [])
    .run(runRoute)
    .run(runDataServiceInvoices)
    .factory('dataservice.invoices', dataServiceInvoices)
    .controller('InvoiceController', InvoiceController)
    .controller('InvoicesController', InvoicesController)
    .component('fluanceInvoice', fluanceInvoice)
    .factory('invoicesDialogService', InvoicesDialogService)
    .component('fecInvoicesList', InvoicesList)
    .component('fecNavButtonInvoiceList', NavButtonInvoiceList)




