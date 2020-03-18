import template from './template/contentItemNoTitle.component.html';

const contentItemNoTitle = {
    templateUrl: template,
    replace: true,
    bindings: {
        content: "@",
        info: "@",
        elementid: "@",
        tooltipPlacement: "@"
    }
};

export default contentItemNoTitle;

