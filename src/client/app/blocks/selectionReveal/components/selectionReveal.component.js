import componentTemplate from './selectionReveal.component.html';
import dialogTemplate from './selectionReveal.dialog.html';

/**
 *
 * @ngdoc directive
 * @scope
 * @module app
 * @name selectionReveal
 * @restrict E
 *
 * @param {string} revealId              reveal ID
 * @param {string} revealTitle           reveal title
 * @param {string} activeElementId       active element ID
 * @param {boolean} showReveal           boolean, if true the modal is shown, if false, the modal is hidden
 * @param {function()} activateElement     function to activate an element chosen in the modal
 * @param {function()} elementList         array with element objects which have an id and a name
 * @param {function()} activeElementName   function to get the name of the active element
 *
 * @description
 * This is a component to create a selection reveal. The boolean `showReveal` is designed to hide the
 * reveal dialog when e.g. the list is empty.
 *
 * You can style the element by yourself or rely on the given CSS (blue with a pencil).
 *
 <selection-reveal reveal-id="exampleRevealId" show-reveal="true"
 activate-element="activateFunction" active-element-id="exampleElementId"
 element-list="exampleElementList" reveal-title="exampleTitle"
 active-element-name="exampleActiveElementName">
 </selection-reveal>
 **/

const selectionReveal = {
    bindings: {
        revealId: '@',
        revealTitle: '@',
        selectedItem: '=',
        items: '=',
        getItemDisplayName: '&',
        selectedItemChanged: '&',
        closeOnSelection: '='
    },
    controller: ['$mdDialog', '$anchorScroll', controller],
    templateUrl: componentTemplate
};

function controller($mdDialog, $anchorScroll) {
    var ctrl = this;
    var fnGetItemDisplayName;

    // Events
    ctrl.$onInit = onInit;
    // Interface
    ctrl.getDisplayName = getDisplayName;
    ctrl.openDialog = openDialog;

    // ----------------------------------------------- Events

    function onInit() {
        // Display name function
        fnGetItemDisplayName = ctrl.getItemDisplayName();
        if (!_.isFunction(fnGetItemDisplayName)) {
            fnGetItemDisplayName = function (item) {
                return item;
            };
        }
    }

    // ----------------------------------------------- Interface

    function getDisplayName() {
        return (ctrl.selectedItem) ? fnGetItemDisplayName(ctrl.selectedItem) : '-';
    }

    function openDialog() {
        function onComplete() {
            if (ctrl.selectedItem && ctrl.selectedItem.id) {
                $anchorScroll('item-' + ctrl.selectedItem.id);
            }
        }
        $mdDialog
            .show({
                controller: ['$mdDialog', dialogController],
                controllerAs: '$ctrl',
                templateUrl: dialogTemplate,
                clickOutsideToClose: true,
                locals: {
                    title: ctrl.revealTitle,
                    items: ctrl.items,
                    closeOnSelection: ctrl.closeOnSelection,
                    selectedItem: ctrl.selectedItem,
                    getItemDisplayName: fnGetItemDisplayName
                },
                bindToController: true,
                onComplete: onComplete
            })
            .then(function (selectedItem) {
                ctrl.selectedItem = selectedItem;

                var fnSelectedItemChanged = ctrl.selectedItemChanged();
                if (_.isFunction(fnSelectedItemChanged)) {
                    fnSelectedItemChanged(ctrl.selectedItem);
                }
            })
            .catch(function() {
                // no selection
            });
    }
}

function dialogController($mdDialog) {
    var ctrl = this;
    ctrl.selectItem = selectItem;
    ctrl.ok = ok;
    ctrl.cancel = cancel;

    // -------------------------------

    function selectItem(item) {
        ctrl.selectedItem = item;
        if (ctrl.closeOnSelection) {
            ok();
        }
    }

    function ok() {
        $mdDialog.hide(ctrl.selectedItem);
    }

    function cancel() {
        $mdDialog.cancel();
    }
}

export default selectionReveal;
