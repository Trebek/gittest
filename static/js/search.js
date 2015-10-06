var postsUrl = "./data/posts.json";

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


function getMatches(arr, text) {
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
            weight = convertDate(weight.toString() + "-" + item.date);
            matches.push([item, weight]);
        }
    }
    matches = sortByWeightDesc(matches);
    // console.log(matches);
    return matches;
}


function convertDate(weight) {
    return parseInt(weight.replace(/-/g, ""));
}


function sortByDateDesc(array) {
    return array.sort(function(a, b) {
        return convertDate(b[0]["date"]) - convertDate(a[0]["date"]);
    });
}


function sortByWeightDesc(array) {
    return array.sort(function(a, b) {
        return b[1] - a[1];
    });
}


function buildLinkList(matches) {
    var html = "";
    for(var i = 0; i < matches.length; i++) {
        html += '<span class="result">' + matches[i][0].date + ' - <a href="' +
        matches[i][0].url + '">' + matches[i][0].title + '</a></span><br>';
    }
    return html;
}


function searchPosts() {
    ajaxRequest(postsUrl, handleSearch);
}


function handleSearch(xmlhttp) {
    var myArr = JSON.parse(xmlhttp.responseText);
    var query = document.getElementById("q").value;
    document.getElementById("q").value = "";
    var matches = getMatches(myArr, query);
    if (query.replace(/ /g, "") != "" && matches.length > 0) {
        document.getElementById("content").style.display = "none";
        document.getElementById("search-results").style.display = "block";
        // if (query.replace(/ /g, "") == "") {
        //     matches = sortByDateDesc(matches);
        // }
        document.getElementById("results-list").innerHTML = buildLinkList(matches);
    } else {
        document.getElementById("content").style.display = "block";
        document.getElementById("search-results").style.display = "none";
        document.getElementById("results-list").innerHTML = noMatches;
    }
}
