HighlightTextFilter.$inject = ['$sce'];

function HighlightTextFilter($sce) {

    var YYYYMMDD = /^([1-9]\d{3})(-)([0]\d{1}|[1][0-2])(-)([0-2]\d{1}|[3][0-1])$/;

    return function (haystack, needle) {
        if (!needle) {
            return $sce.trustAsHtml(haystack);
        }

        //if needle is a Date in format yyyy-MM-dd change it to format dd.MM.yyyy to match with the values formatted to date
        if (needle.match(YYYYMMDD)) {
            var dateSplited = needle.split('-');
            needle = dateSplited[2] + '.' + dateSplited[1] + '.' + dateSplited[0];
        }

        var cleanNeedle = needle.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
        var cleanHaystack = haystack.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();

        var match = '';
        var pattern = new RegExp(cleanNeedle, "gi");
        var positions = [];

        while (match = pattern.exec(cleanHaystack)) {
            positions.push({
                index: match.index,
                lastIndex: pattern.lastIndex
            });
        }

        var reversedPositions = _.reverse(positions);

        var haystackStart = '';
        var haystackNeedle = '';
        var haystackEnd = '';

        _.each(reversedPositions, function (item) {
            haystackStart = haystack.substring(0, item.index);
            haystackNeedle = haystack.substring(item.index, item.lastIndex);
            haystackEnd = haystack.substring(item.lastIndex);
            haystack = haystackStart + '<span class="highlightedText">' + haystackNeedle + '</span>' + haystackEnd;
        });

        return $sce.trustAsHtml(haystack);
    }
}

export default HighlightTextFilter;
