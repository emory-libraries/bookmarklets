---
---
// namespace bookmarklet functionality within rdf_inspect
var rdfa_inspect = {

    base_url: "{{ site.url }}",
    css: "css/rdfa-inspect.css", // relative to base url

    // load shared RDFa/bookmark utilities
    load_rdfa_utils: function (load_func) {
        //{% if site.debug %}
           console.log('loading rdfa utils');
        //{% endif %};
        var script = document.createElement("script");
        script.type = "text\/javascript";
        script.src =  rdfa_inspect.base_url + "javascripts/rdfa_utils.js";
        script.onload = load_func;
        document.currentScript.parentNode.insertBefore(script, document.currentScript);
    },

    main: function() {
        // main bookmarklet functionality
        rdfa_utils.add_css(rdfa_inspect.base_url + rdfa_inspect.css);

        var subjects = document.data.getSubjects();

        // if document does not contain any triples, notify user and exit
        if (subjects.length === 0) {
            alert('No RDFa found on this page.');
            return;
        }
        // if div already exists from a previous run of bookmarklet on this page,
        // simply redisplay it and exit.
        if (jQuery('#rdfa-inspect').length !== 0) {
            jQuery('#rdfa-inspect').show();
            return;
        }

        // object relation contexts
        var context = rdfa_utils.rdf_object_context();

        // NOTE or possible TODO
        // might be useful to list prefixes & urls
        // prefixes available at document.data.prefixes
        // possibly an associative array with prefix -> uri ?
        // if not, use document.data.getMapping(prefix) to get uri

        // create a div with a close button
        var wrapper = jQuery("<div id='rdfa-inspect'/>");
        var content_div = jQuery("<div class='card'/>");
        var close = jQuery("<a class='close' title='close'>x</a>");
        close.click(function() {jQuery("#rdfa-inspect").hide(); });
        wrapper.append(content_div);
        content_div.append(close);
        wrapper.append(jQuery("<h1>RDFa</h1>"));

        jQuery("body").append(wrapper);

        // bind escape key to close the div
        jQuery(document).on('keydown.rdfa_inspect', function(event) {
            console.log(event);
            if (event.keyCode == 27) {
                jQuery('#rdfa-inspect').hide();
            }
        });

        // display information from RDFa triples
        for (var i = 0; i < subjects.length; i++) {
            var s = subjects[i];

            // skip rdf lists - will be displayed as a comma-delimited text
            // list where originally referenced as a subject
            if (rdfa_utils.is_rdf_list(s)) {
                continue;
            }

            var sdiv = jQuery("<div/>").addClass('section');
            rdfa_utils.add_subject_label_with_anchor(sdiv, s);
            // add context information
            rdfa_utils.add_context(s, context, sdiv);

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
                var li = jQuery("<li/>");
                li.append(jQuery("<span class='pred'/>").text(short_name));

                // single value: display property + value
                if (values.length == 1) {
                    var val = values[0];
                    is_subject = (subjects.indexOf(val) != -1);

                    // special case: check for rdf list
                    if (is_subject && rdfa_utils.is_rdf_list(val)) {
                        // use sublist for rdf list items, for better display
                        var sublist = jQuery('<ul class="sublist rdflist"/>');
                        rdfa_utils.rdf_list_li(val, sublist);
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

            sdiv.append(ul);
            content_div.append(sdiv);
        } // end subjects loop

    } // end inspect_rdfa

};


rdfa_inspect.load_rdfa_utils(function() {
  // load jquery + rdf, then run the bookmarklet logic
  rdfa_utils.load_jquery_and_rdf(rdfa_inspect.main);
});

