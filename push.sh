#!/bin/sh

git config --global user.email "travis@travis-ci.org"
git config --global user.name "Travis CI"
git remote add origin-pages https://${PUSH_BACK}@github.com/Cimpress/react-cimpress-comment.wiki.git > /dev/null 2>&1
git fetch origin-pages
git checkout -b origin-pages/master
git reset --hard origin-pages/master
git add ./backstop_data/bitmaps_test/* -f
git add ./backstop_data/html_report/* -f
git commit --message "Travis build: $TRAVIS_BUILD_NUMBER"
git push --quiet --set-upstream origin-pages gh-pages
