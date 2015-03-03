Bookmarklets
============

Currently available bookmarklets:
- RDFa summary

For more information and installation instructions, see [bookmarklets github pages site](http://emory-libraries.github.io/bookmarklets/).


Developer Notes
---------------

To use your local copy of the bookmarklets, you should do the following:
- checkout the **gh-pages** branch 
- make sure you have jekyll installed
- run the site via jekyll, with development config options: 
  ```jekyll serve -w --config _dev-config.yml```

Currently bookmarks are made available through GitHub site pages in the gh-pages branch, with only the local javascript and css code mirrored to the master branch (which requires some manual merging and updating to keep them synchronized).  We may revisit this setup in future. 
