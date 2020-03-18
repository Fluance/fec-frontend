import angular from 'angular';
import runRoute from './policy.route';
import PoliciesController from "./policies.controller";
import PolicyController from "./policy.controller";
import fluancePolicy from "./components/fluancePolicy.component";
import NavButtonPolicyList from "./components/navButtonPolicyList.component";
import PoliciesList from "./components/policiesList.component";
import PolicyDetail from "./components/policyDetail.component";
import PolicyDetailDialogService from "./components/policyDetailDialog.service";

angular
    .module('app.policy', [])
    .run(runRoute)
    .controller('PoliciesController', PoliciesController)
    .controller('PolicyController', PolicyController)
    .component('fluancePolicy', fluancePolicy)
    .component('fecNavButtonPolicyList', NavButtonPolicyList)
    .component('fecPoliciesList', PoliciesList)
    .component('fecPolicyDetail', PolicyDetail)
    .factory('policyDetailDialogService', PolicyDetailDialogService)



