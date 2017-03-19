var gulp = require("gulp"),
    watch = require("gulp-watch"),
    postcss = require("gulp-postcss"),
    autoprefixer = require("autoprefixer"),
    cssvars = require("postcss-simple-vars"),
    nested = require("postcss-nested"),
    cssImport = require("postcss-import"),
    prettify = require("postcss-prettify"),
    browserSync = require("browser-sync").create(),
    mixins = require("postcss-mixins"),
    svgSprite = require("gulp-svg-sprite"),
    rename = require("gulp-rename"),
    del = require("del"),
    hexrgba = require("postcss-hexrgba"),
    webpack = require("webpack");

gulp.task("default", function() {
    console.log("Hooreay!");
});

gulp.task("html", function() {
    console.log("Imagine");
});

gulp.task("styles", function() {
    return gulp.src("./app/assets/styles/styles.css")
        .pipe(postcss([cssImport, mixins, cssvars, nested, hexrgba, autoprefixer, prettify]))
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

    watch("./app/assets/scripts/**/*.js", function() {
      gulp.start("scriptsRefresh");
    });

});

gulp.task("cssInject", ["styles"], function() {
    return gulp.src("./app/temp/styles/styles.css")
        .pipe(browserSync.stream());
});
//
var config = {
    mode: {
        css: {
            sprite: "sprite.svg",
            render: {
                css: {
                    template: "./app/templates/sprite.css"
                }
            }
        }
    }
}

gulp.task("beginClean", function() {
  return del(["./app/temp/sprite", "./app/assets/images/sprites"]);
});

gulp.task("createSprite", ["beginClean"], function() {
    return gulp.src("./app/assets/images/icons/**/*.svg")
        .pipe(svgSprite(config))
        .pipe(gulp.dest("./app/temp/sprite/"));
});

gulp.task("copySpriteGraphic", ["createSprite"], function() {
    return gulp.src("./app/temp/sprite/css/**/*.svg")
        .pipe(gulp.dest("./app/assets/images/sprites"));
});

gulp.task("copySpriteCSS", ["createSprite"], function() {
    return gulp.src("./app/temp/sprite/css/*.css")
        .pipe(rename("_sprite.css"))
        .pipe(gulp.dest("./app/assets/styles/modules"));
});

gulp.task("endClean", ["copySpriteGraphic", "copySpriteCSS"], function() {
  return del("./app/temp/sprite");
});

gulp.task("icons", ["beginClean", "createSprite", "copySpriteGraphic", "copySpriteCSS", "endClean"]);

gulp.task("scripts", function(callback) {
  webpack(require("./webpack.config.js"), function(err, stats) {
    if(err) {
      console.log(err.toString());
    }
    console.log(stats.toString());
    callback();
  });
});

gulp.task("scriptsRefresh", ["scripts"], function() {
  browserSync.reload();
});
