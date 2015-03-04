Bookmarklets
============

Currently available bookmarklets:
- RDFa summary

For more information and installation instructions, see [bookmarklets github pages site](http://emory-libraries.github.io/bookmarklets/).


Developer Notes
---------------

This project uses [git-flow](https://github.com/nvie/gitflow) branching conventions.

To use your local copy of the bookmarklets, you should do the following:
- make sure you are on the **develop** branch
- make sure you have [jekyll installed](http://jekyllrb.com/docs/installation/)
- run the site via jekyll, with flags to reload modified files and load
  the development config file: ```jekyll serve -w --config _dev-config.yml```
- install the development version of the bookmarklet from your locally running
  version of the site, i.e. http://localhost:4000/

Bookmarklets are published through GitHub site pages, which are served out from
the gh-pages branch.  Following git-flow conventions, this should be an exact
replica of the master branch.  To automatically push master to the gh-pages branch
on github whenever you push updates to GitHub, add the following to your
.git/config in the ```[remote "origin"]``` section:

    push = refs/heads/master:refs/heads/gh-pages
    push = refs/heads/master:refs/heads/master

Alternatively, you can create an alias to switch to the gh-pages branch, update
it from master, and then push it to GitHub:

    alias gh-publish="git checkout gh-pages && git merge master && git push origin gh-pages && git checkout -"



