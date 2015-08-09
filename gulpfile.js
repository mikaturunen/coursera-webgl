var gulp = require("gulp");
var babel = require("gulp-babel");

var javascriptSources = [
    "./week1",
    "./week2",
    "./week3"
];

gulp.task("default", function () {
    return gulp
        .src(javascriptSources)
        .pipe(babel())
        .pipe(gulp.dest("release"));
});
