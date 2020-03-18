import angular from 'angular';
import _ from 'lodash';
import template from './whiteboardPhysiciansList.component.html';

const WhiteboardPhysiciansList = {
    bindings: {
        physicians: '=',
        isDisabled: '='
    },
    controller: controller,
    templateUrl: template
};

controller.$inject = [
    'whiteboardService'
];

function controller(whiteboardService) {
    var ctrl = this;

    ctrl.$onInit = onInit;

    ctrl.addPhysician = addPhysician;
    ctrl.deletePhysician = deletePhysician;
    ctrl.querySearch = querySearch;
    ctrl.queryPhysicians = loadPhysicians();
    ctrl.searchTextChange = searchTextChange;
    ctrl.selectedItemChange = selectedItemChange;

    function onInit() {
        ctrl.sortableOptions = {
            handle: '.physicians-list-item-reorder',
            disabled: ctrl.isDisabled,
            'ui-floating': true,
            items: '.sortable-item',
            start: function (event, ui) {
                $(this).sortable({
                    sort: function (event, ui) {
                        var $target = $(event.target);
                        if (!/html|body/i.test($target.offsetParent()[0].tagName)) {
                            var left = event.pageX - $target.offsetParent().offset().left - ui.helper.outerWidth(true) + 10;
                            ui.helper.css({ 'left': left + 'px' });
                        }
                    }
                });

            }
        };
    }
    // ----------------------------------------------------------------------------- Interface methods

    function addPhysician(newPhysician) {
        if (newPhysician && _isValid(newPhysician)) {
            if (newPhysician && newPhysician.length) {
                if (_.isUndefined(ctrl.physicians) || _.isNull(ctrl.physicians)) {
                    ctrl.physicians = [];
                }
                ctrl.physicians.push(newPhysician);
                ctrl.newPhysician = "";
                ctrl.searchText = "";
            }
        }
    }

    /**
     * Search for physicians
     */
    function querySearch(query) {
        return query ? ctrl.queryPhysicians.filter(createFilterFor(query)) : ctrl.queryPhysicians;
    }

    /**
     * Create filter function for a query string
     */
    function createFilterFor(query) {
        var lowercaseQuery = query.toLowerCase();

        return function filterFn(physician) {
            return (physician.value.indexOf(lowercaseQuery) === 0);
        };
    }

    function searchTextChange(text) {
        ctrl.newPhysician = text;
    }

    function selectedItemChange(item) {
        if (!_.isEmpty(item)) {
            ctrl.newPhysician = item.display;
        }
    }

    function deletePhysician(index) {
        ctrl.physicians.splice(index, 1);
    }

    /**
     * Build `queryPhysicians` list of key/value pairs
     */
    function loadPhysicians() {
        var physicians = angular.copy(whiteboardService.getPhysiciansArrayFromAutocompleteStorage());



        // Remove already added physicians from auto complete
        _.each(ctrl.physicians, function (physician) {
            physicians.splice(_.indexOf(physicians, physician), 1);
        });

        return physicians.map(function (physician) {
            return {
                value: physician.toLowerCase(),
                display: physician
            };
        });
    }

    function _isValid(physician) {
        return !_.find(ctrl.physicians, function (element) {
            return _.toLower(element) == _.toLower(physician);
        });
    }
}


export default WhiteboardPhysiciansList;
