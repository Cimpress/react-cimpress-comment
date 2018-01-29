#!/bin/sh

git config --global user.email "travis@travis-ci.org"
git config --global user.name "Travis CI"
git remote add origin-pages https://${PUSH_BACK}@github.com/Cimpress/react-cimpress-comment > /dev/null 2>&1
git fetch origin-page
git reset --hard origin-page/gh-pages
git checkout -b gh-pages
git add ./backstop_data/bitmaps_test/* -f
git add ./backstop_data/html_report/* -f
git commit --message "Travis build: $TRAVIS_BUILD_NUMBER"
git push --quiet --set-upstream origin-pages gh-pages
