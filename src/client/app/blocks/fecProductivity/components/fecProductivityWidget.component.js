
const fecProductivityWidget = {
    bindings: {
        url: '<',
        filename: '<',
        iconType: '<',
        tooltip: '@?'
    },
    controller: ['$element', 'productivityService', controller],
    template: '<span><a href="{{$ctrl.url}}" filename="{{$ctrl.filename}}"><fec-icon type="{{$ctrl.iconType}}" size="sm" color="fe-blue-icon"></fec-icon></a>' +
        '<md-tooltip ng-if = "$ctrl.tooltip" layout="row" layout-align="center center" class="info" md-direction="bottom"md-delay="25">{{$ctrl.tooltip}}</md-tooltip>' +
        '</span>'
};

function controller($element, productivityService) {
    // Remove tag if Productivity Tie-Ins feature is not activated
    if (!productivityService.isActive()) {
        $element.remove();
    }
}

export default fecProductivityWidget;

