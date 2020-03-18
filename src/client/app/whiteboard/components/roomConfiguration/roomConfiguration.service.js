import angular from 'angular';
import _ from 'lodash';
import template from './roomConfiguration.tmpl.html';

/* @ngInject */
roomConfigurationService.$inject = ['$mdDialog', 'dataservice.whiteboard', 'userAgentService', 'sessionService', 'config'];

function roomConfigurationService($mdDialog, whiteboardDataservice, userAgentService, session, config) {

    var service = {
        edit: edit,
        update: update,
        getRoomConfiguration: getRoomConfiguration,
        isdAvailable: isdAvailable
    };

    return service;

    // ---------------------------------------------------------------

    function edit(companyId, hospService) {
        return $mdDialog.show({
            templateUrl: template,
            controller: ['sessionService', Controller],
            controllerAs: '$ctrl',
            locals: {
                serviceDescription: hospService.codeDesc
            },
            bindToController: true,
            fullscreen: true
        }).then(function (editedConfiguration) {
            // action: cancel, save
            return editedConfiguration;
        }).catch(function () {
            // click outside
            return null
        });

        function Controller(session) {
            var ctrl = this;

            var SCROLL_ELEMENT_SELECTOR = '.table-wrap';
            var HEADER_HEIGHT = 40;
            var LISTED_ELEMENT_HEIGHT = 80;

            var OS_MACOS = 'macos';
            var OS_IOS = 'ios';

            // events
            ctrl.$onInit = onInit;

            // API
            ctrl.closeDialog = closeDialog;
            ctrl.save = save;
            ctrl.hasScroll = hasScroll;
            ctrl.hasScroll = hasScroll;
            ctrl.isReadOnlyUser = false;

            // ---------------------------------------------------------- Events

            function onInit() {
                getRoomConfiguration(companyId, hospService.code)
                    .then(function(roomConfiguration) {
                        ctrl.roomConfiguration = roomConfiguration;
                    });

                _getAllRoomTypes(companyId, hospService.code)
                    .then(function(roomTypes) {
                        // Set language selection to current UI language
                        var selectedLanguage = session.getUILanguage();

                        // Filter room types according to selected language
                        ctrl.roomTypes = _.filter(roomTypes, function(roomType) {
                            return roomType.lang.toLowerCase() === selectedLanguage.toLowerCase();
                        });
                    });

                //Set readonly mode
                if ( !_.isNil(config.accessControl.navigationComponents.whiteboardRoomConfigurationDialog) &&
                    !_.isNil(config.accessControl.navigationComponents.whiteboardRoomConfigurationDialog.readOnlyRoles) &&
                    session.user.hasRole(config.accessControl.navigationComponents.whiteboardRoomConfigurationDialog.readOnlyRoles) ) {
                    ctrl.isReadOnlyUser = true;
                }
            }

            // ---------------------------------------------------------- API methods

            function closeDialog() {
                $mdDialog.hide();
            }

            function save() {
                if(!ctrl.isReadOnlyUser) {
                    $mdDialog.hide(ctrl.roomConfiguration);
                }
            }

            function hasScroll() {

                if (userAgentService.isSafari() || userAgentService.getOS() === OS_MACOS || userAgentService.getOS() === OS_IOS) {
                    return false;
                } else {
                    //Get element with scroll
                    var element = angular.element(document.querySelector(SCROLL_ELEMENT_SELECTOR));
                    //Get height of the element
                    var height = element[0].offsetHeight;

                    height = height - HEADER_HEIGHT;

                    height = height / LISTED_ELEMENT_HEIGHT;

                    //Get absolute value equals max number of elements before scroll
                    height = Math.floor(height);

                    return (ctrl.roomConfiguration && ctrl.roomConfiguration.length > height);
                }
            }

            // ---------------------------------------------------------- Helper methods

            function _getAllRoomTypes(companyId, serviceCode) {
                return whiteboardDataservice.getAllRoomTypes({companyId: companyId, serviceCode: serviceCode});
            }

        }
    }

    function update(companyId, serviceCode, roomConfiguration) {
        return whiteboardDataservice.updateRoomConfiguration({companyId: companyId, serviceCode: serviceCode}, roomConfiguration);
    }

    function getRoomConfiguration(companyId, serviceCode) {
        return whiteboardDataservice.getRoomConfiguration({companyId: companyId, serviceCode: serviceCode});
    }

    function isdAvailable(companyId, serviceCode) {
        return whiteboardDataservice.isRoomConfigurationAvailable({companyId: companyId, serviceCode: serviceCode});
    }
}

export default roomConfigurationService;
