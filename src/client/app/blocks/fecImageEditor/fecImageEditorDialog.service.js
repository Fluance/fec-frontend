// jscs:disable requireParenthesesAroundIIFE
// Turn off jshint rules:
/*jshint -W101*/ //  Line too long
import template from './fecImageEditorDialog.tmpl.html';

fecImageEditorDialog.$inject = ['$mdDialog'];

function fecImageEditorDialog($mdDialog) {
    var service = {
        editImage: editImage
    };

    return service;

    function editImage(file, _callback, imageUISize) {
        $mdDialog.show({
            templateUrl: template,
            controller: ['$mdDialog', DialogController],
            controllerAs: '$ctrl',
            clickOutsideToClose: false,
            escapeToClose: false
        });

        function DialogController($mdDialog) {
            var ctrl = this;
            var rotation = 0;
            var img = null;
            var canvas = null;
            var hiddenCanvas = document.createElement('canvas');
            var dimensions = null;
            imageUISize = imageUISize > 0 ? imageUISize : 400;

            img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = function() {
                canvas = document.getElementById('canvas');
                dimensions = _calculateImageDimensions(img.width, img.height);

                if(canvas && canvas.getContext){
                    _rotateImage();
                }
            }

            ctrl.rotateLeft = function () {
                rotation--;
                _rotateImage();
            }

            ctrl.rotateRight = function () {
                rotation++;
                _rotateImage();
            }

            ctrl.save = function () {
                _callback(_dataURLtoFile(hiddenCanvas.toDataURL(file.type, 0.9), file));
                ctrl.close();
            };

            ctrl.close = function() {
                $mdDialog.hide();
            };

            function _rotateImage() {
                rotation = rotation > 3 ? rotation = 0 : (rotation < 0 ? rotation = 3 : rotation);
                var degree = rotation * 90;

                // Visible canvas
                var canvasContext = canvas.getContext('2d');
                var cw = dimensions.width;
                var ch = dimensions.height;
                var cx = 0;
                var cy = 0;
                var marginTop = imageUISize > dimensions.height ? ((imageUISize/2) - (dimensions.height/2)) : (imageUISize - dimensions.height) / 2;

                // Hidden canvas
                var hiddenCanvasContext = hiddenCanvas.getContext('2d');
                var hiddenCW = img.width;
                var hiddenCH = img.height;
                var hiddenCX = 0;
                var hiddenCY = 0;

                //   Calculate new canvas size and x/y coorditates for image
                switch(degree){
                    case 90:
                        // Visible canvas
                        cw = dimensions.height;
                        ch = dimensions.width;
                        cy = dimensions.height * (-1);

                        // Hidden canvas
                        hiddenCW = img.height;
                        hiddenCH = img.width;
                        hiddenCY = img.height * (-1);

                        marginTop = 0;
                        break;
                    case 180:
                        // Visible canvas
                        cx = dimensions.width * (-1);
                        cy = dimensions.height * (-1);

                        // Hidden canvas
                        hiddenCX = img.width * (-1);
                        hiddenCY = img.height * (-1)
                        break;
                    case 270:
                        // Visible canvas
                        cw = dimensions.height;
                        ch = dimensions.width;
                        cx = dimensions.width * (-1);

                        // Hidden canvas
                        hiddenCW = img.height;
                        hiddenCH = img.width;
                        hiddenCX = img.width * (-1);

                        marginTop = 0;
                        break;
                }

                //  Rotate image
                canvas.setAttribute('width', cw);
                canvas.setAttribute('height', ch);
                canvas.style = 'margin-top:' + marginTop + 'px';
                canvasContext.rotate(degree * Math.PI / 180);
                canvasContext.drawImage(img, cx, cy, dimensions.width, dimensions.height);

                //  Rotate hidden image
                hiddenCanvas.setAttribute('width', hiddenCW);
                hiddenCanvas.setAttribute('height', hiddenCH);
                hiddenCanvasContext.rotate(degree * Math.PI / 180);
                hiddenCanvasContext.drawImage(img, hiddenCX, hiddenCY, img.width, img.height);
            }

            function _calculateImageDimensions(width, height) {
                if (height > imageUISize || width > imageUISize) {
                    var factor = 1;
                    if (height > width) {
                        factor = imageUISize / height;
                        height = imageUISize;
                        width = width * factor;
                    } else {
                        factor = imageUISize / width;
                        width = imageUISize;
                        height = height * factor;
                    }
                } else {
                    imageUISize = height > width ? height : width;
                }

                ctrl.canvasContainerStyle = {
                    'height': imageUISize + 'px',
                    'width': imageUISize + 'px',
                    'text-align': 'center',
                };

                return {
                    'width': width,
                    'height': height
                };
            }

            // to change Blob to File
            function _blobToFile(theBlob, fileName) {
                const b = theBlob;
                b.lastModifiedDate = new Date();
                b.name = fileName;
                return b; // File
            }

            function _dataURLtoFile(dataurl, document) {
                var arr = dataurl.split(','),
                    bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
                while(n--){
                    u8arr[n] = bstr.charCodeAt(n);
                }

                let file;
                if (!navigator.msSaveBlob) { // detect if not Edge
                    file = new File([u8arr], document.name, {type:document.type});
                 } else {
                    // Edge
                    file = new Blob([u8arr], { type: document.type });
                    file = _blobToFile(file, document.name);
                 }
                return file;
            }
        }
    }
}

export default fecImageEditorDialog;
