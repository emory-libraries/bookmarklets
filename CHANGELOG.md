Changelog
=========

1.1
---

- RDFa inspect now includes a list of the contexts where an item is
  referenced
- RDFa highlight now supports multiple contexts
- Common functionality between inspect and highlight bookmarklets
  consolidated into an RDFa utility script.

1.0.1
-----

- Bugfix for RDFa highlight: context predicates with prefixes not in the
  predefined set cannot be shortened and were displayed as 'null'; now
  displays the unshortened predicate for those URIs.

1.0
---

RDFa bookmarklet style overhaul, HTTPS support, escape key shortcut to close
summary view, and new bookmarklet for small inspecting RDFa sections within the
page context.

- As a metadata expert, I want to view a readable RDFa summary so that I can
  clearly distinguish different sections and repeated attributes in the data.
- As a metadata expert, I want to close the RDFa summary with a keyboard
  shortcut so I don't have to scroll all the way to the top to close the RDFa
  information panel on pages with a lot of metadata.
- As a metadata expert, I want to view a summary of RDFa content on secure
  (HTTPS) pages so that I can see the information without forcing my browser
  to load insecure content.
- As a metadata expert, I want to view individual sections of RDFa content so
  that I can inspect the RDFa generated alongside the content.



March 2015
----------
RDFa bookmarklet improvements

- Style overhaul for better display and readability.
- Bookmarklet can now be run on secure (HTTPS) content.
- Close the RDFa summary with the escape key.


Initial release, 2013
---------------------
- Basic bookmarklet for viewing RDFa on web pages.
