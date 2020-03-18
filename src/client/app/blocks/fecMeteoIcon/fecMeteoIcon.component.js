import template from './fecMeteoIcon.component.html';

const fecMeteoIcon = {
    bindings: {
        meteoIcon: '@',
        meteoIconColor: '@',
        meteoIconSize: '@'
    },
    controller: [controller],
    controllerAs: 'vm',
    templateUrl: template
};

function controller() {
    var vm = this;

    // events
    vm.$onInit = onInit;

    // -------------------------------- Events

    function onInit() {
        vm.meteoIconSize = vm.meteoIconSize ? vm.meteoIconSize : '15px';
        vm.meteoIconColor = vm.meteoIconColor ? vm.meteoIconColor : '#1F252B';
        vm.clickable = true;

        switch (vm.meteoIcon) {
            // Icon ID: 01
            case 'clear sky':
                vm.icon = 'B';
                break;
                // Icon ID: 02
            case 'few clouds':
                vm.icon = 'H';
                break;
                // Icon ID: 03
            case 'scattered clouds':
                vm.icon = 'N';
                break;
                // Icon ID: 04
            case 'broken clouds':
            case 'overcast clouds':
                vm.icon = 'Y';
                break;
                // Icon ID: 09
            case 'shower rain':
            case 'light intensity drizzle':
            case 'drizzle':
            case 'heavy intensity drizzle':
            case 'light intensity drizzle rain':
            case 'drizzle rain':
            case 'heavy intensity drizzle rain':
            case 'shower rain and drizzle':
            case 'heavy shower rain and drizzle':
            case 'shower drizzle':
            case 'light intensity shower rain':
            case 'shower rain':
            case 'heavy intensity shower rain':
            case 'ragged shower rain':
                vm.icon = 'R';
                break;
                // Icon ID: 10
            case 'rain':
            case 'light rain':
            case 'moderate rain':
            case 'heavy intensity rain':
            case 'very heavy rain':
            case 'extreme rain':
                vm.icon = 'Q';
                break;
                // Icon ID: 11
            case 'thunderstorm with light rain':
            case 'thunderstorm with rain':
            case 'thunderstorm with heavy rain':
            case 'light thunderstorm':
            case 'thunderstorm':
            case 'heavy thunderstorm':
            case 'ragged thunderstorm':
            case 'thunderstorm with light drizzle':
            case 'thunderstorm with drizzle':
            case 'thunderstorm with heavy drizzle':
                vm.icon = 'P';
                break;
                // Icon ID: 13
            case 'light snow':
            case 'snow':
            case 'freezing rain':
            case 'heavy snow':
            case 'sleet':
            case 'shower sleet':
            case 'light rain and snow':
            case 'rain and snow':
            case 'light shower snow':
            case 'shower snow':
            case 'heavy shower snow':
                vm.icon = 'X';
                break;
                // Icon ID: 50
            case 'mist':
            case 'smoke':
            case 'haze':
            case 'sand, dust whirls':
            case 'fog':
            case 'sand':
            case 'dust':
            case 'volcanic ash':
            case 'squalls':
            case 'tornado':
                vm.icon = 'M';
                break;
                // Icon ID: -
            case 'celsius':
                vm.icon = '*';
                break;
                // Icon ID: -
            case 'n/a':
                vm.icon = ')';
                vm.clickable = false;
                break;
                // Icon ID: -
            default:
                vm.icon = ')';
                vm.clickable = false;
                break;
        }
    }
}

export default fecMeteoIcon;
