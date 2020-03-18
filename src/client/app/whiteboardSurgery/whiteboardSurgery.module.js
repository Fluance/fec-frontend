import angular from 'angular';
import runRoute from './whiteboardSurgery.route';
import DataServiceWhiteboardSurgery from "./data/whiteboardSurgery.dataservice";
import WhiteboardSurgery from "./components/whiteboardSurgery.component";
import WhiteboardSurgeryRoom from "./components/whiteboardSurgeryRoom.component";
import WhiteboardSurgeryRoomList from "./components/whiteboardSurgeryRoomList.component";
import WhiteboardSurgeryRoomListItem from "./components/whiteboardSurgeryRoomListItem.component";
import WhiteboardSurgeryAppointmentList from "./components/whiteboardSurgeryAppointmentList.component";
import WhiteboardSurgeryReservationList from "./components/whiteboardSurgeryReservationList.component";
import WhiteboardSurgeryPersonnelOccupationIcon from "./components/whiteboardSurgeryPersonnelOccupationIcon.component";
import WhiteboardSurgeryTimeline from "./components/whiteboardSurgeryTimeline.component";
import WhiteboardSurgeryToolbar from "./components/whiteboardSurgeryToolbar.component";
import WhiteboardSurgeryCalendar from "./components/whiteboardSurgeryCalendar.component";
import PatientNavigationButtonWhiteboardSurgery from "./components/fecPatientNavigationButtonWhiteboardSurgery.component";
import WhiteboardSurgeryService from './whiteboardSurgery.service';
import { WhiteboardSurgeryEditNote, config as WhiteboardSurgeryEditNoteConfig } from './components/whiteboardSurgeryEditNote.component';
import whiteboardSurgeryEditCommentDialogService from './whiteboardSurgeryEditCommentDialog.service';
import whiteboardSurgeryRoomReservationDialogService from './whiteboardSurgeryRoomReservationDialog.service';
import { RoomReservationDataService, run as runRoomReservationDataService } from './data/roomReservation.dataservice';

angular
    .module('app.whiteboardSurgery', ['ngQuill'])
    .config(WhiteboardSurgeryEditNoteConfig)
    .run(runRoute)
    .run(runRoomReservationDataService)
    .factory('dataservice.whiteboardSurgery', DataServiceWhiteboardSurgery)
    .service('whiteboardSurgeryService', WhiteboardSurgeryService)
    .service('whiteboardSurgeryEditCommentDialogService', whiteboardSurgeryEditCommentDialogService)
    .service('whiteboardSurgeryRoomReservationDialogService', whiteboardSurgeryRoomReservationDialogService)
    .service('dataservice.whiteboardSurgeryRoomReservation',RoomReservationDataService)
    .component('fecWhiteboardSurgery', WhiteboardSurgery)
    .component('fecWhiteboardSurgeryEditNote', WhiteboardSurgeryEditNote)
    .component('fecWhiteboardSurgeryRoom', WhiteboardSurgeryRoom)
    .component('fecWhiteboardSurgeryRoomList', WhiteboardSurgeryRoomList)
    .component('fecWhiteboardSurgeryRoomListItem', WhiteboardSurgeryRoomListItem)
    .component('fecWhiteboardSurgeryAppointmentList', WhiteboardSurgeryAppointmentList)
    .component('fecWhiteboardSurgeryReservationList', WhiteboardSurgeryReservationList)
    .component('fecWhiteboardSurgeryTimeline', WhiteboardSurgeryTimeline)
    .component('fecWhiteboardSurgeryToolbar', WhiteboardSurgeryToolbar)
    .component('fecWhiteboardSurgeryCalendar', WhiteboardSurgeryCalendar)
    .component('fecPatientNavigationButtonWhiteboardSurgery', PatientNavigationButtonWhiteboardSurgery)
    .component('fecWhiteboardSurgeryPersonnelOccupationIcon', WhiteboardSurgeryPersonnelOccupationIcon);
