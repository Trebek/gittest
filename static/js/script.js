/*
    Utility Functions
*/

function loadStatic(url, cfunc, mimetype) {
    var xhr;

    if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    } else {
        xhr = new ActiveXObject('Microsoft.XMLHTTP');
    }

    xhr.open("GET", url, true);

    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            cfunc(xhr);
        }
    }

    if (mimetype != "undefined") {
        xhr.overrideMimeType(mimetype);
    }

    xhr.send();
}


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


function addListener(obj, ev, func) {
    if (obj.attachEvent) {
        obj.attachEvent(ev, func);
    } else {
        obj.addEventListener(ev, func);
    }
}


/*
    Test Functions
*/

function doStuff(e) {
    if (e.preventDefault) e.preventDefault();
    content = document.getElementById("content");
    content.innerHTML = "FOOBAR!";
    return false;
}


function watchButton() {
    theButton = document.getElementById("the-button");
    addListener(theButton, "click", doStuff);
}


/*
    Main
*/

function main() {
    console.log("Scripts running.");
    alert("Foobar!");
    watchButton();
}

addOnload(main);
