import angular from 'angular';
import runRoute from './servicefee.route';
import ServiceFeeController from "./servicefee.controller";
import ServiceFeeListController from "./servicefeeList.controller";
import ServicefeeDetailService from "./servicefeeDetail/servicefeeDetailDialog";
import fluanceServiceFee from "./components/fluanceServiceFee.component";
import NavButtonBenefitList from "./components/navButtonServicefeeList.component";
import serviceFeeList from "./components/serviceFeeList.component";
import Servicefees from "./components/serviceFees.component";

angular
    .module('app.servicefee', [])
    .run(runRoute)
    .controller('ServiceFeeController', ServiceFeeController)
    .controller('ServiceFeeListController', ServiceFeeListController)
    .factory('servicefeeDetail', ServicefeeDetailService)
    .component('fluanceServiceFee', fluanceServiceFee)
    .component('fecNavButtonBenefitList', NavButtonBenefitList)
    .component('serviceFeeList', serviceFeeList)
    .component('fecServicefees', Servicefees)


