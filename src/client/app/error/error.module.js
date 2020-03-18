import angular from 'angular';
import runRoute from './error.route';
import AccessErrorController from "./access.controller";
import CompanyErrorController from "./companyError.controller";
import ErrorController from "./error.controller";
import HttpWarnController from "./httpWarn.controller";
import PatientErrorController from "./patientError.controller";

angular
    .module('app.error', [])
    .run(runRoute)
    .controller('AccessErrorController', AccessErrorController)
    .controller('CompanyErrorController', CompanyErrorController)
    .controller('ErrorController', ErrorController)
    .controller('HttpWarnController', HttpWarnController)
    .controller('PatientErrorController', PatientErrorController)







