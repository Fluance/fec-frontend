import angular from 'angular';
import runRoute from './settings.route';
import ServiceDiscoveryController from './serviceDiscovery.controller';
import SettingsUserSettings from "./usersettings/settings-usersettings.component";
import UserController from './user/user.controller';
import SettingsProfile from './profile/settings-profile.component';
import SettingsClinics from './clinics/settings-clinics.component';

angular
    .module('app.settings', [])
    .run(runRoute)
    .controller('ServiceDiscoveryController', ServiceDiscoveryController)
    .component('fecSettingsUsersettings', SettingsUserSettings)
    .controller('UserController', UserController)
    .component('fecSettingsProfile', SettingsProfile)
    .component('fecSettingsClinics', SettingsClinics)



