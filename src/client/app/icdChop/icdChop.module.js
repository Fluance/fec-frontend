import angular from 'angular';
import runRoute from './icdChop.route';
import { dataServiceChop, run as runDataServiceChop } from './data/chop.dataservice';
import { dataServiceIcd, run as runDataServiceIcd } from './data/icd.dataservice';
import IcdChopController from "./icdChop.controller";
import Chop from "./components/fluanceChop.component";
import Icd from "./components/fluanceIcd.component";
import Icdchop from "./components/icdChop.component";
import NavButtonIcdChopList from "./components/navButtonIcdChopList.component";

angular
    .module('app.icdChop', [])
    .run(runRoute)
    .run(runDataServiceChop)
    .run(runDataServiceIcd)
    .factory('dataservice.chop', dataServiceChop)
    .factory('dataservice.icd', dataServiceIcd)
    .controller('IcdChopController', IcdChopController)
    .component('fecChop', Chop)
    .component('fecIcd', Icd)
    .component('fecIcdchop', Icdchop)
    .component('fecNavButtonIcdChopList', NavButtonIcdChopList)

