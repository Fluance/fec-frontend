import angular from 'angular';
import pdfViewer from './components/pdfViewer.component';
import PdfViewerDialogService from './components/pdfViewerDialog.service';

angular
    .module('blocks.pdfViewer', [])
    .component('fecPdfViewer', pdfViewer)
    .factory('PdfViewerDialog', PdfViewerDialogService);
