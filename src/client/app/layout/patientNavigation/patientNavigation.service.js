/**
 * @ngdoc service
 * @module app.layout
 * @name PatientNavigationContextBox
 * @description
 *
 * Use this factory to display a context box instead of using a navigation bar

 PatientContextController.$inject = ['PatientNavigationContextBox', '$scope'];
 function PatientContextController(ContextBox, $scope) {
            var vm = this;
              $scope.context = ContextBox;
        }
 ...
 *
 */

/* @ngInject */
patientNavigationService.$inject = ['$q', '$transitions', '$translate', 'dataservice.patients', 'dataservice.visits', 'dataservice.appointments', 'dataservice.notes', 'fluanceTranslatePartialLoader', 'fecNavigationContextService'];

function patientNavigationService($q, $transitions, $translate, patientDataService, visitDataService, appointmentDataService, noteService, fluanceTranslatePartialLoader, fecNavigationContextService) {

    var context; // patient context
    var _originState; // origin state (from where came the user to the patient context)
    var _originParams; // origin params (params to be passed from origin to target)

    var navigationComponents = [
        {
            name: 'fecPatientNavigationButtonSearch',
            allowedOrigins: ['search']
        },
        {
            name: 'fecPatientNavigationButtonWhiteboard',
            requiredTranslationParts: ['whiteboard'],
            allowedOrigins: ['whiteboard']
        },
        {
            name: 'fecPatientNavigationButtonWhiteboardSurgery',
            requiredTranslationParts: ['whiteboardSurgery'],
            allowedOrigins: ['whiteboardSurgery', 'whiteboardSurgeryRoom']
        },
        {
            name: 'fecPatientNavigationButtonVisit',
            requiredTranslationParts: ['visit']
        },
        {
            name: 'fecPatientNavigationButtonImaging',
            requiredTranslationParts: ['imaging']
        },
        {
            name: 'fecPatientNavigationButtonLab',
            requiredTranslationParts: ['lab']
        },
        {
            name: 'fecPatientNavigationButtonPrescription',
            requiredTranslationParts: ['prescription', 'medlab']
        },
        {
            name: 'fecPatientNavigationButtonAppointment',
            requiredTranslationParts: ['appointment']
        },
        {
            name: 'fecPatientNavigationButtonReporting',
            requiredTranslationParts: ['reporting']
        },
        {
            name: 'fecPatientNavigationButtonNotes',
            requiredTranslationParts: ['notes']
        },
        {
            name: 'fecPatientNavigationButtonDocument',
            requiredTranslationParts: ['document']
        },
        {
            name: 'fecPatientNavigationButtonAccessLog',
            requiredTranslationParts: ['accessLog']
        }

    ];

    _loadTranslationParts();

    var service = {
        getNavigationComponents: getNavigationComponents,
        validatePatientExists: validatePatientExists,
        getOriginState: getOriginState,
        setOriginState: setOriginState,
        getOriginParams: getOriginParams,
        setOriginParams: setOriginParams,
    };

    return service;

    // ---------------------------------------------------------------------------- Initialization methods

    function _loadTranslationParts() {
        _.each(navigationComponents, function (component) {
            _.each(component.requiredTranslationParts, function (translationPart) {
                fluanceTranslatePartialLoader.addPart(translationPart);
            });
        });
        $translate.refresh();
    }

    // ---------------------------------------------------------------------------- Interface methods

    function getNavigationComponents() {
        return navigationComponents;
    }

    /**
     * Validate if patient exists using structure of deep links (parameters) to load related patient objects.
     * It works like a cascade, loading the related objects from the bottom to top.
     * @param relatedPatientIds object with related id's with patient to validate (eg: patientId, visitId, appointmentId)
     */
    function validatePatientExists(relatedPatientIds) {
        var patientId = relatedPatientIds.patientId;
        var visitId = relatedPatientIds.visitId;
        var appointmentId = relatedPatientIds.appointmentId;
        var noteId = relatedPatientIds.noteId;

        if(!patientId && !visitId && !appointmentId && !noteId) {
            return $q.resolve();
        }

        // reset context
        context = {
            patient: null,
            visit: null,
            appointment: null,
            note: null
        };

        // It works like a cascade, loading the related objects from the bottom to top.
        return $q.resolve()
            .then(function() {
                return _loadNote(noteId);
            })
            .then(function() {
                return _loadAppointment(appointmentId);
            })
            .then(function() {
                return _loadVisit(visitId);
            })
            .then(function() {
                return _loadPatient(patientId);
            });
        /*
            .finally(function() {
                if(context.patient) {
                    return $q.resolve();
                }
                else {
                    return $q.reject();
                }
            });
            */
    }

    function getOriginState() {
        return _originState;
    }

    function setOriginState(originState) {
        _originState = originState;
    }

    function getOriginParams() {
        return _originParams;
    }

    function setOriginParams(originParams) {
        _originParams = originParams;
    }

    // ---------------------------------------------------------------------------- Helper methods

    /**
     * Try to load a note from the note id and place it in the context
     * @param noteId note id
     * @private
     */
    function _loadNote(noteId) {
        // reset note
        context.note = null;

        if (noteId) {
            // verify note exists
            return noteService.getNote(noteId)
                .then(function(note) {
                    context.note = note;
                })
                .catch(function() {
                    return $q.reject('note');
                });
        } else {
            return $q.resolve();
        }
    }

    /**
     * Try to load an appointment from the appointment id and place it in the context
     * @param aid appointment id
     * @private
     */
    function _loadAppointment(aid) {
        // reset appointment
        context.appointment = null;

        if(aid) {
            // verify appointment exists
            return appointmentDataService.getAppointmentDetails(aid)
                .then(function(appointment) {
                    context.appointment = appointment;
                })
                .catch(function() {
                    return $q.reject('appointment');
                });
        }
        else {
            return $q.resolve();
        }
    }

    /**
     * Try to load a visit from appointment (in context) or with visit id and place it in the context
     * @param vnb visit id
     * @private
     */
    function _loadVisit(vnb) {
        var visitId;

        // reset visit
        context.visit = null;

        // if there is a note with a visit number, get visit id from it
        if(context.note && context.note.visitNb !== null) {
            visitId = context.note.visitNb;
        }
        // if there is an appointment, get visit id from it
        else if(context.appointment && context.appointment.visit.visitNb) {
            visitId = context.appointment.visit.visitNb;
        }
        else {
            visitId = vnb;
        }

        if(visitId) {
            // verify visit exists
            return visitDataService.getVisitById(visitId)
                .then(function(visit) {
                    context.visit = visit;
                })
                .catch(function() {
                    return $q.reject('visit');
                })
        }
        else {
            return $q.resolve();
        }
    }

    /**
     * Try to load a patient from visit (in context) or with patient id and place it in the context
     * @param pid patient id
     * @private
     */
    function _loadPatient(pid) {
        var patientId;

        // reset patient
        context.patient = null;

        // if there is a note with a patient id, get patient id from it
        if(context.note && context.note.patientId !== null) {
            patientId = context.note.patientId;
        }
        // if there is a visit, get patient id from it
        else if(context.visit && context.visit.patientId) {
            patientId = context.visit.patientId;
        }
        else {
            patientId = pid;
        }

        if (patientId) {
            // verify patient exists
            return patientDataService.getPatientDetail(patientId)
                .then(function (patient) {
                    context.patient = patient;
                })
                .catch(function() {
                    return $q.reject('patient');
                })
        }
        // no patientId, patient doesn't exist
        else {
            return $q.resolve();
        }

    }

}

export default patientNavigationService;
