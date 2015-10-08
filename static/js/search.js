var postsUrl = "./data/posts.json";

var noMatches = "Sorry, couldn't find anything.";


function processSearch(e) {
    if (e.preventDefault) e.preventDefault();
    // console.log(e);
    loadStatic(postsUrl, handleSearch);
    return false;
}


function processButton(e) {
    if (e.preventDefault) e.preventDefault();
    // console.log(e);
    fillSearch(e.target.value);
    return false;
}


function processClear(e) {
    if (e.preventDefault) e.preventDefault();
    clearSearch();
    return false;
}


function watchForm() {
    var i;

    var form = document.getElementById("search-form");
    if (form.attachEvent) {
        form.attachEvent("submit", processSearch);
    } else {
        form.addEventListener("submit", processSearch);
    }

    var clearButton = document.getElementById("clear-button");
    if (clearButton.attachEvent) {
        clearButton.attachEvent("onclick", processClear);
    } else {
        clearButton.addEventListener("click", processClear);
    }

    var testButtons = document.getElementsByClassName("test-query");
    for (i = 0; i < testButtons.length; i++) {
        // console.log(testButtons[i].value);
        if (testButtons[i].attachEvent) {
            testButtons[i].attachEvent("onclick", processButton);
        } else {
            testButtons[i].addEventListener("click", processButton);
        }
    }
}


function getMatchesStrict(arr, text, sortby) {
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
                if (textSplit[n] == titleSplit[x]) {
                    weight += 1;
                }
            }
            if (tags.indexOf(textSplit[n]) > -1) {
                weight += 1
            }
            if (textSplit[n] == item.category) {
                weight += 1;
            }
        }
        if (weight) {
            matches.push([item, weight]);
        }
    }
    if (sortby == "relevance") {
        matches = weightByRelevance(matches);
    } else {
        matches = weightByDate(matches);
    }
    matches = sortMatchesDesc(matches);
    // console.log(matches);
    return matches;
}


function getMatchesFuzzy(arr, text, sortby) {
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
    if (sortby == "relevance") {
        matches = weightByRelevance(matches);
    } else {
        matches = weightByDate(matches);
    }
    matches = sortMatchesDesc(matches);
    // console.log(matches);
    return matches;
}


function getMatchesPrecedance(arr, query, sortby) {
    var matches = [];
    var i, n, x, item, weight, tags, mod, title, titleSplit;

    var querySplit = query.trim().toLowerCase().split(" ");
    var queryLength = querySplit.length;

    for (i = 0; i < arr.length; i++) {
        item = arr[i];
        weight = 0;
        title = item.title.toLowerCase()
        titleSplit =  title.split(" ");
        tags = item.tags;
        mod = queryLength;
        for (n = 0; n < querySplit.length; n++) {
            for (x = 0; x < titleSplit.length; x++) {
                if (titleSplit[x].search(querySplit[n]) > -1) {
                    weight += (1 + mod);
                }
            }
            for (x = 0; x < tags.length; x++) {
                if (tags[x].search(querySplit[n]) > -1) {
                    weight += (1 + mod);
                }
            }
            if (item.category.search(querySplit[n]) > -1) {
                weight += (1 + mod);
            }
            mod -= 1
        }
        if (weight) {
            matches.push([item, weight]);
        }
    }
    if (sortby == "relevance") {
        matches = weightByRelevance(matches);
    } else {
        matches = weightByDate(matches);
    }
    matches = sortMatchesDesc(matches);
    // console.log(matches);
    return matches;
}


// function convertDate(weight) {
//     return parseInt(weight.replace(/-/g, ""));
// }

function cleanDate(weight) {
    return weight.replace(/-/g, "");
}


function weightByRelevance(array) {
    array = [for (x of array) [x[0], parseInt(x[1].toString() +
        cleanDate(x[0].date))]];
    return array;
}


function weightByDate(array) {
    array = [for (x of array) [x[0], parseInt(cleanDate(x[0].date) +
        x[1].toString())]];
    return array;
}


function sortMatchesDesc(array) {
    return array.sort(function(a, b) {
        return b[1] - a[1];
    });
}


// function buildLinkList(matches) {
//     var html = "";
//     for(var i = 0; i < matches.length; i++) {
//         html += '<span class="result">' + matches[i][1].toString() +
//         ' - <a href="' + matches[i][0].url + '">' + matches[i][0].title +
//         '</a></span><br>';
//     }
//     return html;
// }


function buildLinkList(matches) {
    var html = "";
    for(var i = 0; i < matches.length; i++) {
        html += '<span class="result">' + matches[i][0].title + '</span><br>';
    }
    return html;
}


function searchPosts() {
    loadStatic(postsUrl, handleSearch);
}


function getSortValue() {
    var radios = document.getElementsByName('sortby');
    for (var i = 0, length = radios.length; i < length; i++) {
        if (radios[i].checked) {
            return radios[i].value;
        }
    }
}


function clearSearch() {
    document.getElementById("q").value = "";
}


function fillSearch(value) {
    document.getElementById("q").value = value;
}


function handleSearch(xmlhttp) {
    var myArr = JSON.parse(xmlhttp.responseText);
    var query = document.getElementById("q").value;
    // console.log(query.trim().toLowerCase().split(" "));
    // alert(query.trim().toLowerCase());
    // document.getElementById("q").value = "";
    var sortValue = getSortValue();
    // var matches = getMatchesStrict(myArr, query, sortValue);
    var matches = getMatchesFuzzy(myArr, query, sortValue);
    // var matches = getMatchesPrecedance(myArr, query, sortValue);
    if (query.trim() != "" && matches.length > 0) {
        document.getElementById("results-list").innerHTML = buildLinkList(matches);
    } else {
        document.getElementById("results-list").innerHTML = noMatches;
    }
}


addOnloadEvent(watchForm);
