// jscs:disable requireParenthesesAroundIIFE
import angular from 'angular';
import runRoute from './dashboard.route';
import DashboardController from './dashboard.controller';
import lastSearchController from './components/myLastSearch/myLastSearch.controller';
import myAppointmentController from './components/myAppointment/myAppointment.controller';
import myPatientController from './components/myPatient/myPatient.controller';
import MyPatientDoctorsAppActions from './components/myPatient/components/myPatientDoctorsAppActions.component';
import DashboardLetterName from './components/parts/dashboardLetterName.component';
import DashboardPatientInfo from './components/parts/dashboardPatientInfo.component';
import DashboardPatientListIndex from './components/parts/dashboardPatientListIndex.component';
import DashboardRoomNumber from './components/parts/dashboardRoomNumber.component';
import RoomListAmb from './components/roomList/amb/roomListAmb.component';
import RoomListAmbExt from './components/roomList/amb/roomListAmb.extended.component';
import RoomListHosp from './components/roomList/hosp/roomListHosp.component';
import RoomListHospExt from './components/roomList/hosp/roomListHosp.extended.component';
import myCockpitSinglePatient from "./shared/mycockpit.shared.directive";
import myCockpitSingleSearch from "./shared/mycockpit.singleSearchElement.directive";
import WhiteboardSurgeryCalendarDashboard from './components/whiteboardSurgeryCalendarDashboard/whiteboardSurgeryCalendarDashboard.component';
import roomListController from "./components/roomList/roomList.controller";

// cannot isolate, using variables from project
//import './components/myPatient/myPatient.scss';

angular
    .module('app.dashboard', ['dashboard', 'scrollto'])
    .run(runRoute)
    .controller('DashboardController', DashboardController)
    .controller('lastSearchController', lastSearchController)
    .controller('myAppointmentController', myAppointmentController)
    .controller('myPatientController', myPatientController)
    .controller('roomListController', roomListController)
    .component('fecMyPatientDoctorsAppActions', MyPatientDoctorsAppActions)
    .component('fecDashboardLetterName', DashboardLetterName)
    .component('fecDashboardPatientInfo', DashboardPatientInfo)
    .component('fecDashboardPatientListIndex', DashboardPatientListIndex)
    .component('fecDashboardRoomNumber', DashboardRoomNumber)
    .component('fecWhiteboardSurgeryCalendarDashboard', WhiteboardSurgeryCalendarDashboard)
    .component('fecRoomListAmb', RoomListAmb)
    .component('fecRoomListAmbExt', RoomListAmbExt)
    .component('fecRoomListHosp', RoomListHosp)
    .component('fecRoomListHospExt', RoomListHospExt)
    .directive('myCockpitSinglePatient', myCockpitSinglePatient)
    .directive('myCockpitSingleSearch', myCockpitSingleSearch);


