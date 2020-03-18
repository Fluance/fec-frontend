function AsyncPipelineFlowService() {
    var pipelineFlow;
    var service;

    init();

    service = {
        init: init,
        push: push,
        update: update,
        get: get,
        hasCompleted: hasCompleted,
        getFlow: getFlow,
        setFlow: setFlow
    };

    return service;

    // ----------------------------------------------------

    function init() {
        pipelineFlow = [];
    }

    function push(element) {
        pipelineFlow.push(element);
    }

    function update(name, newValue) {
        var i = _.findIndex(pipelineFlow, {name: name});
        if(i === -1) {
            push(newValue);
        }
        else {
            pipelineFlow[i] = newValue;
        }
    }

    function get(name) {
        return _.find(pipelineFlow, {name: name}).item;
    }

    function getFlow() {
        return pipelineFlow;
    }

    function hasCompleted(taskName) {
        var task = _.find(pipelineFlow, {name: taskName});
        return (!_.isUndefined(task) && task.status === "success");
    }

    function setFlow(flow) {
        pipelineFlow = [];
        _.forEach(flow, function(element) {
            pipelineFlow.push( {name: element.name, status: element.status, type: element.type});
        });
    }
}

export default AsyncPipelineFlowService;

