import angular from 'angular';
import dataServiceGuarantors from "./data/guarantors.dataservice";
import GuarantorController from "./guarantor.controller";
import runRoute from './guarantor.route';
import fluanceGuarantor from "./components/fluanceGuarantor.component";
import Guarantors from "./components/guarantors.component";
import GuarantorsList from "./components/guarantorsList.component";
import NavButtonGuarantorList from "./components/navButtonGuarantorList.component";

angular
    .module('app.guarantor', [])
    .run(runRoute)
    .factory('dataservice.guarantors', dataServiceGuarantors)
    .controller('GuarantorController', GuarantorController)
    .component('fluanceGuarantor', fluanceGuarantor)
    .component('fecGuarantors', Guarantors)
    .component('fecGuarantorsList', GuarantorsList)
    .component('fecNavButtonGuarantorList', NavButtonGuarantorList)


