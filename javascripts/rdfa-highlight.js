---
---
(function(){

    // TODO: shared css for both rdfa bookmarklets
    // for both scripts: can we figure out a way to display nested content
    // instead of just using uri refs, so that things are more readable?
    var base_url = "{{ site.url }}";

    // load shared RDFa/bookmark utilities
    var load_rdfa_utils = function (load_func) {
        //{% if site.debug %}
           console.log('loading rdfa utils');
        //{% endif %};
        var script = document.createElement("script");
        script.type = "text\/javascript";
        script.src =  base_url + "javascripts/rdfa_utils.js";
        script.onload = load_func;
        document.currentScript.parentNode.insertBefore(script, document.currentScript);
    };

    load_rdfa_utils(function() {
      // load jquery if not already available, then load rdf, then highlight
      rdfa_utils.load_jquery_and_rdf(highlight_rdfa);
      rdfa_utils.add_css(base_url + "css/rdfa-highlight.css");
    });

    function highlight_rdfa() {
        var subjects = document.data.getSubjects();

        // object relation contexts
        var context = rdfa_utils.rdf_object_context();

        // get RDF values and the corresponding html elements where they originated
        var value_origins = document.data.getValueOrigins();

        for (var i = 0; i < value_origins.length; i++) {
            var item = value_origins[i];
            var properties = document.data.getProperties(item.value);

            // explicitly skip the body element, since including it makes
            // formatting and display weird
            if (item.origin.tagName == 'BODY'
                // for now, also skip items with no properties (nothing to display)
                || properties.length === 0
                // also skip list elements
                || rdfa_utils.is_rdf_list(item.value)) {
                continue;
            }

            // only do mouseovers for elements inside the body (i.e., not head meta tags)
            if (document.body.contains(item.origin)) {
                var el = jQuery(item.origin);
                var s = item.value; // rdf subject
                el.addClass('rdfa-item');
                // create a div which will be displayed as a toooltip, and add rdf info
                div = jQuery('<div class="yui3-cssreset rdfa-tooltip"/>');
                rdfa_utils.add_subject_label(div, item.value);
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

                div.append(ul);
                el.append(div);
            }
        }

        jQuery('.rdfa-item').mouseover(function() {
            var el = jQuery(this);
            if (el.find('.rdfa-item:hover').length === 0) {
                el.addClass('rdfa-item-hover');
            }
        });
        jQuery('.rdfa-item').mouseout(function() {
            jQuery(this).removeClass('rdfa-item-hover');
        });
    }
})();
