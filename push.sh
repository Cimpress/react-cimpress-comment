#!/bin/sh

git config --global user.email "travis@travis-ci.org"
git config --global user.name "Travis CI"
git remote add origin-results https://${PUSH_BACK}@github.com/Cimpress/react-cimpress-comment.git > /dev/null 2>&1
git checkout -b results
git reset --hard origin-results/results
git add ./backstop_data/bitmaps_test/* -f
git add ./backstop_data/html_report/* -f
git add ./backstop_data/bitmaps_reference/* -f
git commit --message "Travis build: $TRAVIS_BUILD_NUMBER"
git push --quiet --set-upstream origin-results results
