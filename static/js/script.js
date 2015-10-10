var dataPath = "./data/posts.json";
var searchData;

var noMatches = "Sorry, couldn't find anything.";


/*******************************************************************************
    Utility Functions
*******************************************************************************/

function getElement(value, attr) {
    if ((attr === undefined) || (attr === "id")) {
        return document.getElementById(value);
    } else if (attr === "name") {
        return document.getElementByName(value);
    } else if (attr === "tag") {
        return document.getElementByTagName(value);
    } else if (attr === "class") {
        return document.getElementsByClassName(value);
    }
}


/*
    Loads a static file from a given url, and feeds it to the given callback.

    May also provide a mimetype. Added this because Github Pages returns a
    text/plain response, and JSON parsing was throwing a syntax warning without
    an application/json type.
*/
function loadStatic(url, func, mimetype) {
    var xhr;

    if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    } else {
        xhr = new ActiveXObject('Microsoft.XMLHTTP');
    }

    xhr.open("GET", url, true);

    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            func(xhr);
        }
    }

    if (mimetype != undefined) {
        xhr.overrideMimeType(mimetype);
    }

    xhr.send();
}


/*
    Attaches a handler to window.onload, while preserving any previously
    attached handlers.
*/
function addOnload(func) {
    if(window.attachEvent) {
        window.attachEvent('onload', func);
    } else {
        if(window.onload) {
            var curronload = window.onload;
            var newonload = function() {
                curronload();
                func();
            };
            window.onload = newonload;
        } else {
            window.onload = func;
        }
    }
}


/*
    Attaches an event handler for a given event to a given element.
*/
function addListener(elem, ev, func) {
    if (elem.attachEvent) {
        elem.attachEvent(ev, wrapHandler(func));
    } else {
        elem.addEventListener(ev, wrapHandler(func));
    }
}


/*
    Wraps an event handler. Calls `e.preventDefault`, and returns `false`.
*/
function wrapHandler(func) {
    function handler(e) {
        if (e.preventDefault) e.preventDefault();
        func(e);
        return false;
    }
    return handler;
}


function buildList(items) {
    var html = "";
    for(var i = 0; i < items.length; i++) {
        html += '<span class="result">' + items[i].title + '</span><br>';
    }
    return html;
}


/*******************************************************************************
    Search Functions
*******************************************************************************/

function getMatchesFuzzy(arr, text, sortBy) {
    var matches = [];
    var i, n, x, item, weight, tags;

    var textSplit = text.toLowerCase().split(" ");

    for (i = 0; i < arr.length; i++) {
        item = arr[i];
        weight = 0;
        titleSplit = item.title.toLowerCase().split(" ");
        tags = item.tags;
        for (n = 0; n < textSplit.length; n++) {
            for (x = 0; x < titleSplit.length; x++) {
                if (titleSplit[x].search(textSplit[n]) > -1) {
                    weight += 1;
                }
            }
            for (x = 0; x < tags.length; x++) {
                if (tags[x].search(textSplit[n]) > -1) {
                    weight += 1;
                }
            }
            if (item.category.search(textSplit[n]) > -1) {
                weight += 1;
            }
        }
        if (weight) {
            matches.push([item, weight]);
        }
    }
    if (sortBy == "relev") {
        matches = weightByRelevance(matches);
    } else {
        matches = weightByDate(matches);
    }

    matches = sortMatchesDesc(matches);

    return matches;
}


function getSortValue() {
    var radios = document.getElementsByName('sort-by');
    for (var i = 0; i < radios.length; i++) {
        if (radios[i].checked) {
            return radios[i].value;
        }
    }
}


// function weightByRelevance(array) {
//     array = [for (x of array) [x[0], parseInt(x[1].toString() +
//         cleanDate(x[0].date))]];
//     return array;
// }


// function weightByDate(array) {
//     array = [for (x of array) [x[0], parseInt(cleanDate(x[0].date) +
//         x[1].toString())]];
//     return array;
// }


// function sortMatchesDesc(array) {
//     return array.sort(function(a, b) {
//         return b[1] - a[1];
//     });
// }


// function cleanDate(weight) {
//     return weight.replace(/-/g, "");
// }


/*******************************************************************************
    Event Handlers
*******************************************************************************/

// function search(e) {
//     var query = document.getElementById("search-input").value;
//     var sortValue = getSortValue();
//     var matches = getMatchesFuzzy(window.searchData, query, sortValue);
//     if ((query.trim() != "") && (matches.length > 0)) {
//         document.getElementById("search-results").innerHTML = buildList(matches);
//     } else {
//         document.getElementById("search-results").innerHTML = noMatches;
//     }
// }


function clear(e) {
    var searchInput = document.getElementById("search-input");
    searchInput.value = "";
}


function processButton(e) {
    var searchInput = document.getElementById("search-input");
    searchInput.value = e.target.innerHTML;
}


function displayData(e) {
    var searchResults = document.getElementById("search-results");
    searchResults.innerHTML = buildList(window.searchData);
}


/*******************************************************************************
    Init Functions
*******************************************************************************/

function initButtons() {
    var searchButton = document.getElementById("search-button");
    addListener(searchButton, "click", displayData);
    addListener(searchButton, "onclick", displayData);

    var clearButton = document.getElementById("clear-button");
    addListener(clearButton, "click", clear);
    addListener(clearButton, "onclick", clear);

    var testButtons = document.getElementsByName("test-button");
    for (var i = 0; i < testButtons.length; i++) {
        addListener(testButtons[i], "click", processButton);
        addListener(testButtons[i], "onclick", processButton);
    }
}

function initData(xml) {
    window.searchData = JSON.parse(xml.responseText);
    // console.log(window.searchData);
}


/*******************************************************************************
    Main
*******************************************************************************/

function main() {
    // console.log("Scripts running.");
    // alert("Foobar!");
    loadStatic(dataPath, initData, "application/json");
    initButtons();
}

addOnload(main);
