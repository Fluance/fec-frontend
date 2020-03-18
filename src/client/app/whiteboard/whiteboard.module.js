import angular from 'angular';
import {dataServiceWhiteboard, run as runDataServiceWhiteboard} from "./data/whiteboard.dataservice";
import whiteboardService from "./whiteboard.service";
import runRoute from './whiteboard.route';
import whiteboardEditDialogService from "./whiteboardEditDialog.service";
import Whiteboard from "./components/whiteboard.component";
import PatientNavigationButtonWhiteboard from "./components/fecPatientNavigationButtonWhiteboard.component";
import roomConfigurationService from "./components/roomConfiguration/roomConfiguration.service";
import WhiteboardButton from "./components/whiteboardButton.component";
import WhiteboardDietTooltip from "./components/whiteboardDietTooltip.component";
import WhiteboardPhysiciansList from "./components/whiteboardPhysiciansList.component";
import WhiteboardPrintButton from "./components/whiteboardPrintButton.component";
import WhiteboardInlineNurseEdit from './components/whiteboardInlineNurseEdit.component';

angular
    .module('app.whiteboard', [])
    .run(runRoute)
    .run(runDataServiceWhiteboard)
    .factory('dataservice.whiteboard', dataServiceWhiteboard)
    .service('whiteboardService', whiteboardService)
    .service('whiteboardEditDialogService', whiteboardEditDialogService)
    .service('roomConfigurationService', roomConfigurationService)
    .component('fecPatientNavigationButtonWhiteboard', PatientNavigationButtonWhiteboard)
    .component('fecWhiteboard', Whiteboard)
    .component('fecWhiteboardButton', WhiteboardButton)
    .component('fecWhiteboardInlineNurseEdit', WhiteboardInlineNurseEdit)
    .component('fecWhiteboardDietTooltip', WhiteboardDietTooltip)
    .component('fecWhiteboardPhysiciansList', WhiteboardPhysiciansList)
    .component('fecWhiteboardPrintButton', WhiteboardPrintButton)



