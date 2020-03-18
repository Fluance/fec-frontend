import angular from 'angular';
import dataPagerService from "./dataPager";
import fecDataPagerSort from './components/dataPagingSort.component';

angular
    .module('blocks.dataPaging', [])
    .service('dataPager', dataPagerService)
    .component('fecDataPagerSort', fecDataPagerSort);
