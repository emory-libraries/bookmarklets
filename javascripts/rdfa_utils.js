---
---
/* rdfa utils */

var rdfa_utils = {
    debug: {% if  site.debug %}true{% else %}false{% endif %},
    base_url: "{{ site.url }}",
    jquery_min_version: "1.7.0",  // minimal version to install if not present
    load_javascript: function(url) {
        if (rdfa_utils.debug) { console.log('loading javascript ' + url); }
        var script = document.createElement("script");
        script.src = url;
        document.getElementsByTagName("head")[0].appendChild(script);
        return script;  // return so we can check when it's loaded
    },

    load_jquery_and_rdf: function(load_func) {
        rdfa_utils.load_jquery(function() {
            rdfa_utils.load_rdf(load_func);
        });
    },

    load_jquery: function(load_func) {
        // add jquery if not already available
        if (window.jQuery === undefined || window.jQuery.fn.jquery < rdfa_utils.jquery_min_version) {
            var script = rdfa_utils.load_javascript("//ajax.googleapis.com/ajax/libs/jquery/" + rdfa_utils.jquery_min_version + "/jquery.min.js");
            script.onload = load_func();
            script.onreadystatechange = function() {
                if (this.readyState == 'complete') load_func();
            };
        } else {
            load_func();
        }

    },

    load_rdf: function(load_func) {
        // load GreenTurtle javascript RDFa if not available
        if (document.data === undefined) {
            // load rdfa library and then trigger bookmarklet
            rdfa_utils.load_javascript(rdfa_utils.base_url + "javascripts/RDFa.min.1.2.0.js");
            document.addEventListener("rdfa.loaded", load_func, false);
        } else {
            // if javascript rdfa is already available, simply launch
            // user function
            load_func();
        }
    },


    add_css: function(url) {
        // if CSS has already been added to document, do nothing
        if (jQuery('link[href="' + url + '"]').length) { return; }
        if (rdfa_utils.debug) { console.log('adding css ' + url); }
        var link = document.createElement("link");
        link.href = url;
        link.rel = "stylesheet";
        link.type = "text/css";
        link.media = "screen";
        document.getElementsByTagName("head")[0].appendChild(link);
    },

    add_subject_label: function(parent, subject) {
        // create a heading & label for a subject
        // displays first schema.org/name, if any, and uri (if not a blank node)
        var names = document.data.getValues(subject, 'http://schema.org/name');
        var header = jQuery("<div/>").addClass('header');
        var h3 = jQuery("<h3/>");
        var label = '';
        var anchor = jQuery("<a/>").attr('name', subject);
        if (names.length) {
            label = names[0];
        }
        // if subject is a URI or label is still empty, include URI in label
        if (subject.indexOf('http') === 0 || label === '') {
            if (label !== '') { label += ' - '; }
            // TODO: link to actual resource?
            label += subject;
        }
        anchor.text(label);
        h3.append(anchor);
        header.append(h3);
        parent.append(header);
    },

    rdf_object_context: function() {
        // generate a mapping of object relation contexts
        // (since turtle API doesn't seem to expose this functionality)
        // lookup via object: object -> predicate, subject
        var context = {};
        var subjects = document.data.getSubjects();
        for (var i = 0; i < subjects.length; i ++) {
            var s = subjects[i];
            var properties = document.data.getProperties(s);
            for (var j = 0; j < properties.length; j++) {
                var p = properties[j];
                var values = document.data.getValues(s, p);
                for (var k = 0; k < values.length; k++) {
                    var val = values[k];
                    var is_subject = (subjects.indexOf(val) != -1);
                    if (is_subject) {
                        // NOTE: shorten only works for predefined prefixes.
                        // Not evident how to get graph prefixes/ns.
                        context[val] = Array(document.data.shorten(p)||p, s);
                    }
                }
            }
            // TODO: handle multiple contexts
        }
        return context;
    },

    rdf_first: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#first',
    rdf_rest: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest',
    rdf_nil: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#nil',

    is_rdf_list: function (subject) {
        // check if a subject is an rdf list
        var prop = document.data.getProperties(subject);
        return (prop.length == 2 &&
            prop.indexOf(rdfa_utils.rdf_first) !== -1 &&
            prop.indexOf(rdfa_utils.rdf_rest) !== -1);
    },
    rdf_list_li: function(subject, ul) {
        // recursively add li items to a list based on an rdf list
        var txt =  document.data.getValues(subject, rdfa_utils.rdf_first)[0];
        ul.append(jQuery('<li/>').text(txt));
        var next = document.data.getValues(subject, rdfa_utils.rdf_rest)[0];
        if (next != rdfa_utils.rdf_nil) {
            rdfa_utils.rdf_list_li(next, ul);
        }
    }



};
