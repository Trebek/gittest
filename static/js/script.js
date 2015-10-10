dataPath = "./data/posts.json"


/*
    Utility Functions
*/


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

    if (mimetype != "undefined") {
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


/*
    Test Functions
*/

function doStuff(e) {
    var text = document.getElementById("user-input").value;
    var content = document.getElementById("content");
    content.innerHTML = text;
}


function displayData(xml) {
    var data = JSON.parse(xml.responseText);
    var content = document.getElementById("content");
    content.innerHTML = buildList(data);
}


function loadStuff(e) {
    loadStatic(dataPath, displayData, "application/json");
}


function watchButtons() {
    theButton = document.getElementById("the-button");
    dataButton = document.getElementById("get-data-button");
    addListener(theButton, "click", doStuff);
    addListener(dataButton, "click", loadStuff);
}


/*
    Main
*/

function main() {
    // console.log("Scripts running.");
    // alert("Foobar!");
    watchButtons();
}

addOnload(main);
