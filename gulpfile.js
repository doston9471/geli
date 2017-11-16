"use strict";
let gulp = require("gulp");

const RELEASE = "release";

gulp.task(RELEASE, function () {
  return gulp.src()
    .pipe()
    .pipe();
});


// Tasks:
// - BUMP_VERSION
//   - git stash
//   - git checkout develop
//   - git checkout -b version/bump-x.x.x
//   - bump version in all files
//   - git commit
//   - git push
//   - github open PR to develop
//   - git unstash
// - RELEASE
//  - search for pr from develop to master
//  - show which one are found / select one
//  - check if version does not exists already and is in every file the same
//  - merge pr (if approved)
//  - ask for title and description of release
//  - create new release
