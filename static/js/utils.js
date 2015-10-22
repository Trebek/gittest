var utils = {
    classRegExForm: '{0}\\s*|\\s*{0}',

    getElements: function(selector, getAll) {
        var char = selector[0];
        if (char != "[") {
            if ((char == "#") || (char == ".")) {
                if (!getAll) {
                    return document.querySelector(selector);
                } else {
                    return document.querySelectorAll(selector);
                }
            }
            return document.querySelectorAll(selector);
        } else {
            var selector = selector.substring(1, selector.length - 1);
            var values = selector.split("=");
            var attrib = values[0];
            var name = values[1].replace(/^"|"$/g, '');
            var docChildren = document.body.querySelectorAll("*");
            var results = [];
            for (var i = 0; i < docChildren.length; i++) {
                var node = docChildren[i];
                if (node.nodeName[0] != "#" && node.hasAttribute(attrib) &&
                        (node.getAttribute(attrib).search(name) > -1)) {
                    results.push(node);
                }
            }
            return results;
        }
    },

    loadStatic: function(url, func, mimetype) {
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

        if (mimetype != undefined) {
            xhr.overrideMimeType(mimetype);
        }

        xhr.send();
    },

    windowOnload: function(func) {
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
    },

    addListener: function(elem, ev, func, capture) {
        if (typeof capture == "undefined") {
            capture = false;
        }
        if (elem.attachEvent) {
            elem.attachEvent("on" + ev, this.wrapHandler(func), capture);
        } else {
            elem.addEventListener(ev, this.wrapHandler(func), capture);
        }
    },

    wrapHandler: function(func) {
        function handler(e) {
            if (e.preventDefault) e.preventDefault();
            func(e);
            return false;
        }
        return handler;
    },

    zip: function(arrays) {
        return arrays[0].map(function(_,i){
            return arrays.map(function(array){return array[i]})
        });
    },

    removeAllChildren: function(elem) {
        while (elem.firstChild) {
            elem.removeChild(elem.firstChild);
        }
    },

    getScrollTop: function() {
        return document.documentElement.scrollTop || document.body.scrollTop;
    },

    getViewWidth: function() {
        return Math.max(document.documentElement.clientWidth,
            window.innerWidth || 0)
    },

    getViewHeight: function() {
        return Math.max(document.documentElement.clientHeight,
            window.innerHeight || 0)
    },

    getViewSize: function() {
        return [viewWidth(), viewHeight()];
    },

    hasClass: function(element, className) {
        return element.className && new RegExp("(^|\\s)" + className +
            "(\\s|$)").test(element.className);
    },

    getSessionItem: function(key) {
        if(typeof(Storage) !== "undefined") {
            return window.sessionStorage.getItem(key);
        } else {
            console.log("No session support.")
        }
    },

    removeSessionItem: function(key) {
        if(typeof(Storage) !== "undefined") {
            return window.sessionStorage.removeItem(key);
        } else {
            console.log("No session support.")
        }
    },

    setSessionItem: function(key, value) {
        if(typeof(Storage) !== "undefined") {
            return window.sessionStorage.setItem(key, value);
        } else {
            console.log("No session support.")
        }
    },

    trimString: function(value) {
        return value.trim() || value.replace(/^\s+|\s+$/g, '');
    },

    formatString: function(form) {
        for (var i = 1; i < arguments.length; i++) {
            var regEx = new RegExp("\\{" + (i - 1) + "\\}", "gm");
            form = form.replace(regEx, arguments[i]);
        }
        return form;
    },

    addClass: function(elem) {
        if (elem.className === "") {
            elem.className = arguments[1];
        } else {
            elem.className += (" " + arguments[1]);
        }
        if (arguments.length > 2) {
            for (var i = 2; i < arguments.length; i++) {
                elem.className += (" " + arguments[i]);
            }
        }
    },

    removeClass: function(elem) {
        var regEx = new RegExp(this.formatString(this.classRegExForm,
            arguments[1]), "g");
        elem.className = elem.className.replace(regEx, "");
        if (arguments.length > 2) {
            for (var i = 2; i < arguments.length; i++) {
                regEx = new RegExp(this.formatString(this.classRegExForm,
                    arguments[i]), "g");
                elem.className = elem.className.replace(regEx, "");
            }
        }
        if (elem.className === "") {
            elem.removeAttribute("class");
        }
    },

    replaceClass: function(elem) {
        if (arguments.length > 3) {
            var argsJoined = [];
            for (var i = 2; i < arguments.length; i++) {
                argsJoined.push(arguments[i]);
            }
            argsJoined = argsJoined.join(" ")
            elem.className = elem.className.replace(arguments[1], argsJoined);
        } else {
            elem.className = elem.className.replace(arguments[1], arguments[2]);
        }
    }
}
