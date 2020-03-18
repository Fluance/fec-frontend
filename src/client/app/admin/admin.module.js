import angular from 'angular';
import { dataServiceDataProviders, run as runDataServiceDataProviders } from './data/dataproviders.dataservice';
import { dataServiceDomain, run as runDataServiceDomain } from './data/domain.dataservice';
import { dataServiceRoles, run as runDataServiceRoles } from './data/roles.dataservice';
import runRoute from './admin.route';
import AdminController from "./admin.controller";
import AdminConfigurationController from "./configuration.controller";
import AdminProfileFormController from "./users/profile.form.controller";
import AdminUsersController from "./users/users.controller";
import AdminUsersProfileController from "./users/usersProfile.controller";
import AdminLogsController from "./logs.controller";
import ProfileCompaniesInput from "./users/components/profile.form.companies.component";
import ProfileService from "./users/components/profile.form.service.component";
import ProfileStaffid from "./users/components/profile.form.staffid.component";
import ProfileUnit from "./users/components/profile.form.unit.component";

angular
    .module('app.admin', [])
    .run(runRoute)
    .run(runDataServiceDataProviders)
    .run(runDataServiceDomain)
    .run(runDataServiceRoles)
    .factory('dataservice.dataProviders', dataServiceDataProviders)
    .factory('dataservice.domain', dataServiceDomain)
    .factory('dataservice.roles', dataServiceRoles)
    .controller('AdminController', AdminController)
    .controller('AdminConfigurationController', AdminConfigurationController)
    .controller('AdminLogsController', AdminLogsController)
    .controller('AdminProfileFormController', AdminProfileFormController)
    .controller('AdminUsersController', AdminUsersController)
    .controller('AdminUsersProfileController', AdminUsersProfileController)
    .component('profileCompaniesInput', ProfileCompaniesInput)
    .component('profileService', ProfileService)
    .component('profileStaffid', ProfileStaffid)
    .component('profileUnit', ProfileUnit)



