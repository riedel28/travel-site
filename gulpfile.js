var gulp = require("gulp"),
    watch = require("gulp-watch"),
    postcss = require("gulp-postcss"),
    autoprefixer = require("autoprefixer"),
    cssvars = require("postcss-simple-vars"),
    nested = require("postcss-nested"),
    cssImport = require("postcss-import"),
    prettify = require("postcss-prettify"),
    browserSync = require("browser-sync").create(),
    mixins = require("postcss-mixins");

gulp.task("default", function() {
    console.log("Hooreay!");
});

gulp.task("html", function() {
    console.log("Imagine");
});

gulp.task("styles", function() {
    return gulp.src("./app/assets/styles/styles.css")
        .pipe(postcss([cssImport, mixins, cssvars, nested, autoprefixer, prettify]))
        .on("error", function(errorInfo) {
            console.log(errorInfo.toString());
            this.emit("end");
        })
        .pipe(gulp.dest("./app/temp/styles"));
});

gulp.task("watch", function() {

    browserSync.init({
        notify: false,
        server: {
            baseDir: "app"
        }
    });

    watch("./app/index.html", function() {
        browserSync.reload();
    });

    watch("./app/assets/styles/**/*.css", function() {
        gulp.start("cssInject");
    });

});

gulp.task("cssInject", ["styles"], function() {
    return gulp.src("./app/temp/styles/styles.css")
        .pipe(browserSync.stream());
});
