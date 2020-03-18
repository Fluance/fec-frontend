import angular from 'angular';
import fecOperationNoteBox from './fecOperationNoteBox.component';
import WhiteboardSurgeryService from '../../whiteboardSurgery/data/whiteboardSurgery.dataservice';

angular
    .module('blocks.fecOperationNoteBox', [])
    .service('whiteboardSurgeryService', WhiteboardSurgeryService)
    .component('fecOperationNoteBox', fecOperationNoteBox);
