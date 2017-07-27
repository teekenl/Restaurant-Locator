(function () {
    "use strict";

    exports.apiKey = process.env.GOOGLE_PLACES_API_KEY || 'AIzaSyBYeoI9jOacSlRpLXaOrKmaBlayhSKISOk';
    exports.outputFormat = process.env.GOOGLE_PLACES_OUTPUT_FORMAT || "json";

})();