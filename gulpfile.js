var gulp = require("gulp");
var babel = require("gulp-babel");
var sequence = require("run-sequence");
var path = require("path");
var jade = require('gulp-jade');

var release = "./release";

var week1 = "./week1/";
var javascriptWeek1 = "week1-javascript";
var jadeWeek1 = "week1-jade";

gulp.task(javascriptWeek1, function() {
    return gulp
        .src(week1 + "**/*.js")
        .pipe(babel())
        .pipe(gulp.dest(path.join(release, "/week1")));
});
gulp.task(jadeWeek1, function() {
    return gulp
        .src(week1 + "**/*.jade")
        .pipe(jade())
        .pipe(gulp.dest(path.join(release, "/week1")));
});

var week2 = "./week2/";
var javascriptWeek2 = "week2-javascript";
var jadeWeek2 = "week2-jade";

gulp.task(javascriptWeek2, function() {
    return gulp
        .src(week2 + "**/*.js")
        .pipe(babel())
        .pipe(gulp.dest(path.join(release, "/week2")));
});
gulp.task(jadeWeek2, function() {
    return gulp
        .src(week2 + "**/*.jade")
        .pipe(jade())
        .pipe(gulp.dest(path.join(release, "/week2")));
});

var week3 = "./week3/";
var javascriptWeek3 = "week3-javascript";
var jadeWeek3 = "week3-jade";

gulp.task(javascriptWeek3, function() {
    return gulp
        .src(week3 + "**/*.js")
        .pipe(babel())
        .pipe(gulp.dest(path.join(release, "/week3")));
});
gulp.task(jadeWeek3, function() {
    return gulp
        .src(week3 + "**/*.jade")
        .pipe(jade())
        .pipe(gulp.dest(path.join(release, "/week3")));
});

gulp.task("default", function () {
    sequence(
        [ javascriptWeek1, javascriptWeek2, javascriptWeek3 ],
        [ jadeWeek1, jadeWeek2, jadeWeek3 ]
    );
});
