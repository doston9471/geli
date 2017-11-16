"use strict";
const gulp = require("gulp");
const git = require("gulp-git");
const sget = require("simple-get");
const semver = require("semver");
const userName = require("git-user-name");
const readline = require("readline");
const fs = require("fs");

const RELEASE = "release";
const BUMP = "bump";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const versionFiles = [
  "../api/package.json",
  "../app/webFrontend/package.json"
];

gulp.task(RELEASE, function () {
  return gulp.src()
    .pipe()
    .pipe();
});

gulp.task(BUMP, function () {
  const pkg = JSON.parse(fs.readFileSynch(versionFiles[0]));
  const ghUser = userName();

  rl.question('What type? [major|minor|patch|prerelease] ', function (answer) {
    const newVersion = semver.inc(pkg.version, answer);
    const branch = "vbump/" + newVersion;

    git
      .status({args: '--porcelain'}, errFnc(err))
      .checkout('develop', errFnc(err))
      .pull()
      .checkout(branch, {args: '-b'}, errFnc(err))
    ;

    gulp
      .src(versionFiles)
      .pipe(bump({version: newVersion}))
      // .dest('.')
      .pipe(git.add(errFnc(err)))
      .pipe(git.commit('Bump version to ' + newVersion, errFnc(err)))
    ;

    git
      .push('origin', errFnc(err))
      .checkout('develop', errFnc(err))
      .branch(branch, {args: '--delete'}, errFnc(err))
    ;

    rl.question('Your Github password: ', function (answer) {
      if (!answer) return -1;

      const body = {
        title: "Version Bump " + newVersion,
        body: "Bumps version to " + newVersion,
        head: branch,
        base: "develop",
        headers: {
          authorization: "Basic " + btoa(ghUser + ":" + answer)
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
