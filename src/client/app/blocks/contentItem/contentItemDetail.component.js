import template from './template/contentItemDetail.component.html';

const contentItemDetail = {
    templateUrl: template,
    replace: true,
    bindings: {
        label: "@",
        content: "@",
        info: "@",
        tooltipPlacement: "@",
        meteoDate: "@",
        meteoCompanyId: "@"
    },
    transclude: {
        custom: '?customElement'
    },
    link: function(scope, elem, attrs) {
        scope.isHtmlContent = false;
        if (attrs.isHtmlContent === "true") {
            scope.isHtmlContent = true;
        }
    }
};

export default contentItemDetail;

