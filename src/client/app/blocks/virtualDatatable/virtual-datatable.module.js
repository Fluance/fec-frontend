import angular from 'angular';
import virtualDatatable from './components/virtual-datatable.component';
import virtualDatatableBody from './components/virtual-datatable-body.component';
import virtualDatatableFilter from './components/virtual-datatable-filter.component';
import virtualDatatableFooter from './components/virtual-datatable-footer.component';
import virtualDatatableHeader from './components/virtual-datatable-header.component';
import VirtualDatatableRowItem from './components/virtual-datatable-row-item.component';

angular
    .module('blocks.virtualDatatable', [])
    .component('fecVirtualDatatable', virtualDatatable)
    .component('fecVirtualDatatableBody', virtualDatatableBody)
    .component('fecVirtualDatatableFilter', virtualDatatableFilter)
    .component('fecVirtualDatatableFooter', virtualDatatableFooter)
    .component('fecVirtualDatatableHeader', virtualDatatableHeader)
    .directive('fecVirtualDatatableRowItem', VirtualDatatableRowItem);
