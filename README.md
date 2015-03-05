Bookmarklets
============

Currently available bookmarklets:
- Inspect RDFa

For more information and installation instructions, see [bookmarklets github pages site](http://emory-libraries.github.io/bookmarklets/).


Developer Notes
---------------

This project uses [git-flow](https://github.com/nvie/gitflow) branching conventions.

To use your local copy of the bookmarklets, you should do the following:
- make sure you are on the **develop** branch
- make sure you have [jekyll installed](http://jekyllrb.com/docs/installation/)
- run the site via jekyll, with flags to reload modified files and load
  the development config file: ```jekyll serve -w --config _dev-config.yml --port 4004```
- install the development version of the bookmarklet from your locally running
  version of the site, i.e. http://localhost:4004/

Bookmarklets are published through GitHub site pages, which are served out from
the gh-pages branch.  Following git-flow conventions, this should be an exact
replica of the master branch.  As a convenience, to update the gh-pages branch
from master and push it to github, you may want to configure the following alias
in your ``.git/config`` for this project:

    [alias]
        publish-pages = "!git checkout gh-pages && git merge master && git push origin gh-pages && git checkout -"

