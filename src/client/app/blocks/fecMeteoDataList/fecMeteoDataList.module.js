import angular from 'angular';
import meteoDataList from './fecMeteoDataList.component';

angular
    .module('blocks.fecMeteoDataList', [])
    .component('fecMeteoDataList', meteoDataList);
