/**
 * Mycockpit Patient Element Directive
 */

import template from '../templates/singleSearchElement.html';

const myCockpitSingleSearch = function() {
    return {
        restrict: 'E',
        templateUrl: template,
        require: '^myCockpit',
        link: function(scope, element, attrs) {
            scope.isExpanded = function() {
                return true;
            };
        },
        scope: {
            search: '=search',
            icon: '=icon'
        }
    };
};

export default myCockpitSingleSearch;
