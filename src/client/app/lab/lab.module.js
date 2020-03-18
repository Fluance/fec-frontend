import angular from 'angular';
import runRoute from './lab.route';
import dataserviceLab from "./data/lab.dataservice";
import LabChart from "./components/fecLabChart.component";
import labChartDialogService from "./components/fecLabChartDialog.service";
import LabTable from "./components/fecLabTable.component";
import LabText from "./components/fecLabText.component";
import PatientNavigationButtonLab from "./components/fecPatientNavigationButtonLab.component";
import Lab from "./components/lab.component";
import NavButtonLab from "./components/navButtonLab.component";
import LabService from "./lab.service";

angular
    .module('app.lab', [])
    .run(runRoute)
    .service('LabService', LabService)
    .factory('dataservice.lab', dataserviceLab)
    .component('fecLabChart', LabChart)
    .factory('labChartDialogService', labChartDialogService)
    .component('fecLabTable', LabTable)
    .component('fecLabText', LabText)
    .component('fecPatientNavigationButtonLab', PatientNavigationButtonLab)
    .component('fecLab', Lab)
    .component('fecNavButtonLab', NavButtonLab)


