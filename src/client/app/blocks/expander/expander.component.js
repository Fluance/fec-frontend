import angular from 'angular';
import template from './expander.component.html';

/**
 * @ngdoc directive
 * @module blocks
 * @name expander
 * @restrict 'E'
 * @scope
 * @param {bool} isExpanded             Gets or sets the value indicating whether the expander is in an expanded
 *                                      state.
 * @param {string} isExpandedChanged    Function to be executed whenever the isExpanded state changed.<br />
 *                                      The function can take the special $isExpanded parameter representing the
 *                                      current state of the expander.
 * @return {Object} directive
 * @description
 *
 * An expander component with a customizable header and body.
 *
   <expander is-expanded="vm.isExpanded" is-expanded-changed="vm.onExpandedChanged($isExpanded)">
      <expander-header>
         <any-html-template />
      </expander-header>
      <expander-body>
         <any-html-template />
      </expander-body>
   </expander>
 */

var ACTION_ADD = 'ADD';
var ACTION_REMOVE = 'remove';

var CSS_EXPANDED = 'expanded';
var CSS_EXPANDER = 'expander';
var CSS_EXPANDER_BODY = 'expander-body';
var CSS_EXPANDER_HEADER = 'expander-header';
var CSS_EXPANDER_CAN_EXPAND = 'expander-can-expand';

const expanderComponent = {
    bindings: {
        canExpand: '<?',
        isExpanded: '=?',
        isExpandedChanged: '&'
    },
    controller: ['$element', '$scope', 'waitForRendering', controller],
    controllerAs: 'vm',
    templateUrl: template,
    transclude: {
        header: '?expanderHeader',
        body: '?expanderBody'
    }
};

function controller($element, $scope, waitForRendering) {
    var expanderAccordionController;
    var expanderElement;
    var expanderBodyElement;
    var expanderHeaderElement;
    var unregistrationMethods = [];

    /*jshint validthis: true */
    var vm = this;

    vm.toggleIsExpanded = toggleIsExpanded;

    vm.$onInit = onInit;
    vm.$onChanges = onChanges;
    vm.$onDestroy = onDestroy;
    vm.$postLink = postLink;

    // ------------------------------------------------------------------------ Lifecycle-hooks

    function onInit() {
        vm.canExpand = vm.canExpand || true;
        vm.isExpanded = !!vm.isExpanded;

        expanderElement = _getElement(CSS_EXPANDER);
        expanderBodyElement = _getElement(CSS_EXPANDER_BODY);
        expanderHeaderElement = _getElement(CSS_EXPANDER_HEADER);

        // Check for accordion behaviour (if present)
        expanderAccordionController = _getExpanderAccordionController();

        // Register watchers
        unregistrationMethods.push($scope.$watch('vm.isExpanded', onIsExpandedChanged));
    }

    function postLink() {
        waitForRendering.wait(function() {
            // Calculate canExpand (default value is 'true', if no body is defined, forced to 'false')
            if (expanderBodyElement.children().length === 0) {
                vm.canExpand = false;
            }
            _updateCssClass(expanderHeaderElement, CSS_EXPANDER_CAN_EXPAND, (vm.canExpand) ? ACTION_ADD : ACTION_REMOVE);
        });
    }

    function onChanges(changesObj) {
        if (changesObj.canExpand) {
            _updateCssClass(expanderHeaderElement, CSS_EXPANDER_CAN_EXPAND, (vm.canExpand) ? ACTION_ADD : ACTION_REMOVE);
        }
    }

    function onDestroy() {
        // Un-register watchers
        unregistrationMethods.forEach(function(unregistrationMethod) { unregistrationMethod(); });

        _unlinkFromExpanderAccordion();
    }

    function onIsExpandedChanged(newValue, oldValue) {
        if (newValue === false && oldValue === false) { return; }

        _updateCssClass(expanderElement, CSS_EXPANDED, (vm.isExpanded) ? ACTION_ADD : ACTION_REMOVE);
        _animate();
        vm.isExpandedChanged({ '$isExpanded': vm.isExpanded });
        _notifyExpanderAccordion();
    }

    // --------------------------------------------------------------- Interface implementation

    function toggleIsExpanded() {
        if (vm.canExpand) { vm.isExpanded = !vm.isExpanded; }
    }

    // --------------------------------------------------------- Expander accordion integration

    function _getExpanderAccordionController() {
        var element = _getExpanderAccordionElement($element.parent());
        return (element) ? element.isolateScope().vm : undefined;
    }

    function _getExpanderAccordionElement(element) {
        var tagName = element.prop('tagName');
        if (tagName === 'EXPANDER-ACCORDION') { return element; }
        if (tagName === 'EXPANDER' || tagName === 'BODY') { return undefined; }
        return _getExpanderAccordionElement(element.parent());
    }

    function _notifyExpanderAccordion() {
        if (expanderAccordionController) { expanderAccordionController.expandedChanged(vm); }
    }

    function _unlinkFromExpanderAccordion() {
        if (expanderAccordionController) {
            expanderAccordionController.releaseExpanderScope(vm);
        }
    }

    // ------------------------------------------------------------------------- Helper methods

    function _animate() {
        if (expanderBodyElement) {
            var animationFunction = (vm.isExpanded) ? 'slideDown' : 'slideUp';
            expanderBodyElement.stop(true, false)[animationFunction]({ duration: 350, easing: 'easeOutQuart' });
        }
    }

    function _getElement(cssClassName) {
        var elements = $element[0].getElementsByClassName(cssClassName);
        return (elements.length > 0) ? angular.element(elements[0]) : undefined;
    }

    function _updateCssClass(element, className, action) {
        switch (action) {
            case ACTION_ADD:
                element.addClass(className);
                break;

            case ACTION_REMOVE:
                element.removeClass(className);
                break;
        }
    }
}

export default expanderComponent;
