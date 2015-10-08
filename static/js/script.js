function ajaxRequest(url, cfunc) {
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            cfunc(xmlhttp);
        }
    }
    xmlhttp.open("GET", url, true);
    xmlhttp.send(null);
}


function addOnloadEvent(func) {
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


function main() {
    // test();
    console.log("Main running.")
}


// addOnloadEvent(main);
