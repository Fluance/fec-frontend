import template from './pdfViewerDialog.html';

PdfViewerDialogService.$inject = ['$mdDialog', '$mdCompiler', '$document', '$http', '$sce'];

function PdfViewerDialogService($mdDialog, $mdCompiler, $document, $http, $sce) {
    var service;

    service = {
        show: show
    };

    return service;

    // -------------------------------------

    function show(getPdf, params, $event) {

        $mdDialog.show({
            parent: angular.element(document.body),
            targetEvent: $event,
            templateUrl: template,
            controller: [DialogController],
            controllerAs: '$ctrl',
            clickOutsideToClose: true,
            escapeToClose: true
        });


        function DialogController() {
            var ctrl = this;

            // Properties
            ctrl.isLoading = true;
            ctrl.pdfData = null;

            // Events
            ctrl.$onInit = onInit;
            ctrl.close = close;

            // ------------------------------------------------------------------------- Event handle

            function onInit() {
                getPdf(params)
                    .then(function (response) {
                        _prepareDataForJSViewer(response);

                        ctrl.pdfFilename = response.filename;
                        ctrl.isLoading = false;
                    })
                    .catch(function (error) {
                        ctrl.isLoading = false;
                        console.log('Error loading pdf document:', error);
                    });
            }

            // ------------------------------------------------------------------------- Interface methods

            function close() {
                $mdDialog.cancel();
            }

            // ------------------------------------------------------------------------- Helper methods

            /**
             * Prepare data for Browser native viewer
             * @param response
             * @private
             */
            function _prepareDataForNativeViewer(response) {
                var data_url = URL.createObjectURL(response.data);
                var trustedPdfUrl = $sce.trustAsResourceUrl(data_url);
                ctrl.pdfData = trustedPdfUrl;
            }

            /**
             * Prepare data for JS Viewer
             * @param response
             * @private
             */
            function _prepareDataForJSViewer(response) {
                // expects response.data to be an object (blob)
                var data_url = URL.createObjectURL(response.data);
                ctrl.pdfData = data_url;
            }
        }
    }
}


export default PdfViewerDialogService;
