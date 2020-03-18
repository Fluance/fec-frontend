/**
 * @ngdoc directive
 * @module blocks
 * @name expanderAccordion
 * @restrict 'E'
 * @scope
 * @return {Object} directive
 * @description
 *
 * Adds the accordion behaviour to a list of enclosed expanders.
 *
   <expander-accordion>
     <any-html />
     <expander ng-repeat="...">
        <expander-header>
            <any-html-template />
        </expander-header>
        <expander-body>
            <any-html-template />
        </expander-body>
     </expander>
     <any-html />
   </expander-accordion>
 */

const expanderAccordionComponent = {
    controller: controller,
    controllerAs: 'vm'
};

function controller() {
    var expanderController;

    /*jshint validthis: true */
    var vm = this;

    vm.expandedChanged = expandedChanged;
    vm.releaseExpanderScope = releaseExpanderController;

    vm.$onDestroy = onDestroy;
    return vm;

    // ------------------------------------------------------------------------ Lifecycle-hooks

    function onDestroy() {
        _releaseExpanderController();
    }

    // --------------------------------------------------------------- Interface implementation

    function releaseExpanderController(controller) {
        if (expanderController === controller) { _releaseExpanderController(); }
    }

    function expandedChanged(controller) {
        var isNewExpanderExpanded = (controller && controller.isExpanded === true);

        // Collapse currently expanded expander
        if (isNewExpanderExpanded) {
            if (expanderController) { expanderController.isExpanded = false; }
        }

        // Release collapsed expander
        if (expanderController && expanderController.isExpanded === false) {
            _releaseExpanderController();
        }

        // Keep new expanded expander
        if (isNewExpanderExpanded) {
            expanderController = controller;
        }
    }

    // ------------------------------------------------------------------------- Helper methods

    function _releaseExpanderController() {
        expanderController = undefined;
    }
}

export default expanderAccordionComponent;
