var VERSION_TEXT = "1.1.1923.1856";
var FILE_TYPES = {
    //"doc": "doc|docx",
    "pdf": "pdf"
    //"pps": "pps",
    //"ppt": "ppt",
    //"tif": "tif|tiff"
};
var VIEWER_URL = 'http://txt.li/';
var patterns = [];
var options = [];

function getDomainsPref() {
    var domains = [];
    if(options["domains"]) {
        domains = options["domains"].split("\n");
    }
    domains.push("txt.li");
    domains.push("view.txtbear.com");
    return domains;
}

function getFileTypesPref() {
    // Lookup enabled formats.
    var typesList = [];
    $.each(FILE_TYPES, function(key, value) {
        if(options[key] == undefined || !!options[key]) {
            typesList.push(value);
        }
    });
    return typesList;
}

function init() {
    // Ignore checks on blacklisted domains
    if(new RegExp('(' + getDomainsPref().join('|') + ')$')
        .test(window.location.hostname)) {
        return;
    }

    var filetypes = getFileTypesPref();
    $.each(filetypes, function(key, value) {
        patterns.push('*://*/*.' + value);
        patterns.push('*://*/*format=' + value + '*');
        patterns.push('*://*/*type=' + value + '*');
    });

    // Create context menu
    chrome.contextMenus.create({
        "title": chrome.i18n.getMessage('download'),
        "contexts": ["link"],
        "targetUrlPatterns": patterns,
        "onclick": function (data, tab) {
            chrome.tabs.update(tab.id, {
                url: data.linkUrl + "#tb"
            });
        }
    });
    chrome.contextMenus.create({
        "title": chrome.i18n.getMessage('options'),
        "contexts": ["link"],
        "targetUrlPatterns": patterns,
        "onclick": function (data, tab) {
            chrome.tabs.create({
                url: "options.html"
            });
        }
    });
}

// Request options first
var keys = [];
$.each(FILE_TYPES, function(key, value) {
    keys.push(key);
});
keys.push("domains");
$.each(keys, function(key, value) {
    options[value] = getOption(value);
});
init();
