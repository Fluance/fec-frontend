import angular from 'angular';
import runRoute from './search.route';
import fullSearchService from './fullSearch.service';
import { dataServiceFullSearch, run as runDataServiceFullSearch } from './data/fullSearch.dataservice';
import searchQueryService from './searchQueryService';
import searchCriterionFactory from './search.criterion';
import searchQueryFactory from './search.query';
import patientNavigationButtonSearch from './fecPatientNavigationButtonSearch.component';
import fullSearchController from './fullSearch.controller';
import fullSearchEntityTypeController from './fullSearchEntityType.controller';
import SearchPatientsController from './searchPatients.controller';
import searchStateManager from './searchStateManager';
import SearchCriterion from './components/criterion/search.criterion.component';
import FullSearchInput from "./components/fullSearch/fullSearchInput.component";
import FullSearchResultItemPatient from "./components/fullSearch/fullSearchResultItemPatient.component";
import FullSearchResultItemVisit from "./components/fullSearch/fullSearchResultItemVisit.component";
import SearchQuery from "./components/query/search.query.component";
import SidenavSearch from "./components/sidenav.search.component";
import SidenavSearchCriteria from "./components/sidenav.search.criteria.component";
import SidenavSearchIds from "./components/sidenav.search.ids.component";
import SidenavSearchLocation from "./components/sidenav.search.location.component";


angular
    .module('app.search', [
        'infinite-scroll',
        'app.patient',
        'app.visit'
    ])
    .run(runRoute)
    .run(runDataServiceFullSearch)
    .factory('fullSearchService', fullSearchService)
    .factory('dataservice.fullSearch', dataServiceFullSearch)
    .service('searchQueryService', searchQueryService)
    .factory('searchCriterion', searchCriterionFactory)
    .factory('searchQuery', searchQueryFactory)
    .factory('searchStateManager', searchStateManager)
    .controller('fullSearchController', fullSearchController)
    .controller('fullSearchEntityTypeController', fullSearchEntityTypeController)
    .controller('searchPatientsController', SearchPatientsController)
    .component('fecPatientNavigationButtonSearch', patientNavigationButtonSearch)
    .component('fecSearchCriterion', SearchCriterion)
    .component('fecFullSearchInput', FullSearchInput)
    .component('fecFullSearchResultItemPatient', FullSearchResultItemPatient)
    .component('fecFullSearchResultItemVisit', FullSearchResultItemVisit)
    .component('fecSearchQuery', SearchQuery)
    .component('fecSidenavSearch', SidenavSearch)
    .component('fecSidenavSearchCriteria', SidenavSearchCriteria)
    .component('fecSidenavSearchIds', SidenavSearchIds)
    .component('fecSidenavSearchLocation', SidenavSearchLocation);



