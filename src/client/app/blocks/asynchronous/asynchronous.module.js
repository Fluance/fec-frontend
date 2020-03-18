import angular from "angular";
import AsyncPipelineBuilderService from './asyncPipelineBuilder.service';
import AsyncPipelineFlowService from './asyncPipelineFlow.service';

angular.module('blocks.asynchronous',[])
    .factory('AsyncPipelineBuilderService', AsyncPipelineBuilderService)
    .factory('AsyncPipelineFlowService', AsyncPipelineFlowService);
