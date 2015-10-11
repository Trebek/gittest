var dataPath = "./data/posts.json";
var searchData;

var noResults = "Sorry, couldn't find anything.";


/*******************************************************************************
    Utility Functions
*******************************************************************************/

function getElement(name, attrType) {
    if ((attrType === undefined) || (attrType === "id")) {
        return document.getElementById(name);
    } else if (attrType === "name") {
        return document.getElementsByName(name);
    } else if (attrType === "tag") {
        return document.getElementsByTagName(name);
    } else if (attrType === "class") {
        return document.getElementsByClassName(name);
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
        html += '<span class="result">' + items[i][0].title + '</span><br>';
    }
    return html;
}


// function buildResultsTable(items) {
//     var props = ["title", "tags"];
//     var table = getElement("results-table");
//
//     clearResultsTable();
//
//     // var tbody = table.getElementsByTagName('tbody')[0];
//     var tbody = getElement('tbody', 'tag')[0];
//
//     for (var i = 0; i < items.length; i++) {
//         var item = items[i][0];
//         // var row = tbody.insertRow(tbody.rows.length);
//         // var row = tbody.insertRow(tbody.length);
//         var row = tbody.insertRow(tbody.length);
//         for (var p = 0; p < props.length; p++) {
//             if (item.hasOwnProperty(props[p])) {
//                 var prop = props[p];
//                 var cell = row.insertCell();
//                 if (prop == "tags") {
//                     // var tags = item[prop].sort().join(", ");
//                     var tags = Array.sort(item[prop]).join(", ");
//                     var text = document.createTextNode(tags);
//                 } else {
//                     var text = document.createTextNode(item[prop]);
//                 }
//                 cell.appendChild(text);
//             }
//         }
//     }
// }

function buildResultsTable(items) {
    var props = ["title", "tags"];
    var table = getElement("results-table");

    clearResultsTable();

    // var tbody = table.getElementsByTagName('tbody')[0];
    var tbody = getElement('tbody', 'tag')[0];

    for (var i = 0; i < items.length; i++) {
        var item = items[i][0];
        // var row = tbody.insertRow(tbody.rows.length);
        var row = tbody.insertRow(tbody.length);
        // var row = document.createElement('TR');
        for (var p = 0; p < props.length; p++) {
            if (item.hasOwnProperty(props[p])) {
                var prop = props[p];
                // var cell = row.insertCell(p);
                // var cell = document.createElement('TD');
                if (prop == "tags") {
                    // var tags = item[prop].sort().join(", ");
                    var tags = Array.sort(item[prop]).join(", ");
                    var text = document.createTextNode(tags);
                } else {
                    var text = document.createTextNode(item[prop]);
                }
                var cell = row.insertCell(p);
                cell.appendChild(text);
                // row.appendChild(cell);
            }
        }
        // tbody.appendChild(row);
    }
}


function clearResultsTable() {
    var table = getElement("results-table");
    var tbody = getElement('tbody', 'tag')[0];
    var tbodyLength = tbody.length;

    // while (tbodyLength) {
    //     table.removeChild(tbody[--tbodyLength]);
    // }

    var tbodyNew = document.createElement('TBODY');
    tbody.parentNode.replaceChild(tbodyNew, tbody);
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
    var radios = getElement("sort-by", "name");
    for (var i = 0; i < radios.length; i++) {
        if (radios[i].checked) {
            return radios[i].value;
        }
    }
}


function weightByRelevance(items) {
    var new_items = [];
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        new_items.push([item[0], parseInt(item[1].toString() +
            cleanDate(item[0].date))]);
    }
    return new_items;
}


function weightByDate(items) {
    var new_items = [];
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        new_items.push([item[0], parseInt(cleanDate(item[0].date) +
            item[1].toString())]);
    }
    return new_items;
}


function sortMatchesDesc(array) {
    return array.sort(function(a, b) {
        return b[1] - a[1];
    });
}


function cleanDate(weight) {
    return weight.replace(/-/g, "");
}


/*******************************************************************************
    Event Handlers
*******************************************************************************/

function search(e) {
    var query = getElement("search-input").value;
    var sortValue = getSortValue();
    var matches = getMatchesFuzzy(window.searchData, query, sortValue);
    if ((query.trim() != "") && (matches.length > 0)) {
        getElement("results-message").style.display = "none";
        getElement("results-table").style.display = "table";
        // getElement("search-results").innerHTML = buildList(matches);
        buildResultsTable(matches);
    } else {
        clearResultsTable();
        getElement("results-table").style.display = "none";
        resultsMessage = getElement("results-message");
        resultsMessage.style.display = "block";
        resultsMessage.innerHTML = noResults;
    }
}


function clear(e) {
    var searchInput = getElement("search-input");
    searchInput.value = "";
}


function processButton(e) {
    var searchInput = getElement("search-input");
    searchInput.value = e.target.innerHTML;
}


function displayData(e) {
    var searchResults = getElement("search-results");
    searchResults.innerHTML = buildList(window.searchData);
}


/*******************************************************************************
    Init Functions
*******************************************************************************/

function initButtons() {
    var searchButton = getElement("search-button");
    addListener(searchButton, "click", search);
    addListener(searchButton, "onclick", search);

    var clearButton = getElement("clear-button");
    addListener(clearButton, "click", clear);
    addListener(clearButton, "onclick", clear);

    var testButtons = getElement("test-button", "name");
    for (var i = 0; i < testButtons.length; i++) {
        addListener(testButtons[i], "click", processButton);
        addListener(testButtons[i], "onclick", processButton);
    }
}

function initData(xml) {
    window.searchData = JSON.parse(xml.responseText);
}


/*******************************************************************************
    Main
*******************************************************************************/

function main() {
    // console.log("Scripts running.");
    loadStatic(dataPath, initData, "application/json");
    initButtons();
}

addOnload(main);
