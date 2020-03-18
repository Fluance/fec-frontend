import template from './template/contentItem.component.html';

const contentItem = {
    templateUrl: template,
    replace: true,
    bindings: {
        iconType: "@",
        label: "@",
        content: "@",
        contentOnSecondLine: "=",
        info: "@",
        tooltipPlacement: "@",
        meteoDate: "@",
        meteoCompanyId: "@"
    }
};

export default contentItem;

