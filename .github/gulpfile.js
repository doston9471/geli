"use strict";
const gulp = require("gulp");
const git = require("gulp-git");
const sget = require("simple-get");

const RELEASE = "release";
const BUMP = "bump";

const versionFiles = [
  "../api/paackage.json",
  "../app/webFrontend/paackage.json"
];

gulp.task(RELEASE, function () {
  return gulp.src()
    .pipe()
    .pipe();
});

gulp.task(BUMP, function () {
  git
    .status({args: '--porcelain'}, errFnc(err))
    .checkout('develop', errFnc(err))
    .pull()
    .checkout('vbump/local', {args: '-b'}, errFnc(err))
  ;

  gulp
    .src(versionFiles)
    .pipe(bump({type: 'minor'})) // FIXME
    // .dest('.')
    .pipe(git.add(errFnc(err)))
    .pipe(git.commit('Bump version to xxx', errFnc(err))) // FIXME
    ;

  git
    .push('origin', errFnc(err))
    .checkout('develop', errFnc(err))
    .branch('vbump/local', {args: '--delete'}, errFnc(err))
  ;

  // TODO: Get user PW

  const body = {
    title: "Version Bump  xxx",
    body: "Bumps version to xxx",
    head: "vbump/local",
    base: "develop",
    headers: {
      authorization: "Basic " + btoa("user" + ":" + "pw")
    }
  };
  const opts = {
    url: 'https://api.github.com/repos/h-da/geli/pulls',
    method: 'post',
    body: JSON.stringify(body)
  };
  sget.post(opts, function (err, res) {
    if (err) throw err

  });
});

const errFnc = function (err) {
  if (err) throw err;
};


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
