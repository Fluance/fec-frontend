import angular from 'angular';
import _ from 'lodash';
import template from './whiteboardEditDialog.tmpl.html';

/* @ngInject */
whiteboardEditDialogService.$inject = ['$q', '$mdDialog', '$filter', 'whiteboardService', 'patientService', 'Event'];

function whiteboardEditDialogService($q, $mdDialog, $filter, whiteboardService, patientService, Event) {

    var dirtyCheck = {};

    var DEFAULT_DIET_CATALOG = {
        companyCode: '',
        code: 'DEFAULT_DIET_CATALOG',
        lang: '',
        type: 'Diet',
        codeDesc: "-",
        category: null
    };

    // event for pending lock request(s)
    var onPendingLockAcquiredChanged = new Event();

    var service = {
        editItem: editItem,
        onPendingLockAcquiredChanged: onPendingLockAcquiredChanged
    };

    return service;

    function editItem(item) {
        var editItem;
        var parentEl = angular.element(document.body);

        // lock management
        var lockAcquired = false;
        var canceled = false;
        var waitingForLock = true;

        return $mdDialog.show({
            templateUrl: template,
            controller: ['$filter', '$mdDialog', 'sessionService', 'smDatePickerLocalizationService', 'config', DialogController],
            controllerAs: '$ctrl',
            locals: {
            },
            bindToController: true,
            clickOutsideToClose: true,
            escapeToClose: true
        }).then(function (editedItem) {
            // action: cancel, save
            return {
                editedItem: editedItem,
                lockAcquired: lockAcquired,
                pendingLockRequest: waitingForLock
            }
        }).catch(function () {
            // click outside
            canceled = true;
            return {
                lockAcquired: lockAcquired,
                pendingLockRequest: waitingForLock
            }
        });

        function DialogController($filter, $mdDialog, session, smDatePickerLocalizationService, config) {
            var ctrl = this;

            ctrl.waitingForLock = waitingForLock;

            // Isolation types
            ctrl.isolationTypes = whiteboardService.getIsolationTypes();

            // create a copy to edit on
            // editItem = angular.extend({}, item);
            editItem = angular.copy(item);

            ctrl.admitDate = $filter('formatDate')(editItem.admitDate, 'dd.MM.yyyy');

            // add "view" properties: show original or overwritten value on edit?
            editItem.vwOperationDate = editItem.editedOperationDate ? editItem.editedOperationDate : editItem.operationDate;
            editItem.vwDischargeDate = editItem.editedDischargeDate ? editItem.editedDischargeDate : editItem.dischargeDate;
            editItem.vwReason = editItem.editedReason ? editItem.editedReason : editItem.reason;

            editItem.vwReason = _.map(editItem.vwReason).join('\n');

            // keep original values for dirty checking
            dirtyCheck = angular.copy(editItem);

            ctrl.physicians = editItem.editedPhysician ? editItem.editedPhysician : editItem.physician;

            ctrl.editItem = editItem;

            ctrl.simulateQuery = false;
            ctrl.isDisabled = false;

            ctrl.selectedNurse = editItem.nurseName;

            ctrl.isReadOnlyUser = false;

            smDatePickerLocalizationService.setTranslation();

            loadNurses().then(function(nurses) {
                ctrl.nurses = nurses;
            });

            loadDietsCatalog().then(function () {
                ctrl.selectedDiets = _getDietsCatalogForDietsCodes(editItem.diet);
            });

            //Disable for the configured roles only if there are some configured
            if ( !_.isNil(config.accessControl.navigationComponents.whiteboardEditDialog) &&
                !_.isNil(config.accessControl.navigationComponents.whiteboardEditDialog.readOnlyRoles) &&
                session.user.hasRole(config.accessControl.navigationComponents.whiteboardEditDialog.readOnlyRoles) ) {
                ctrl.isReadOnlyUser = true;
                ctrl.isLocked = false;
                waitingForLock = false;
                ctrl.waitingForLock = waitingForLock;
            } else {
                // try to get lock before editing item...
                whiteboardService.lockWhiteboardItem(item.id)
                    .then(function () {
                        lockAcquired = true;

                        if(canceled) {
                            // raise message to subscriber(s) of a pending lock request that arrived after user canceled editing (eg: user clicked outside)
                            service.onPendingLockAcquiredChanged.raise();
                        }
                    })
                    .catch(function () {
                        lockAcquired = false;
                    })
                    .finally(function() {
                        // unlock a canceled lock request
                        if(waitingForLock && lockAcquired && canceled) {
                            whiteboardService.unlockWhiteboardItem(item.id);
                        }
                        else {
                            ctrl.isLocked = !lockAcquired;
                            waitingForLock = false;
                            ctrl.waitingForLock = waitingForLock;
                        }
                    });
            }

            ctrl.closeDialog = closeDialog;
            ctrl.save = save;
            ctrl.selectedItemChange = selectedItemChange;
            ctrl.querySearch = querySearch;
            ctrl.searchTextChange = searchTextChange;
            ctrl.getPatientNamePrefix = getPatientNamePrefix;
            ctrl.selectedDietContent = selectedDietContent;
            ctrl.getDefaultDietOption = getDefaultDietOption;
            ctrl.removeDefaultDietOption = removeDefaultDietOption;
            ctrl.isReadOnly = isReadOnly;
            // ----------------------------------------------------------------------------------

            /**
             * Search for states... use $timeout to simulate
             * remote dataservice call.
             */
            function querySearch(query) {
                var results = query ? ctrl.nurses.filter(createFilterFor(query)) : ctrl.nurses,
                    deferred;
                if (ctrl.simulateQuery) {
                    deferred = $q.defer();
                    $timeout(function () {
                        deferred.resolve(results);
                    }, Math.random() * 1000, false);
                    return deferred.promise;
                } else {
                    return results;
                }
            }

            /**
             * Build `states` list of key/value pairs
             */
            function loadNurses() {
                //var allNurses = 'Maria, Anna, Mary, Elena, Isabel';
                return whiteboardService.getNurses()
                    .then(function(nurses) {
                        return nurses.map(function (nurse) {
                            return {
                                value: nurse.toLowerCase(),
                                display: nurse
                            };
                        });
                    })
            }

            /**
             * Create filter function for a query string
             */
            function createFilterFor(query) {
                var lowercaseQuery = query.toLowerCase();

                return function filterFn(nurse) {
                    return (nurse.value.indexOf(lowercaseQuery) === 0);
                };
            }

            function searchTextChange(text) {
                ctrl.editItem.nurseName = text;
            }

            function selectedItemChange(item) {
                if (!_.isEmpty(item)) {
                    ctrl.editItem.nurseName = item.display;
                }
            }

            function getPatientNamePrefix(patientGender) {
                return whiteboardService.getPatientNamePrefix(patientGender);
            }

            function editPhysicians() {
                var initialPhysicians = ctrl.physicians;
                whiteboardEditPhysiciansDialogService.editPhysicians(ctrl.physicians).then(function (modifiedPhysicians) {
                    // Check if the edited physicians array is different from the initial one
                    if (!initialPhysicians || initialPhysicians.length !== modifiedPhysicians.length || _.difference(initialPhysicians, modifiedPhysicians).length !== 0) {
                        ctrl.physicians = modifiedPhysicians;
                    }
                }).catch(function () {
                    // Nothing to do but we need the catch, otherwise it triggers an automatic error
                });
            }

            //Methods for diet
            function loadDietsCatalog() {
                return whiteboardService.getDietCatalog({
                    companyId: item.companyId,
                    hospService: item.hospService.code,
                    lang: whiteboardService.getLangFromUILanguage(session.getUILanguage())
                })
                    .then(function (dietsCatalog) {
                        ctrl.dietsCatalog = dietsCatalog;
                        ctrl.dietCategories = whiteboardService.getDietsCategories(dietsCatalog);
                    })
                    .catch(function () {
                        console.error('No diet values available');
                    });
            }

            function selectedDietContent() {
                var selectedContent = '';
                if (!_.isUndefined(ctrl.selectedDiets) && ctrl.selectedDiets.length > 0) {
                    _.forEach(ctrl.selectedDiets, function (dietCatalog) {
                        if (selectedContent !== '') {
                            selectedContent = selectedContent + ',&nbsp;';
                        }
                        if (dietCatalog.category) {
                            selectedContent = selectedContent + dietCatalog.category + '&nbsp;';
                        }
                        selectedContent = selectedContent + dietCatalog.codeDesc;
                    });
                }

                return selectedContent;
            }

            function getDefaultDietOption() {
                return DEFAULT_DIET_CATALOG;
            }

            function removeDefaultDietOption() {
                if (ctrl.selectedDiets.length === 0) {
                    ctrl.selectedDiets.push(DEFAULT_DIET_CATALOG);
                } else if (ctrl.selectedDiets.length > 1) {
                    if (ctrl.selectedDiets[0].code === DEFAULT_DIET_CATALOG.code) {
                        ctrl.selectedDiets.splice(0, 1);
                    }
                }
            }

            function _getDietsCatalogForDietsCodes(diets) {
                var dietsCatalog = [];
                if (diets && diets.length > 0) {
                    _.forEach(diets, function (code) {
                        var dietCatalog = _.find(ctrl.dietsCatalog, function (dietCatalog) {
                            if (dietCatalog.code === code) {
                                return dietCatalog;
                            }
                        });

                        if (!_.isUndefined(dietCatalog)) {
                            dietsCatalog.push(dietCatalog);
                        }
                    });
                } else {
                    //set default
                    dietsCatalog.push(DEFAULT_DIET_CATALOG);
                }
                return dietsCatalog;
            }

            function _getCodesForSelectedDiets() {
                if (_.isUndefined(ctrl.selectedDiets) || ctrl.selectedDiets === null || ctrl.selectedDiets.length === 0) {
                    return null;
                } else if (ctrl.selectedDiets.length === 1 && ctrl.selectedDiets[0].code === DEFAULT_DIET_CATALOG.code) {
                    return null;
                } else {
                    var selectedCodes = [];
                    _.forEach(ctrl.selectedDiets, function (dietCatalog) {
                        if (dietCatalog.code !== DEFAULT_DIET_CATALOG.code) {
                            selectedCodes.push(dietCatalog.code);
                        }
                    });

                    return selectedCodes;
                }
            }
            //END Methods for diet

            function save() {
                // copy back edited values
                // update editedOperationDate, if vwOperationDate has changed
                if(_isDirtyValue(dirtyCheck.vwOperationDate, editItem.vwOperationDate)) {
                    item.editedOperationDate = editItem.vwOperationDate;
                }

                // update editedDischargeDate, if vwDischargeDate has changed
                if(_isDirtyValue(dirtyCheck.vwDischargeDate, editItem.vwDischargeDate)) {
                    item.editedDischargeDate = editItem.vwDischargeDate;
                }

                // update editedReason, if vwReason has changed
                if(_isDirtyValue(dirtyCheck.vwReason, editItem.vwReason)) {
                    item.editedReason = editItem.vwReason && editItem.vwReason.length !== 0 ? editItem.vwReason.split('\n') : null;
                }

                item.nurseName = editItem.nurseName && editItem.nurseName.length !== 0 ? editItem.nurseName : null;
                item.isolationType = editItem.isolationType;
                item.comment = editItem.comment && editItem.comment.length !== 0 ? editItem.comment : null;

                // Only update the physicians array, if there was a change
                if (ctrl.physicians) {
                    item.editedPhysician = ctrl.physicians;
                    whiteboardService.addPhysiciansToTheAutocompleteStorage(item.editedPhysician);
                }

                // Escape Doublequotes from reason
                if (item.editedReason) {
                    var newReason = [];
                    _.each(item.editedReason, function (reasonEntry) {
                        newReason.push(_.replace(reasonEntry, new RegExp("\"","g"),"'"));
                    });
                    item.editedReason = newReason;
                }

                //set diet values to item for save
                item.diet = _getCodesForSelectedDiets();

                $mdDialog.hide(item);
            }

            function closeDialog() {
                $mdDialog.hide();
            }

            /**
             * Return disable is the user role is in the list or if the whiteboard entry is locked
             *
             * @returns {boolean}
             */
            function isReadOnly() {
                return ctrl.isLocked || ctrl.isReadOnlyUser;
            }

            // ------------------------------- Helper methods

            /**
             * Check if a value has changed (dirty checking) or not, by comparing 'before' and 'after' values
             * @param before value before
             * @param after value after
             * @returns {boolean}
             * @private
             */
            function _isDirtyValue(before, after) {
                if(!before && !after) return false;
                if((!before && after) || (before && !after)) return true;
                return before.toString() !== after.toString();
            }
        }
    }
}

export default whiteboardEditDialogService;
