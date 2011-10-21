var VERSION_TEXT = "1.0.517.954";
var FILE_TYPES = {
	//"doc": "doc|docx",
	"pdf": "pdf"
	//"pps": "pps",
	//"ppt": "ppt",
	//"tif": "tif|tiff"
};
var VIEWER_URL = 'http://txt.li/';
var pattern;
var provideMenu = false;
var targetHref;
var linkCheckId;
var options;

/**
 * Checks a link to see if it points to a potential txtbear supported file.
 * If so, rewrites the link to point to the Docs Viewer.
 */
function checkLink() {
	var href = this.href;
	if(pattern.test(href)) {
		// Show context menu on right click
		$(this).bind('contextmenu', function(e) {
			targetHref = href;
			$('#txtbear-cmenu')
				.removeClass('txtbear-hidden')
				.css({'left':e.pageX, 'top':e.pageY})[0]
				.focus();
			return false;
		});
		// Rewrite link
		this.href = VIEWER_URL + href;
		provideMenu = true;
	}
};

function handleDomUpdate(e) {
	if(linkCheckId == undefined) {
		linkCheckId = setTimeout(function() {
			$('a', e.target).each(checkLink);
			linkCheckId = undefined;
		}, 1000);
	}
}

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

	pattern = new RegExp('^([^\\?#]+\\.(' + getFileTypesPref().join('|')
		+ ')((#|\\?).*)?)|[^\\?#]+\\?.+(format|type)=pdf([&|#].*)?$', 'i');

	// Check all the links in the page
	$('a').each(checkLink);
	// Create context menu
	if(provideMenu) {
		var menu = $("<ul id='txtbear-cmenu' class='txtbear-hidden' tabindex='9999'/>");
		// Hide menu on blur
		menu.blur(function (e) {
			$(this).addClass('txtbear-hidden');
		});
		// Add open in new tab option
		var item = $("<li class='txtbear-cmenu-item'>" +
			chrome.i18n.getMessage('open_in_new_tab') + "</li>");
		item.click(function(e) {
			window.open(VIEWER_URL + targetHref);
			menu.blur();
		});
		menu.append(item);
		// Add download option
		var item = $("<li class='txtbear-cmenu-item'>" +
			chrome.i18n.getMessage('download') + "</li>");
		item.click(function (e) {
			window.location.href = targetHref + "#tb";
			menu.blur();
		});
		menu.append(item);
		// Add options shortcut
		var item = $("<li class='txtbear-cmenu-item'>" +
			chrome.i18n.getMessage('options') + "</li>");
		item.click(function (e) {
			window.open(chrome.extension.getURL("options.html"));
			menu.blur();
		});
		menu.append(item);
		$(document.body).append(menu);

		// Inject menu CSS
		var style = $('<style type="text/css"></style>');
		style.get(0).innerText =
			'#txtbear-cmenu {' +
			'  position: absolute;' +
			'  border: 1px solid #ccc;' +
			'  background: #f0f0f0;' +
			'  margin: 0;' +
			'  padding: 0;' +
			'  top: 0;' +
			'  left: 0;' +
			'  z-index: 10000;' +
			'  list-style-type: none;' +
			'  -webkit-box-shadow: #8B8B8B 0px 4px 10px;' +
			'}' +

			'#txtbear-cmenu:focus {' +
			'  outline: none;' +
			'}' +

			'.txtbear-cmenu-item {' +
			'  margin: 0;' +
			'  padding: 5px 7px;' +
			'  cursor: default;' +
			'  font-size: 13px;' +
			'  font-family: arial, san-serif;' +
			'  color: #000;' +
			'  -webkit-user-select: none;' +
			'  border-bottom: 1px solid #ddd;' +
			'}' +

			'.txtbear-cmenu-item:hover {' +
			'  background: #558be3;' +
			'  color: #fff;' +
			'}' +

			'.txtbear-cmenu-item:last-child {' +
			'  border-bottom: 0;' +
			'}' +

			'.txtbear-hidden {' +
			'  display: none;' +
			'}';
		$(document.head).prepend(style);
	}

	// Look for dom changes
	$(document.body).bind("DOMNodeInserted", handleDomUpdate);
}

// Request options first
var keys = [];
$.each(FILE_TYPES, function(key, value) {
	keys.push(key);
});
keys.push("domains");
chrome.extension.sendRequest({'type': 'option', 'keys': keys},
	function(result) {
		options = result;
		init();
	});
