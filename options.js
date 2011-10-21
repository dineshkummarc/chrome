var VERSION = "1";
var VERSION_TEXT = "1.0.517.954";
var FILE_TYPES = {
	//"doc": "doc, docx",
	"pdf": "pdf"
	//"pps": "pps",
	//"ppt": "ppt",
	//"tif": "tif, tiff"
};
var VIEWER_URL = 'http://txt.li/';

function getOption(key) {
	return localStorage[key];
}

function setOption(key, value) {
	localStorage[key] = value;
}

function isNewVersion() {
	return getOption("version") != VERSION;
}

function setDefaultOptions() {
	$.each(FILE_TYPES, function(key, value) {
		if(getOption(key) == undefined)
			setOption(key, 1);
	});
	setOption("version", VERSION);
	// No domains by default
	setOption("domains", "");
}

function getDomainsPref() {
	var domains = [];
	if(getOption("domains")) {
		domains = getOption("domains").split("\n");
	}
	domains.push("txt.li");
	domains.push("view.txtbear.com");
	return domains;
}

function getFileTypesPref() {
	// Lookup enabled formats.
	var typesList = [];
	$.each(FILE_TYPES, function(key, value) {
		if(getOption(key) == undefined || !!getOption(key)) {
			typesList.push(value);
		}
	});
	return typesList;
}

$(function() {
	if(isNewVersion()) {
		setDefaultOptions();
	}

	chrome.tabs.onUpdated.addListener(function(tabId, info) {
		if(info.url) {
			// skip download-pdfs from tb contextmenu
			if(new RegExp('#tb$').test(info.url)) {
				return;
			}
			// skip blocked domains
			if(new RegExp('https?:\\/\\/[^\\/]*(' + getDomainsPref().join('|') + ')')
				.test(info.url)) {
				return;
			}
			pattern = new RegExp('^([^\\?#]+\\.(' + getFileTypesPref().join('|')
				+ ')((#|\\?).*)?)|[^\\?#]+\\?.+(format|type)=pdf([&|#].*)?$', 'i');
			if(!pattern.test(info.url)) {
				return;
			}
			chrome.tabs.update(tabId, {url: VIEWER_URL + info.url});
		}
	});
});

