import template from './fecChatBotButton.component.html';

const chatBotButtonComponent = {
    bindings: {},
    controller: controller,
    templateUrl: template
};

controller.$inject = [
    '$element',
    '$rootScope',
    'chatBotService'
];

function controller($element, $rootScope, chatBotService) {
    /*jshint validthis: true */
    var ctrl = this;

    if (!chatBotService.isActive()) {
        $element.remove();
    } else {
        ctrl.isBotActivated = true;
        ctrl.isOpened = false;
        $rootScope.$on(chatBotService.EVENT_CHATBOT_OPENING_CHANGED, _onChatBotOpeningChanged);
    }

    ctrl.toggleOpening = toggleOpening;

    function toggleOpening() {
        chatBotService.toggleIsOpened();
    }

    function _onChatBotOpeningChanged(event, isOpened) {
        ctrl.isOpened = isOpened;
    }
}


export default chatBotButtonComponent;
