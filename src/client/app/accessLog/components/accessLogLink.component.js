import _ from 'lodash';

const AccessLogLink = {
    template: '<a ng-click="vm.navigateTo(vm.state, vm.stateParams)" ng-if="vm.hasLink">{{::vm.linkText}}</a>' +
        '<span ng-if="!vm.hasLink">{{::vm.linkText}}</span>',
    bindings: {
        item: '<',
        linkType: '@',
        stateParams: '<'
    },
    controller: ['$state', '$translate', AccessLogLinkController],
    controllerAs: 'vm'
};

function AccessLogLinkController($state, $translate) {
    var vm = this;

    vm.$onInit = onInit;
    vm.$onChanges = onChanges;
    vm.navigateTo = _navigateTo;

    // ---------------------------------------------------------

    function onInit() {
    }

    function onChanges(changesObj) {
        if (changesObj.linkType && changesObj.linkType.currentValue) {
            vm.hasLink = _hasLink(vm.linkType);
            vm.state = _getState(vm.linkType);
        }
        if (changesObj.item && changesObj.item.currentValue) {
            vm.linkText = _objectLinkText(vm.linkType, vm.stateParams, vm.item);
        }
    }

    /**
     * Go to the state (deeplink)
     * @private
     * @param state state route to navigate to
     * @param stateParams parameters to the route
     */
    function _navigateTo(state, stateParams) {
        $state.go(state, stateParams);
    }

    function _getState(linkType) {
        switch (linkType) {
            case 'intervention': return 'visit';
            case 'note': return 'readNote';
            case 'noteList': return 'noteCategories';
            case 'picture': return 'readNote';
            case 'pictureList': return 'readNote';
            case 'patientfileslist': return 'patientDocuments';
            case 'visitList': return 'patient';
        }
        return linkType;
    }

    /**
     * Return false if this link type mustn't have link
     *
     * @param linkType
     * @returns {boolean}
     * @private
     */
    function _hasLink(linkType) {
        switch (linkType) {
            case 'Reporting': return false;
            case 'patientLogs': return false;
            case 'MedLab': return false;
            case 'patientfile': return false;
            case 'whiteboardEntry': return false;
            default: return true;
        }
    }

    /**
     * Return text to display on the link
     * @private
     * @param linkType the type of the object (page) to link to
     * @param stateParams parameters to the route
     * @param item the log entry item
     * @returns {string}
     */
    function _objectLinkText(linkType, stateParams, item) {
        var linkText;

        // by object types
        switch (linkType) {
            case 'appointment':
                linkText = $translate.instant('accessLog.LOG_MESSAGE_APPOINTMENT_LINK_TEXT');
                linkText += item.displayName ? ' (' + item.displayName + ')' : '';
                break;
            case 'appointmentList':
                linkText = $translate.instant('accessLog.LOG_MESSAGE_APPOINTMENT_LIST_LINK_TEXT');
                break;
            case 'guarantor':
                linkText = $translate.instant('accessLog.LOG_MESSAGE_GUARANTOR_LINK_TEXT');
                linkText += item.displayName ? ' (' + item.displayName + ')' : '';
                break;
            case 'guarantorList':
                linkText = $translate.instant('accessLog.LOG_MESSAGE_GUARANTOR_LIST_LINK_TEXT');
                break;
            case 'icdChopList':
                linkText = $translate.instant('accessLog.LOG_MESSAGE_ICD_CHOP_LIST_LINK_TEXT');
                break;
            case 'imagingList':
                linkText = $translate.instant('accessLog.LOG_MESSAGE_PATIENT_IMAGING_LINK_TEXT');
                break;
            case 'intervention':
                linkText = $translate.instant('accessLog.LOG_MESSAGE_INTERVENTION_LINK_TEXT');
                linkText += item.displayName ? ' (' + item.displayName + ')' : '';
                break;
            case 'invoice':
                linkText = $translate.instant('accessLog.LOG_MESSAGE_INVOICE_LINK_TEXT');
                linkText += item.displayName ? ' (' + item.displayName + ')' : '';
                break;
            case 'invoiceListByGuarantor':
                linkText = $translate.instant('accessLog.LOG_MESSAGE_INVOICE_LIST_LINK_TEXT');
                break;
            case 'labList':
                linkText = $translate.instant('accessLog.LOG_MESSAGE_PATIENT_LAB_LIST_LINK_TEXT');
                break;
            case 'note':
                linkText = $translate.instant('accessLog.LOG_MESSAGE_NOTE_LINK_TEXT');
                linkText += item.displayName ? ' (' + item.displayName + ')' : '';
                break;
            case 'noteList':
                linkText = $translate.instant('accessLog.LOG_MESSAGE_NOTE_LIST_TEXT');
                break;
            case 'Reporting':
                linkText = linkType;
                break;
            case 'patient':
                linkText = $translate.instant('accessLog.LOG_MESSAGE_PATIENT_LINK_TEXT');
                linkText += item.displayName ? ' (' + item.displayName + ')' : '';
                break;
            case 'patientLogs':
                linkText = $translate.instant('accessLog.LOG_MESSAGE_PATIENT_LOGS_LINK_TEXT');
                break;
            case 'picture':
                linkText = $translate.instant('accessLog.LOG_MESSAGE_NOTE_PICTURE_LINK_TEXT');
                linkText += item.displayName ? ' (' + item.displayName + ')' : '';
                break;
            case 'pictureList':
                linkText = $translate.instant('accessLog.LOG_MESSAGE_NOTE_PICTURE_LIST_TEXT');
                break;
            case 'policy':
                linkText = $translate.instant('accessLog.LOG_MESSAGE_INSURANCE_POLICY_LINK_TEXT');
                linkText += item.displayName ? ' (' + item.displayName + ')' : '';
                break;
            case 'policyList':
                linkText = $translate.instant('accessLog.LOG_MESSAGE_INSURANCE_POLICY_LIST_LINK_TEXT');
                break;
            case 'MedLab':
                linkText = linkType;
                break;
            case 'patientfile':
                linkText = $translate.instant('accessLog.LOG_MESSAGE_PDF_LINK_TEXT');
                linkText += item.displayName ? ' (' + item.displayName + ')' : '';
                break;
            case 'patientfileslist':
                linkText = $translate.instant('accessLog.LOG_MESSAGE_PDF_LIST_LINK_TEXT');
                break;
            case 'visit':
                linkText = $translate.instant('accessLog.LOG_MESSAGE_VISIT_LINK_TEXT');
                linkText += item.displayName ? ' (' + item.displayName + ')' : '';
                break;
            case 'visitList':
                linkText = $translate.instant('accessLog.LOG_MESSAGE_VISIT_LIST_LINK_TEXT');
                break;
            case 'whiteboardEntry':
                linkText = $translate.instant('accessLog.LOG_MESSAGE_WHITEBOARD_ENTRY_LINK_TEXT');
                linkText += item.parentVisitNb ? ' (' + item.parentVisitNb + ')' : '';
                break;
            default:
                linkText = (!_.isUndefined(item.displayName) && _.isString(item.displayName)) ? item.displayName : '(link)';
                break;
        }
        return linkText;
    }
}

export default AccessLogLink;
