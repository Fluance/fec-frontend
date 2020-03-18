import _ from 'lodash';

/**
 * Checklist with list of items to be checked
 *
 * Used to manage list of operations to create/update a note.
 * eg:
 * 1. create note
 * 2. process picture 1
 * 3. process picture 2
 * 4. process picture 3
 *
 */

CheckListService.$inject = ['AsyncPipelineFlowService'];
function CheckListService(AsyncPipelineFlowService) {
    var checklist;  // check list with tasks to be checked as successfully completed
    var service = {
        reset: reset,
        getCheckList: getCheckList,
        addTask: addTask,
        isTaskCompleted: isTaskCompleted,
        allTasksCompleted: allTasksCompleted
    };

    init();
    return service;

    // ---------------------------------------------------------- Interface methods

    function init() {
        checklist = [];
    }

    function reset() {
        init();
    }

    function getCheckList() {
        var result = [];
        _.forEach(checklist, function(task) {
            result.push( {name: task.name, data: task.data, message: task.message, checked: isTaskCompleted(task.name)} );
        });
        return result;
    }

    function isTaskCompleted(taskName) {
        return AsyncPipelineFlowService.hasCompleted(taskName);
    }

    function allTasksCompleted() {
        var allTasksChecked = true;
        var checklist = getCheckList();
        _.forEach(checklist, function(item) {
            if(!item.checked) {
                allTasksChecked = false;
            }
        });
        return allTasksChecked;
    }

    function addTask(taskName, message, data) {
        var existingCheck = _.find(checklist, {name: taskName});
        // new check item
        if(_.isUndefined(existingCheck)) {
            checklist.push({name: taskName, message: message, data: data});
        }
        // existing check item: update
        else {
            existingCheck.message = message;
            existingCheck.data = data;
        }
    }

}

export default CheckListService;

