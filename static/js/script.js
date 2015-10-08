function loadStatic(url, cfunc) {
    var xhr;

    if ( window.XMLHttpRequest ) {
        xhr = new XMLHttpRequest();
    } else {
        xhr = new ActiveXObject('Microsoft.XMLHTTP');
    }

    xhr.open("GET", url, true);

    // var xmlhttp = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            cfunc(xhr);
        }
    }
    // xhr.open("GET", url, true);
    xhr.send(null);
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
