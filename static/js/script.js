// function ajaxRequest(url, cfunc) {
//     var xmlhttp = new XMLHttpRequest();
//     xmlhttp.onreadystatechange = function() {
//         if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
//             cfunc(xmlhttp);
//         }
//     }
//     xmlhttp.open("GET", url, true);
//     xmlhttp.send(null);
// }


function main() {
    // test();
}


if(window.attachEvent) {
    window.attachEvent('onload', main);
} else {
    if(window.onload) {
        var curronload = window.onload;
        var newonload = function() {
            curronload();
            main();
        };
        window.onload = newonload;
    } else {
        window.onload = main;
    }
}
