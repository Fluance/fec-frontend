import angular from 'angular';
import meteoDataService from "./fecMeteoData.service";
import meteoData from './fecMeteoData.component';
import meteDataDialogService from './fecMeteoDataDialog.service';

angular
    .module('blocks.fecMeteoData', [])
    .factory('meteoDataService', meteoDataService)
    .component('fecMeteoData', meteoData)
    .factory('meteoDataDialogService', meteDataDialogService);
