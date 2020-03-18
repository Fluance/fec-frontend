import template from './template/contentItemOneLine.component.html';

const contentItemInfoOneLine = {
    templateUrl: template,
    replace: true,
    bindings: {
        label: "@label",
        content: "@content",
        label2: "@label2",
        content2: "@content2"
    }
};

export default contentItemInfoOneLine;



