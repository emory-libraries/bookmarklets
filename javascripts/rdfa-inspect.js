---
---
(function(){

    var base_url = "{{ site.url }}";
    var debug = {% if  site.debug %}true{% else %}false{% endif %};

    var v = "1.3.2";  //minimal version to install if not present

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
                function() { inspect_rdfa(); },
                false
            );
        } else {
            // if javascript rdfa is already available, simply launch bookmarklet
            inspect_rdfa();
        }

        add_css("//yui.yahooapis.com/3.12.0/build/cssreset-context/cssreset-context-min.css");
        add_css(base_url + "css/rdfa-inspect.css");
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
        parent.append(h3);
    }

    var rdf_first = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#first';
    var rdf_rest = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest';
    var rdf_nil = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#nil';

    function is_rdf_list(subject) {
        var prop = document.data.getProperties(subject);
        return (prop.length == 2 &&
            prop.indexOf(rdf_first) !== -1 &&
            prop.indexOf(rdf_rest) !== -1);
    }

    function rdf_list_text(subject) {
        // recursively generate text based on an rdf list
        var txt =  document.data.getValues(subject, rdf_first)[0];
        var next = document.data.getValues(subject, rdf_rest)[0];
        if (next != rdf_nil) {
            txt += ', ' + rdf_list_text(next);
        }
        // FIXME: should there be some indication that this is based on an rdf list?
        return txt;
    }


    function inspect_rdfa() {

        var subjects = document.data.getSubjects();
        // if document does not contain any triples, notify user and exit
        if (subjects.length === 0) {
            alert('No RDFa found on this page.');
            return;
        }
        // if div already exists from a previous run of bookmarklet on this page,
        // simple redisplay it and exit.
        if (jQuery('#rdfa-inspect').length !== 0) {
            jQuery('#rdfa-inspect').show();
            return;
        }

        // NOTE or possible TODO
        // might be useful to list prefixes & urls
        // prefixes available at document.data.prefixes
        // possibly an associative array with prefix -> uri ?
        // if not, use document.data.getMapping(prefix) to get uri

        // create a div with a close button
        var wrapper = jQuery("<div id='rdfa-inspect' class='yui3-cssreset'/>");
        var content_div = jQuery("<div class='card'/>");
        var close = jQuery("<a class='close' title='close'>x</a>");
        close.click(function() {jQuery("#rdfa-inspect").hide(); });
        wrapper.append(content_div);
        content_div.append(close);
        wrapper.append(jQuery("<h1>RDFa</h1>"));

        jQuery("body").append(wrapper);

        // display information from RDFa triples
        for (var i = 0; i < subjects.length; i++) {
            var s = subjects[i];

            // skip rdf lists - will be displayed as a comma-delimited text
            // list where originally referenced as a subject
            if (is_rdf_list(s)) {
                continue;
            }

            var sdiv = jQuery("<div/>");
            add_subject_label(sdiv, s);

            var ul = jQuery("<ul/>");

            var properties = document.data.getProperties(s);
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
                var li;

                // TODO: special handling for RDF lists?

                // single value: display property + value
                if (values.length == 1) {
                    var val = values[0];
                    is_subject = (subjects.indexOf(val) != -1);


                    var txt  = short_name + ' ';
                    li = jQuery("<li/>");
                    // special case: check for rdf list
                    if (is_subject && is_rdf_list(val)) {
                        li.text(txt + rdf_list_text(val));
                    } else if (is_subject && short_name != 'schema:url') {
                        li.text(txt).append(jQuery('<a/>').attr('href', '#' + val).text(val));
                    } else {
                        li.text(txt + val);
                    }
                    ul.append(li);

                // multiple values: display property with nested list of values
                } else {
                    li = jQuery("<li/>").text(short_name);
                    var sublist = jQuery("<ul/>");

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

            sdiv.append(ul);
            content_div.append(sdiv);
        } // end subjects loop

    } // end inspect_rdfa

})();