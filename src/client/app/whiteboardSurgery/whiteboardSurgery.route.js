// jscs:disable requireParenthesesAroundIIFE

run.$inject = ['routerService'];

/* @ngInject */
function run(routerService) {
    routerService.configureStates(getStates());
}

function getStates() {
    return [
        {
            state: 'whiteboardSurgery',
            config: {
                url: '/whiteboard-surgery?date',
                component: 'fecWhiteboardSurgery',
                titleI18n: 'whiteboardSurgery.TITLE',
                requiredTranslationParts: ['whiteboardSurgery'],
                accessControl: {
                    restrictToRoles: ['sysadmin', 'physician', 'nurse', 'trainee']
                },
                hideNavigation: true
            }
        },{
            state: 'whiteboardSurgeryNoteEdit',
            config: {
                url: '/whiteboard-surgery/edit-note?date',
                component: 'fecWhiteboardSurgeryEditNote',
                titleI18n: 'whiteboardSurgery.TITLE',
                requiredTranslationParts: ['whiteboardSurgery'],
                accessControl: {
                    restrictToRoles: ['sysadmin', 'physician', 'nurse', 'trainee']
                },
                hideNavigation: true
            }
        }, {
            state: 'whiteboardSurgeryRoom',
            config: {
                url: '/whiteboard-surgery/:roomName?date',
                component: 'fecWhiteboardSurgeryRoom',
                titleI18n: 'whiteboardSurgery.TITLE',
                requiredTranslationParts: ['whiteboardSurgery'],
                accessControl: {
                    restrictToRoles: ['sysadmin', 'physician', 'nurse', 'trainee']
                },
                hideNavigation: true
            }
        }, {
            state: 'whiteboardSurgeryAppointmentDetail',
            config: {
                url: '/whiteboard-surgery/:roomName/:appointmentId?date',
                component: 'fecWhiteboardSurgeryRoom',
                titleI18n: 'whiteboardSurgery.TITLE',
                requiredTranslationParts: ['whiteboardSurgery'],
                accessControl: {
                    restrictToRoles: ['sysadmin', 'physician', 'nurse', 'trainee']
                },
                hideNavigation: true
            }
        }
    ];
}

export default run;
