import angular from 'angular';
import runRoute from './layout.route';
import layoutService from './layout.service';
import ShellController from './shell.controller';
import SidebarController from './sidebar.controller';
import PatientNavigation from './patientNavigation/components/patientNavigation.component';
import PatientNavigationButton from "./patientNavigation/components/patientNavigationButton.component";
import PatientNavigationController from './patientNavigation/patientNavigation.controller';
import patientNavigationService from './patientNavigation/patientNavigation.service';
import CompanySelectionController from './components/companySelection.dialog';
import Layout from "./components/layout.component";
import SidenavMenu from './components/sidenav.menu.component';

angular
    .module('app.layout', ['duScroll'])
    .run(runRoute)
    .service('layoutService', layoutService)
    .controller('ShellController', ShellController)
    .controller('SidebarController', SidebarController)
    .component('fecPatientNavigation', PatientNavigation)
    .component('fecPatientNavigationButton', PatientNavigationButton)
    .controller('PatientNavigationController', PatientNavigationController)
    .service('patientNavigationService', patientNavigationService)
    .controller('CompanySelectionController', CompanySelectionController)
    .component('fecLayout', Layout)
    .component('fecSidenavMenu', SidenavMenu);

