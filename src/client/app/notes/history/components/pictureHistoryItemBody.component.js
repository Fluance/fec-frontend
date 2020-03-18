import template from './pictureHistoryItemBody.component.html';

const PictureHistoryItemBody = {
    bindings: {
        historyItem: '='
    },
    controller: [controller],
    templateUrl: template
};

function controller() {
    var ctrl = this;
}

export default PictureHistoryItemBody;
