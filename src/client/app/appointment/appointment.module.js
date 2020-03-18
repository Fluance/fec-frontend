import angular from 'angular';
import { dataServiceAppointments, run as runDataServiceAppointments } from './data/appointments.dataservice';
import runRoute from './appointment.route';
import AppointmentController from "./appointment.controller";
import appointmentIdSelectionDialogService from "./appointmentIdSelectionDialog.service";
import AppointmentListController from "./appointmentList.controller";
import Appointment from "./components/appointment-details.component";
import PatientNavigationButtonAppointment from "./components/fecPatientNavigationButtonAppointment.component";
import fluanceAppointment from "./components/fluanceAppointment.component";
import NavButtonAppointmentList from "./components/navButtonAppointmentList.component";

angular
    .module('app.appointment', [])
    .run(runRoute)
    .run(runDataServiceAppointments)
    .factory('dataservice.appointments', dataServiceAppointments)
    .controller('AppointmentController', AppointmentController)
    .service('appointmentIdSelectionDialogService', appointmentIdSelectionDialogService)
    .controller('AppointmentListController', AppointmentListController)
    .component('fecAppointment', Appointment)
    .component('fecPatientNavigationButtonAppointment', PatientNavigationButtonAppointment)
    .component('fluanceAppointment', fluanceAppointment)
    .component('fecNavButtonAppointmentList', NavButtonAppointmentList)

