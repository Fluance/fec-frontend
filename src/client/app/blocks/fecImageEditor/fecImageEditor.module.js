import angular from 'angular';
import fecImageEditorDialogService from './fecImageEditorDialog.service';

angular
    .module('blocks.fecImageEditor', [])
    .factory('fecImageEditorDialogService', fecImageEditorDialogService);
