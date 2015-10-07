var postsUrl = "data/posts.json";

var noMatches = "Sorry, couldn't find anything.";


function ajaxRequest(url, cfunc) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            cfunc(xmlhttp);
        }
    }
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}


function processSearch(e) {
    if (e.preventDefault) e.preventDefault();
    // console.log(e);
    ajaxRequest(postsUrl, handleSearch);
    // You must return false to prevent the default form behavior
    return false;
}


function watchForm() {
    var form = document.getElementById("search-form");
    if (form.attachEvent) {
        form.attachEvent("submit", processSearch);
    } else {
        form.addEventListener("submit", processSearch);
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
    ajaxRequest(postsUrl, handleSearch);
}


function getSortValue() {
    var radios = document.getElementsByName('sortby');
    for (var i = 0, length = radios.length; i < length; i++) {
        if (radios[i].checked) {
            return radios[i].value;
            // if (radios[i].value == "relevance") {
            //     continue;
            // } else {
            //     continue;
            // }
            // break;
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
    console.log(query.trim().toLowerCase().split(" "));
    // document.getElementById("q").value = "";
    var sortValue = getSortValue();
    // var matches = getMatchesStrict(myArr, query, sortValue);
    var matches = getMatchesFuzzy(myArr, query, sortValue);
    // var matches = getMatchesPrecedance(myArr, query, sortValue);
    if (query.replace(/ /g, "") != "" && matches.length > 0) {
        document.getElementById("results-list").innerHTML = buildLinkList(matches);
    } else {
        document.getElementById("results-list").innerHTML = noMatches;
    }
}


if(window.attachEvent) {
    window.attachEvent('onload', main);
} else {
    if(window.onload) {
        var curronload = window.onload;
        var newonload = function() {
            curronload();
            watchForm();
        };
        window.onload = newonload;
    } else {
        window.onload = main;
    }
}
