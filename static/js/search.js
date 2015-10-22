/*******************************************************************************
    Search Object
*******************************************************************************/

var staticSearch = {
    dataPath: "./data/posts.json",
    inputId: "search-input",
    submitId: "search-submit",
    // sortId: "search-sort",
    sortIds: {"radioName": "search-sort", "relev": "search-sort-relev",
        "date": "search-sort-date", "preced": "search-sort-preced"},
    resultsId: "search-results",
    resultsTableId: "search-results-table",
    // sortBy: "relev",
    // precedance: false,
    lastQuery: "",
    lastSort: "relev",
    lastPreced: false,
    lastResults: [],
    searchData: [],
    ignoreWords: ["a", "an", "the", "of", "in", "is"],

    search: function() {
        var searchData = JSON.parse(utils.getSessionItem("searchData"));
        var query = utils.getElements("#" + this.inputId).value;
        var sortBy = getSortValue(this.sortIds.radioName);
        var preced = utils.getElements("#" + this.sortIds.preced).checked;
        var results;
        if ((query !== this.lastQuery) || (sortBy !== this.lastSort) ||
                (preced !== this.lastPreced)) {
            this.lastQuery = query;
            this.lastSort = sortBy;
            this.lastPreced = preced;
            results = searchFuzzy(searchData, query, sortBy, preced);
            if ((query.trim() != "") && (results.length > 0)) {
                // buildResultsTable(results);
                this.lastResults = results;
            } else {
                // this.lastResults = null;
                this.lastResults = searchData;
            }
        }
        return this.lastResults;
    },

    init: function() {
        if (typeof(utils.getSessionItem("searchData")) === 'undefined') {
            utils.loadStatic(this.dataPath, this.initData, "application/json");
        }
        console.log(utils.getSessionItem("searchData"));
    },

    initData: function(xml) {
        var data = JSON.parse(xml.responseText);
        data.sort(function(a, b) {
            return a.date < b.date;
        });
        utils.setSessionItem("searchData", JSON.stringify(data));
        console.log(utils.getSessionItem("searchData"));
    }
}


/*******************************************************************************
    Search Functions
*******************************************************************************/

function searchFuzzy(items, query, sortBy, preced) {
    var results = [];
    var i, n, x, weight, queryLength, modifier, modDecr;
    var item, tags, titleSplit, queryWord;

    var querySplit = prepareString(query);

    if (querySplit) {
        queryLength = 0;
        modDecr = 0;
        if (preced) {
            queryLength = querySplit.length;
            modDecr = 1;
        }
        for (i = 0; i < items.length; i++) {
        // for (i = items.length - 1; i > -1; i--) {
            item = items[i];
            titleSplit = prepareString(item.title);
            tags = item.tags;
            weight = 0;
            modifier = queryLength;
            for (n = 0; n < querySplit.length; n++) {
                queryWord = querySplit[n];
                weight += weighWordList(titleSplit, queryWord, modifier);
                weight += weighWordList(tags, queryWord, modifier);
                weight += weighWord(item.category, queryWord, modifier);
                modifier -= modDecr;
            }
            if (weight) {
                results.push([item, weight]);
            }
        }
        if (sortBy == "relev") {
            results = sortMatchesDesc(results);
        }
        return removeWeights(results);
    }
    return null;
}


function weighWord(value, queryWord, modifier) {
    var weight = 0;
    if (queryWord == value) {
        weight += (2 + modifier);
    } else if (value.search(queryWord) > -1) {
        weight += (1 + modifier);
    }
    return weight;
}


function weighWordList(splitString, queryWord, modifier) {
    var weight = 0;
    for (var i = 0; i < splitString.length; i++) {
        weight += weighWord(splitString[i], queryWord, modifier)
    }
    return weight;
}


function getSortValue(radioName) {
    // var radios = getElements(radioName, "name");
    var radios = utils.getElements(utils.formatString('[name="{0}"]', radioName));
    for (var i = 0; i < radios.length; i++) {
        if (radios[i].checked) {
            return radios[i].value;
        }
    }
}


function sortMatchesDesc(items) {
    return items.sort(function(a, b) {
        return b[1] - a[1];
    });
}


function removeWeights(items) {
    newItems = [];
    for (var i = 0; i < items.length; i++) {
        newItems.push(items[i][0]);
    }
    return newItems;
}


function prepareString(query) {
    var newQuery = query.toLowerCase();
    var ignoreWords = staticSearch.ignoreWords;
    newQuery = newQuery.trim() || newQuery.replace(/^\s+|\s+$/g, '');
    for (var i = 0; i < ignoreWords.length; i++) {
        var regEx = utils.formatString("\\s+{0}\\s+", ignoreWords[i]);
        regEx = new RegExp(regEx, "gm");
        newQuery = newQuery.replace(regEx,' ');
    }
    if (newQuery !== '') {
        return newQuery.split(' ');
    }
    return null;
}
