import template from './template/contentItemInfo.component.html';

const contentItemInfo = {
    templateUrl: template,
    replace: false,
    bindings: {
        label: "@",
        content: "@",
        info: "@",
        tooltipPlacement: "@",
        isNegative: "@"
    }
};

export default contentItemInfo;
