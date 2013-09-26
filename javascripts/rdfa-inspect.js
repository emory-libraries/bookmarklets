(function(){

    var v = "1.3.2";
    // add jquery if not already available
    if (window.jQuery === undefined || window.jQuery.fn.jquery < v) {
        load_javascript("http://ajax.googleapis.com/ajax/libs/jquery/" + v + "/jquery.min.js");
    }
    // load GreenTurtle javascript RDFa if not available
    if (document.data === undefined) {
        // load rdfa library and then trigger bookmarklet
        load_javascript("http://emory-libraries.github.io/bookmarklets/javascripts/RDFa.min.1.2.0.js");
        document.addEventListener(
            "rdfa.loaded",
            function() { inspect_rdfa(); },
            false
        );
    } else {
        // if javascript rdfa is already available, simply launch bookmarklet
        inspect_rdfa();
    }

    // TODO: need to host a copy of this somewhere referenceable
    add_css("http://yui.yahooapis.com/3.12.0/build/cssreset-context/cssreset-context-min.css");
    add_css("http://emory-libraries.github.io/bookmarklets/css/rdfa-inspect.css");

    function load_javascript(url) {
        var script = document.createElement("script");
        script.src = url;
        document.getElementsByTagName("head")[0].appendChild(script);
        console.log('added ' + url);
    }

    function add_css(url) {
        // if CSS has already been added to document, do nothing
        if ($("link[href=" + url + "]").length) { return; }
        var link = document.createElement("link");
        link.href = url;
        link.rel = "stylesheet";
        link.type = "text/css";
        link.media = "screen";
        document.getElementsByTagName("head")[0].appendChild(link);
        console.log('added CSS ' + url);
    }


    function add_subject_label(parent, subject) {
        // create a heading & label for a subject
        // displays first schema.org/name, if any, and uri (if not a blank node)
        var names = document.data.getValues(subject, 'http://schema.org/name');
        var h3 = $("<h3/>");
        var label = '';
        var anchor = $("<a/>").attr('name', subject);
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

    function inspect_rdfa() {

        var subjects = document.data.getSubjects();
        // if document does not contain any triples, notify user and exit
        if (subjects.length === 0) {
            alert('No RDFa found on this page.');
            return;
        }
        // if div already exists from a previous run of bookmarklet on this page,
        // simple redisplay it and exit.
        if ($('#rdfa-inspect').length !== 0) {
            $('#rdfa-inspect').show();
            return;
        }

        // create a div with a close button
        var div = $("<div id='rdfa-inspect' class='yui3-cssreset'/>");
        var close = $("<a class='close' title='close'>X</a>");
        close.click(function() {$("#rdfa-inspect").hide(); });
        div.append(close);
        div.append($("<h1>RDFa</h1>"));

        $("body").append(div);

        // display information from RDFa triples
        for (var i = 0; i < subjects.length; i++) {
            var sdiv = $("<div/>");

            var s = subjects[i];
            add_subject_label(sdiv, s);

            var ul = $("<ul/>");

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
                    li = $("<li/>");
                    if (is_subject && short_name != 'schema:url') {
                        li.text(txt).append($('<a/>').attr('href', '#' + val).text(val));
                    } else {
                        li.text(txt + val);
                    }
                    ul.append(li);

                // multiple values: display property with nested list of values
                } else {
                    li = $("<li/>").text(short_name);
                    var sublist = $("<ul/>");

                    for (var k = 0; k < values.length; k++) {
                        is_subject = (subjects.indexOf(values[k]) != -1);
                        var subli = $("<li/>");
                        if (is_subject && short_name != 'schema:url') {
                            subli.append($('<a/>').attr('href', '#' + values[k]).text(values[k]));
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
            div.append(sdiv);
        } // end subjects loop

    } // end inspect_rdfa

})();