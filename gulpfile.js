var gulp = require("gulp");
var babel = require("gulp-babel");
var sequence = require("run-sequence");
var path = require("path");

var release = "./release";

var week1 = "./week1/";
var javascriptWeek1 = "week1-javascript";

gulp.task(javascriptWeek1, function() {
    return gulp
        .src(week1 + "**/*.js")
        .pipe(babel())
        .pipe(gulp.dest(path.join(release, "/week1")));
});

var week2 = "./week2/";
var javascriptWeek2 = "week2-javascript";

gulp.task(javascriptWeek2, function() {
    return gulp
        .src(week2 + "**/*.js")
        .pipe(babel())
        .pipe(gulp.dest(path.join(release, "/week2")));
});

var week3 = "./week3/";
var javascriptWeek3 = "week3-javascript";

gulp.task(javascriptWeek3, function() {
    return gulp
        .src(week3 + "**/*.js")
        .pipe(babel())
        .pipe(gulp.dest(path.join(release, "/week3")));
});

gulp.task("default", function () {
    sequence(
        [ javascriptWeek1, javascriptWeek2, javascriptWeek3 ]
    );
});
