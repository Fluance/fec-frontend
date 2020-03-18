import angular from 'angular';
import LogoutDialogService from './logoutDialog.service';
import MultiSessionService from './multisession.service';
import logoutButton from './components/logoutButton.component';
import logoutDialog from './components/logoutDialog.component';
import { MultiSessionDataService, run as runMultiSessionDataService } from './data/multisession.dataservice';

angular
    .module('blocks.multisession', [])
    .run(runMultiSessionDataService)
    .factory('LogoutDialogService', LogoutDialogService)
    .factory('MultiSessionService', MultiSessionService)
    .component('logoutButton', logoutButton)
    .component('logoutDialog', logoutDialog)
    .factory('multisession.dataservice', MultiSessionDataService);
