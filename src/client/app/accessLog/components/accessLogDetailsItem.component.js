import template from './accessLogDetailsItem.component.html';

const AccessLogDetailsItem = {
    bindings: {
        pid: '<',
        item: '<',
        isScrolling: '='
    },
    controller: ['$filter', '$translate', 'dataservice.invoices', 'dataservice.pictures', controller],
    templateUrl: template
};

function controller($filter, $translate, dataserviceInvoice, dataservicePicture) {
    var ctrl = this;
    var isContentSet = false;

    ctrl.$onInit = onInit;
    ctrl.$onChanges = onChanges;
    ctrl.formatTimestamp = formatTimestamp;
    ctrl.accessType = accessType;
    ctrl.content = '';

    // -----------------------------------------

    function onInit() {
        ctrl.stateParams = {};
    }

    function onChanges(changesObj) {
        if (changesObj.item && changesObj.item.isFirstChange()) {
            return;
        }

        if (changesObj.item && changesObj.item.currentValue) {
            buildStateParams();

            if (!isContentSet && ctrl.item) {
                //Fill the content to be bind
                ctrl.content = $translate.instant('accessLog.LOG_MESSAGE_LIST_LINK', {
                    'LOG_DATE': ctrl.formatTimestamp(ctrl.item.logDate),
                    'ACCESS_TYPE': ctrl.accessType(ctrl.item.httpMethod)
                });
                ctrl.content = $filter('processLinks')(ctrl.content, { 'LINK': ctrl.item.objectType });
                isContentSet = true;
            }
        }
    }

    // ------------------------------------------------------------------------------------------
    // Getters used by the view to set the values of the placeholders and links in translations
    // ------------------------------------------------------------------------------------------
    function formatTimestamp(logDate) {
        return logDate ? $filter('formatDate')(logDate, 'dateTime') : '';
    }

    function accessType(httpMethod) {
        return httpMethod ? $translate.instant('accessLog.accessType.' + httpMethod) : '';
    }

    function buildStateParams() {
        ctrl.stateParams = {
            pid: _patientId(),
            vnb: _visitNumber()
        };

        var objectType = ctrl.item.objectType;

        if (objectType === 'appointment') {
            ctrl.stateParams.aid = ctrl.item.objectId;
        }
        else if (objectType === 'guarantor') {
            ctrl.stateParams.gid = ctrl.item.objectId;
        }

        else if (objectType === 'invoice') {
            ctrl.stateParams.invoiceid = ctrl.item.objectId;
            dataserviceInvoice.getInvoice(ctrl.stateParams.invoiceid)
                .then(function (invoice) {
                    ctrl.stateParams.guarantorid = invoice.guarantorId;
                });
        }

        else if (objectType === 'invoiceListByGuarantor') {
            ctrl.stateParams.guarantorid = ctrl.item.objectId;
        }

        else if (objectType === 'note') {
            ctrl.stateParams.noteId = ctrl.item.objectId;
        }

        else if (objectType === 'picture') {
            ctrl.stateParams.pictureId = ctrl.item.objectId;
            dataservicePicture.getPictureDetail(ctrl.stateParams.pictureId)
                .then(function (picture) {
                    ctrl.stateParams.noteId = picture.noteId;
                });
        }

        else if (objectType === 'pictureList') {
            ctrl.stateParams.noteId = ctrl.item.objectId;
        }

        else if (objectType === 'policy') {
            var ids = ctrl.item.objectId.split('/');
            ctrl.stateParams.gid = ids[0];
            ctrl.stateParams.priority = ids[1];
            ctrl.stateParams.subpriority = ids[2];
        }
    }

    /**
     * Returns the patiend id for the current log entry item.
     * @private
     * @returns pid the patient id
     */
    function _patientId() {
        var pid;

        pid = ctrl.item.parentPid ? ctrl.item.parentPid : ctrl.pid;
        return pid;
    }

    /**
     * Returns the visit number for the current log entry item.
     * @private
     * @returns vnb the visit number
     */
    function _visitNumber() {
        var vnb;

        vnb = ctrl.item.parentVisitNb ? ctrl.item.parentVisitNb : ctrl.item.objectType == "visit" && ctrl.item.objectId ? ctrl.item.objectId : null;
        return vnb;
    }
}

/**
 * Filter to replace [Links] in the translation string with HTML code
 * @returns {Function}
 * @constructor
 */
function ProcessLinksFilter() {
    return function (input, params) {
        var keys = Object.keys(params);
        var processedInput = input;

        // replace all link place holders in 'input'
        keys.forEach(function (key) {
            processedInput = processedInput.replace('[' + key + ']', buildLink(params[key]));
        });
        return processedInput;
    };

    function buildLink(linkType) {
        return '<fec-access-log-link item="$ctrl.item" state-params="$ctrl.stateParams" link-type="' + linkType + '"></fec-access-log-link>';
    }
}


export {
    AccessLogDetailsItem,
    ProcessLinksFilter
}
