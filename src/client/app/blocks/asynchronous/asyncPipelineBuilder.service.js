import angular from 'angular';

AsyncPipelineBuilderService.$inject = ['$q', 'AsyncPipelineFlowService'];
function AsyncPipelineBuilderService($q, AsyncPipelineFlowService) {
    var pipelineFlow = [];
    var service;

    // Type of an element
    var TYPE_TASK = 'task',
        TYPE_SEQUENCE = 'sequence',
        TYPE_GROUP = 'group',
        TYPE_IMPORT = 'import';

    // Status of an element
    var STATUS_SUCCESS = 'success',
        STATUS_FAIL = 'fail';

    init();

    service = {
        // types
        TYPE_TASK: TYPE_TASK,
        TYPE_SEQUENCE: TYPE_SEQUENCE,
        TYPE_GROUP: TYPE_GROUP,
        TYPE_IMPORT: TYPE_IMPORT,

        createSequence: createSequence,
        createGroup: createGroup,
        createTask: createTask,
        isSuccess: isSuccess,
        findByName: findByName,
        processBlueprint: processBlueprint,
        processElement: processElement,
        getPipeline: getPipeline,
        setPipelineResults: setPipelineResults
    };

    return service;

    // ------------------------------------------------------------------------ Interface methods

    function init() {
        pipelineFlow = [];
        AsyncPipelineFlowService.init();
    }

    /**
     * Create sequence of tasks. Sequence fails-fast, stops at first failed task.
     *
     * @param taskList list of async tasks (functions that return a promise) to execute sequentially
     * @returns Array with results from the tasks, up to the point they executed successfully
     */
    function createSequence(sequenceName, taskList) {
        var deferred = $q.defer(),
            promise,
            results = [];

        // check for empty array
        if(!_.isArray(taskList) || _.isEmpty(taskList)) {
            console.log('createSequence: taskList not array or empty');
            return $q.resolve();
        }

        // build sequence
        // assumption: tasks are self-contained and don't need parameters to be passed
        promise = $q.resolve();
        _.forEach(taskList, function(task) {
            promise = promise.then(function(result) {

                if(result) results.push(result);

                // task is a function
                if(task instanceof Function) {
                    return task(); // no parameters, encapsulated task
                }
                // task is a promise
                else if(task.then !== undefined && task.then instanceof Function) {
                    return task;
                }
                else {
                    return $q.reject('unknown task type');
                }
            })
        });

        // resolve if every task executed successfully in the sequence
        promise = promise.then(function(result) {
            if(result) results.push(result);
            var executionResult = {name: sequenceName, type:TYPE_SEQUENCE, result: results, status: STATUS_SUCCESS};
            _push(executionResult);
            deferred.resolve(executionResult); // what the sequence returns after running completes -- Object
        })
        // reject on any error in executing the sequence
        .catch(function(exception) {
            if(exception) results.push(exception);
            var executionResult = {name: sequenceName, type:TYPE_SEQUENCE, result: results, status: STATUS_FAIL};
            _push(executionResult);
            deferred.reject(executionResult); // what the sequence returns after running completes -- Object
        });

        return deferred.promise;
    }

    /**
     * Create pipeline with tasks to be run as a concurrently as a group, but independently. Always resolves (unlike $q.all()).
     *
     * @param groupName name of the group of tasks
     * @param taskList list of async tasks (functions that return a promise) to execute as a group
     * @returns Array with results from tasks
     */
    function createGroup(groupName, taskList) {
        var deferred = $q.defer(),
            status = STATUS_SUCCESS,
            promises = [];

        // check for empty array
        if(!_.isArray(taskList) || _.isEmpty(taskList)) {
            console.log('createGroup: taskList not array or empty');
            return $q.resolve();
        }

        _.forEach(taskList, function(task) {
            // task is a function
            if(task instanceof Function) {
                promises.push(
                    // no parameters..
                    task()
                        .then(function(result) {
                            // task completed successfully
                            return result; // what the task returns -- Object,... (eg: save note task = Object)
                        })
                        .catch(function(result) {
                            // error
                            console.log('(AsyncPipelineBuilder) task error:', result);
                            status = STATUS_FAIL; // mark pipeline as having a failed task
                            return result; // what the task returns -- Object,... (eg: save note task = Object)
                        })
                );
            }
            // task is a promise
            else if(task.then !== undefined && task.then instanceof Function) {
                promises.push(
                    task
                        .then(function(result) {
                            // task completed successfully
                            return result; // what the task returns -- Object,... (eg: SequentialPipeline = Array)
                        })
                        .catch(function(result) {
                            // error
                            status = STATUS_FAIL; // mark pipeline as having a failed task
                            return result; // what the task returns -- Object,... (eg: SequentialPipeline = Array)
                        })
                );
            }
            else {
                console.log('Error: unknown task type:', groupName, taskList);
                throw Error('createGroup: unknown task type:', groupName, taskList);
            }
        });

        // run tasks as a group
        $q.all(promises).then(function(results) {
            var executionResult = {name: groupName, type: TYPE_GROUP, result: results, status: status};
            _push(executionResult);
            deferred.resolve(executionResult); // what the group returns -- Array
        });

        return deferred.promise;
    }

    /**
     * Creates a task that can be run in the pipeline
     * Binds all needed parameters for fn and creates a self contained "task", so that the created 'task' can be run in the pipeline as an opaque object.
     */
    function createTask(taskName, fn, params) {
        if(!_.isFunction(fn)) {
            throw Error('createTask: fn is not a function');
        }

        var fn_spread = function(fn, params) {
            return fn.apply(fn, params)
                .then(function(result) {
                    var taskResult = {name: taskName, type: TYPE_TASK, result: result, status: STATUS_SUCCESS};
                    _push({name: taskName, value: taskResult});
                    return $q.resolve(taskResult);
                })
                .catch(function(exception) {
                    var taskResult = {name: taskName, type: TYPE_TASK, result: exception, status: STATUS_FAIL};
                    _push({name: taskName, value: taskResult});
                    return $q.reject(taskResult);
                });
        };

        // get fn parameters passed to "createTask" as arguments.
        // "createTask".length = expected number of parameters from function declaration (1).
        //var params = Array.prototype.slice.call(arguments, createTask.length);

        return angular.bind(null, fn_spread, fn, params); // fn_bound
    }

    /**
     * Determines if a task/pipeline was successfully executed.
     * Returns 'true' only if all results under task/pipeline are marked as successful (checked == true).
     */
    function isSuccess(name) {
        // find name in checklist
        var pipelineBranch = findByName(name);

        // traverse branch: TODO
        // ==> SIMPLIFY: assume task or sequential pipeline
        // task:
        if(pipelineBranch.hasOwnProperty('status')) {
            return pipelineBranch.status === STATUS_SUCCESS;
        }

        // sequence element:
        if(_.isArray(pipelineBranch['result'])) {
            var isSuccess = false;
            _.forEach(pipelineBranch.result, function(result) {
                isSuccess = isSuccess || result.status === STATUS_SUCCESS;
            });
            return isSuccess;
        }
    }

    function findByName(name) {
        var item = _.find(pipelineFlow, {name: name});
        if(_.isUndefined(item)) {
            return undefined;
        }
        else if(_.isUndefined(item.value)) {
            return item;
        }
        else {
            return item.value;
        }
    }

    // ------------------------------------------------------------------------ Blueprint

    function processBlueprint(blueprint, previousPipelineFlow) {
        init(); // clear pipelineFlow

        if(_.isUndefined(previousPipelineFlow)) {
            previousPipelineFlow = pipelineFlow;
        }
        else {
            AsyncPipelineFlowService.setFlow(previousPipelineFlow);
        }

        if(!_.isArray(blueprint)) {
            return $q.reject('blueprint is not an array');
        }

        _.forEach(blueprint, function(item) {
            processElement(item, previousPipelineFlow);
        });

        return pipelineFlow;
    }

    function processElement(element, previousPipelineFlow) {
        var result;
        switch(element.type) {
            case TYPE_IMPORT:
                result = _importElement(element);
                break;
            case TYPE_TASK:
                result = _createTask(element, previousPipelineFlow);
                break;
            case TYPE_SEQUENCE:
                result = _createSequence(element, pipelineFlow);
                break;
            case TYPE_GROUP:
                result = _createGroup(element, pipelineFlow);
                break;
            default:
                result = $q.reject("processElement: Unknown element type");
        }
        return result;
    }

    function importElement(importName, fn, params) {
        if(!_.isFunction(fn)) {
            throw Error('importElement: fn is not a function');
        }

        var fn_spread = function(fn, params) {
            return fn.apply(fn, params)
                .then(function(result) {
                    var importResult = {name: importName, type: TYPE_IMPORT, result: result, status: STATUS_SUCCESS};
                    _push({name: importName, value: importResult});
                    return $q.resolve(importResult);
                })
                .catch(function(exception) {
                    var importResult = {name: importName, type: TYPE_IMPORT, result: exception, status: STATUS_FAIL};
                    _push({name: importName, value: importResult});
                    return $q.reject(importResult);
                });
        };

        // get fn parameters passed to "importNode" as arguments.
        // "importNode".length = expected number of parameters from function declaration (1).
        //var params = Array.prototype.slice.call(arguments, importElement.length);

        return angular.bind(null, fn_spread, fn, params); // fn_bound
    }

    function getPipeline(pipelineFlow, elementName) {
        var pipelineFlowElement = _.find(pipelineFlow, {name: elementName});
        if(_.isUndefined(pipelineFlowElement)) {
            return $q.reject('Error: unknown pipeline element: ' + elementName);
        }
        return pipelineFlowElement.element;
    }

    function setPipelineResults(pipelineFlow) {
        AsyncPipelineFlowService.setFlow(pipelineFlow);
    }


    // ------------------------------------------------------------------------ Private methods

    function _importElement(element) {
        var task;
        if(element.params !== undefined) {
            task = importElement(element.name, element.fn, element.params);
        }
        else {
            task = importElement(element.name, element.fn);
        }

        _push( {name: element.name, element: task} );
        return task;
    }

    function _createTask(element, previousPipelineFlow) {
        var task;
        if(_skipTask(element.name, previousPipelineFlow)) {
            task = _createNoopTask(element);
        }
        else {
            if(element.params !== undefined) {
                task = createTask(element.name, element.fn, element.params);
            }
            else {
                task = createTask(element.name, element.fn);
            }
        }

        _push( {name: element.name, element: task} );
        return task;
    }

    function _createNoopTask(element) {
        var task;
        var noopFn = function() {
            return $q.resolve('noop');
        };

        task = createTask(element.name, noopFn);
        return task;
    }

    function _createSequence(sequenceElement, flow) {
        var sequence;
        var tasks = [];

        _.forEach(sequenceElement.tasks, function(taskName) {
            var flowEntry = _.find(flow, {name: taskName});
            tasks.push(flowEntry.element); // task | promise
        });

        sequence = createSequence(sequenceElement.name, tasks);

        _push( {name: sequenceElement.name, element: sequence} );
        return sequence;
    }

    function _createGroup(groupElement, flow) {
        var group;
        var tasks = [];

        _.forEach(groupElement.tasks, function(taskName) {
            var flowEntry = _.find(flow, {name: taskName});
            tasks.push(flowEntry.element); // task | promise
        });

        group = createGroup(groupElement.name, tasks);

        _push( {name: groupElement.name, element: group} );
        return group;
    }

    /**
     * Verifies if task should be skipped (and mocked) if the task was already executed successfully
     * @param name name of the task
     * @param flow list with elements in the pipeline
     */
    function _skipTask(name, flow) {
        if(_.isUndefined(flow)) {
            return false;
        }

        var element = _.find(flow, {name: name});
        return (element && element.type === TYPE_TASK && element.status === STATUS_SUCCESS);
    }

    function _push(element) {
        var i = _.findIndex(pipelineFlow, {name: element.name});
        if(i === -1) {
            // push
            pipelineFlow.push(element);
        }
        else {
            // replace
            pipelineFlow[i] = element.value || element; // task || (sequence || group)
        }
    }

}

export default AsyncPipelineBuilderService;

