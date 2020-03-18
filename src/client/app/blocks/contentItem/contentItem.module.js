import angular from 'angular';
import contentItem from './contentItem.component';
import contentItemDetail from './contentItemDetail.component';
import contentItemInfo from './contentItemInfo.component';
import contentItemInfoOneLine from './contentItemInfoOneLine.component';
import contentItemNoTitle from './contentItemNoTitle.component';

angular
    .module('blocks.contentItem', [])
    .component('contentItem', contentItem)
    .component("contentItemDetail", contentItemDetail)
    .component("contentItemInfo", contentItemInfo)
    .component("contentItemInfoOneLine", contentItemInfoOneLine)
    .component("contentItemNoTitle", contentItemNoTitle);
