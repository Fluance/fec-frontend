import angular from 'angular';
import chatBotService from './fecChatBot.service';
import charBotButtonComponent from './fecChatBotButton.component';
import charBotContainerComponent from './fecChatBotContainer.component';

angular
    .module('blocks.fecChatBot', [])
    .factory('chatBotService', chatBotService)
    .component('fecChatBotButton',charBotButtonComponent)
    .component('fecChatBotContainer', charBotContainerComponent);
