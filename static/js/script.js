var dataPath = "./data/posts.json";
var noResults = "Sorry, couldn't find anything.";


/*******************************************************************************
    Event Handlers
*******************************************************************************/

function search(e) {
    var results = staticSearch.search();
    if (results && (results.length > 0)) {
        buildResultsTable(results);
    } else {
        buildResultsTable(JSON.parse(utils.getSessionItem("searchData")));
    }
    var resultsTable = utils.getElements('#search-results-table');
    var resultsMsg = utils.getElements('#search-results-message');
    resultsTable.style.display = 'table';
    resultsMsg.style.display = 'none';
}


function clear(e) {
    var searchInput = utils.getElements("#search-input");
    searchInput.value = "";
}


function testButton(e) {
    var searchInput = utils.getElements("#search-input");
    searchInput.value = e.target.innerHTML;
}


/*******************************************************************************
    Init Functions
*******************************************************************************/

function initButtons() {
    var searchButton = utils.getElements('#' + staticSearch.submitId);
    utils.addListener(searchButton, "click", search);

    var clearButton = utils.getElements('#clear-button');
    utils.addListener(clearButton, "click", clear);

    var testButtons = utils.getElements('[name="test-button"]');
    for (var i = 0; i < testButtons.length; i++) {
        utils.addListener(testButtons[i], "click", testButton);
    }
}



/*******************************************************************************
    Table Building Functions
*******************************************************************************/

function buildList(results) {
    var html = "";
    for(var i = 0; i < results.length; i++) {
        html += '<span class="result">' + results[i].title + '</span><br>';
    }
    return html;
}


function buildResultsTable(results) {
    var props = ["title", "tags"];

    clearResultsTable();

    // var tbody = getElement('tbody', 'tag')[0];
    var tbody = utils.getElements("tbody")[0];

    for (var i = 0; i < results.length; i++) {
        var item = results[i];
        var row = tbody.insertRow(tbody.length);
        for (var p = 0; p < props.length; p++) {
            if (item.hasOwnProperty(props[p])) {
                var prop = props[p];
                var cell = row.insertCell(p);
                var text;
                if (prop == "tags") {
                    var tags = item[prop];
                    tags.sort(function(a, b) {
                        return a.localeCompare(b);
                    });
                    tags = tags.join(", ")
                    text = document.createTextNode(tags);
                } else {
                    text = document.createTextNode(item[prop]);
                }
                cell.appendChild(text);
            }
        }
    }
}


function clearResultsTable() {
    var table = utils.getElements("#search-results-table");
    var tbody = utils.getElements("tbody")[0];
    var tbodyLength = tbody.length;

    while (tbodyLength) {
        table.removeChild(tbody[--tbodyLength]);
    }

    var tbodyNew = document.createElement('TBODY');
    tbody.parentNode.replaceChild(tbodyNew, tbody);
}


/*******************************************************************************
    Main
*******************************************************************************/

function main() {
    staticSearch.init();
    initButtons();
}

utils.windowOnload(main);
