---
---
(function(){

    // todo: shared rdfa utils js for methods that will be useful to both
    // shared css also for reuse
    // use yahoo yui reset css on tooltip divs
    // for both scripts: can we figure out a way to display nested content
    // instead of just using uri refs, so that things are more readable?

    // NOTE: common functionality between rdf scripts; use jekyll template ?

    var v = "1.7.0";  // minimal version to install if not present
    var base_url = "{{ site.url }}";
    var debug = {% if  site.debug %}true{% else %}false{% endif %};

    // add jquery if not already available
    if (window.jQuery === undefined || window.jQuery.fn.jquery < v) {
      var script = load_javascript("//ajax.googleapis.com/ajax/libs/jquery/" + v + "/jquery.min.js");

      script.onload = function(){ load_rdf(); };
      script.onreadystatechange = function() {
        if (this.readyState == 'complete') load_rdf();
      };
    } else {
        load_rdf();
    }

    function load_rdf() {
        // load GreenTurtle javascript RDFa if not available
        if (document.data === undefined) {
            // load rdfa library and then trigger bookmarklet
            load_javascript(base_url + "javascripts/RDFa.min.1.2.0.js");
            document.addEventListener(
                "rdfa.loaded",
                function() { highlight_rdfa(); },
                false
            );
        } else {
            // if javascript rdfa is already available, simply launch bookmarklet
            highlight_rdfa();
        }

        // NOTE: using all: unset in CSS instead of yahoo ui reset
        // add_css("http://yui.yahooapis.com/3.18.1/build/cssreset-context/cssreset-context-min.css");
        add_css(base_url + "css/rdfa-highlight.css");
    }

    function load_javascript(url) {
        if (debug) { console.log('loading javascript ' + url); }
        var script = document.createElement("script");
        script.src = url;
        document.getElementsByTagName("head")[0].appendChild(script);
        return script;  // return so we can check when it's loaded
    }

    function add_css(url) {
        // if CSS has already been added to document, do nothing
        if (jQuery('link[href="' + url + '"]').length) { return; }
        if (debug) { console.log('adding css ' + url); }
        var link = document.createElement("link");
        link.href = url;
        link.rel = "stylesheet";
        link.type = "text/css";
        link.media = "screen";
        document.getElementsByTagName("head")[0].appendChild(link);
    }


    function add_subject_label(parent, subject) {
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
    }


    //copied from rdfa-inspect, move into utils
        var rdf_first = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#first';
        var rdf_rest = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest';
        var rdf_nil = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#nil';

        function is_rdf_list(subject) {
            var prop = document.data.getProperties(subject);
            return (prop.length == 2 &&
                prop.indexOf(rdf_first) !== -1 &&
                prop.indexOf(rdf_rest) !== -1);
        }
        function rdf_list_li(subject, ul) {
            // recursively add li items to a ul based on an rdf list
            var txt =  document.data.getValues(subject, rdf_first)[0];
            ul.append(jQuery('<li/>').text(txt));
            var next = document.data.getValues(subject, rdf_rest)[0];
            if (next != rdf_nil) {
                rdf_list_li(next, ul);
            }
        }


    function highlight_rdfa() {
        var subjects = document.data.getSubjects();

        // generate a mapping of object relation contexts
        // (since turtle API doesn't seem to expose this functionality)
        // lookup via object: object -> predicate, subject
        var context = {};
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
                        context[val] = Array(document.data.shorten(p), s);
                    }
                }
            }
        }

        // get RDF values and the corresponding html elements where they originated
        var value_origins = document.data.getValueOrigins();

        for (var i = 0; i < value_origins.length; i++) {
            var item = value_origins[i];
            var properties = document.data.getProperties(item.value);

            // explicitly skip the body element, since including it makes
            // formatting and display weird
            if (item.origin.tagName == 'BODY'
                // for now, also skip items with no properties (nothing to display)
                || properties.length == 0
                // also skip list elements
                || is_rdf_list(item.value)) {
                continue;
            }

            // only do mouseovers for elements inside the body (i.e., not head meta tags)
            if (document.body.contains(item.origin)) {
                var el = jQuery(item.origin);
                var s = item.value; // rdf subject
                el.addClass('rdfa-item');
                // create a div which will be displayed as a toooltip, and add rdf info
                div = jQuery('<div class="yui3-cssreset rdfa-tooltip"/>');
                add_subject_label(div, item.value);
                // add context information
                var ctx = context[s];
                var ctxdiv = jQuery('<div class="context"/>');
                ctxdiv.text(ctx[1] + ' ' + ctx[0] + ' ' + s);
                div.append(ctxdiv);

                var ul = jQuery("<ul/>");
                //copied directly from rdfa-inspect; move into shared code
                for (var j = 0; j < properties.length; j++) {
                    var prop = properties[j];
                    // NOTE: could optionally suppress schema.org/name since using it as label
                    // if (prop == 'http://schema.org/name') {
                    //     continue;
                    // }
                    var short_name = document.data.shorten(prop);
                    if (! short_name) {
                        short_name = prop;
                    }
                    var values = document.data.getValues(s, prop);
                    var is_subject;
                    var li = jQuery("<li/>");
                    li.append(jQuery("<span class='pred'/>").text(short_name));

                    // single value: display property + value
                    if (values.length == 1) {
                        var val = values[0];
                        is_subject = (subjects.indexOf(val) != -1);

                        // special case: check for rdf list
                        if (is_subject && is_rdf_list(val)) {
                            // use sublist for rdf list items, for better display
                            var sublist = jQuery('<ul class="sublist rdflist"/>');
                            rdf_list_li(val, sublist);
                            li.append(sublist);

                        } else if (is_subject && short_name != 'schema:url') {
                            li.append(jQuery('<a/>').attr('href', '#' + val).text(val));
                        } else {
                            li.append(jQuery("<span class='obj'/>").text(val));
                        }
                        ul.append(li);

                    // multiple values: display property with nested list of values
                    } else {
                        var li = jQuery("<li/>");
                        li.append(jQuery("<span class='pred'/>").text(short_name));
                        var sublist = jQuery("<ul/>").addClass("sublist");

                        for (var k = 0; k < values.length; k++) {
                            is_subject = (subjects.indexOf(values[k]) != -1);
                            var subli = jQuery("<li/>");

                            if (is_subject && short_name != 'schema:url') {
                                subli.append(jQuery('<a/>').attr('href', '#' + values[k]).text(values[k]));
                            } else {
                                subli.text(values[k]);
                            }

                        sublist.append(subli);
                        }
                        li.append(sublist);
                        ul.append(li);

                    }  // end multiple values
                } // end properties loop

                div.append(ul);
                el.append(div);
            }
        }

        jQuery('.rdfa-item').mouseover(function() {
            var el = jQuery(this);
            if (el.find('.rdfa-item:hover').length == 0) {
                el.addClass('rdfa-item-hover');
            }
        });
        jQuery('.rdfa-item').mouseout(function() {
            jQuery(this).removeClass('rdfa-item-hover');
        });
    }
})();
