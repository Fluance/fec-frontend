import template from './fecChatBotContainer.component.html';

const chatBotContainerComponent = {
    bindings: {},
    controller: controller,
    templateUrl: template
};

controller.$inject = [
    '$element',
    '$sce',
    '$rootScope',
    'dataservice.session',
    'sessionService',
    'waitForRendering',
    'chatBotService'
];

function controller($element, $sce, $rootScope, dataserviceSession, session, waitForRendering, chatBotService) {
    /*jshint validthis: true */
    var ctrl = this;
    var chatBotBaseUrl = '';
    ctrl.animation = false;
    ctrl.close = close;

    if (!chatBotService.isActive()) {
        $element.remove();
    } else {
        $rootScope.$on(chatBotService.EVENT_CHATBOT_OPENING_CHANGED, _onChatBotOpeningChanged);
        $rootScope.$on(chatBotService.EVENT_CHATBOT_ANIMATION_CHANGED, _onChatBotAnimationChanged);
        init();
    }

    // ----------------------------------------------

    function init() {
        chatBotBaseUrl = chatBotService.getChatBotUrl();
        ctrl.isOpened = chatBotService.getIsOpened();
        waitForRendering.wait(function() {
            _setChatBotUrl();
            _registerBotNotificationListener();
        });
        $rootScope.$on(session.EVENT_SELECTED_COMPANY_CHANGED, function() {
            _setChatBotUrl();
        });
        $rootScope.$on(session.EVENT_SELECTED_UNIT_CHANGED, function() {
            _setChatBotUrl();
        });
        $rootScope.$on('translationChanged', function() {
            _setChatBotUrl();
        });
    }

    // ---------------------------------------------- Interface methods

    function close() {
        chatBotService.toggleIsOpened();
    }

    // ---------------------------------------------- Private methods

    function _changeUrl(url) {
        document.location.href = url;
    }

    function _registerBotNotificationListener() {
        var eventMethod = window.addEventListener ? 'addEventListener' : 'attachEvent';
        var eventer = window[eventMethod];
        var messageEvent = eventMethod === 'attachEvent' ? 'onmessage' : 'message';

        eventer(messageEvent, function(e) {
            var action = e.data;

            if (action) {
                switch (action.type) {
                    case 'webclient.change.url':
                        _changeUrl(action.url);
                        break;
                }
            }
        }, false);
    }

    function _setChatBotUrl() {
        if (session && session.isAuthenticated()) {
            ctrl.isBotActivated = true;
            var companyId = session.user.companyId;
            var unitId = session.user.unitId;
            var currentCompany = _.find(session.user.companies, ['id', companyId]);
            var opale = currentCompany ? _.find(currentCompany.staffInfos, ['providerId', 1]) : null;
            var polypoint = currentCompany ? _.find(currentCompany.staffInfos, ['providerId', 2]) : null;
            var lang = session.getUILanguage();
            var accessToken = null;
            
            dataserviceSession.getAuthorizationToken()
            .then(function (authorizationToken) {
                accessToken = authorizationToken.accessToken;
            }).catch(function(error) {
                acessToken = null;
            }).finally(function () {
                var chatBotUrlParams = '?companyId=' + companyId;

                if (unitId) {
                    chatBotUrlParams += '&myunit=' + unitId;
                }
                if (opale) {
                    chatBotUrlParams += '&opale=' + opale.staffId;
                }
                if (polypoint) {
                    chatBotUrlParams += '&polypoint=' + polypoint.staffId;
                }
                if (accessToken) {
                    chatBotUrlParams += '&accessToken=' + accessToken;
                }
                if (lang) {
                    chatBotUrlParams += '&lang=' + lang;
                }

                ctrl.trustedChatBotUrl = $sce.trustAsResourceUrl(chatBotBaseUrl + chatBotUrlParams);
            });
        } else {
            ctrl.isBotActivated = false;
        }
    }

    function _onChatBotOpeningChanged(event, isOpened) {
        ctrl.isOpened = isOpened;
    }

    function _onChatBotAnimationChanged(event, animation) {
        ctrl.animation = animation;
    }
}


export default chatBotContainerComponent;
