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
    webpack = require("webpack"),
    svg2png = require("gulp-svg2png"),
    modernizr = require("gulp-modernizr"),
    imagemin = require("gulp-imagemin"),
    usemin = require("gulp-usemin"),
    rev = require("gulp-rev"),
    cssnano = require("gulp-cssnano"),
    uglify = require("gulp-uglify");

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

gulp.task("previewDist", function() {
    browserSync.init({
        notify: false,
        server: {
            baseDir: "docs"
        }
    });
});

gulp.task("cssInject", ["styles"], function() {
    return gulp.src("./app/temp/styles/styles.css")
        .pipe(browserSync.stream());
});

var config = {
    shape: {
        spacing: {
            padding: 1
        }
    },
    mode: {
        css: {
            variables: {
                replaceSvgWithPng: function() {
                    return function(sprite, render) {
                        return render(sprite).split(".svg").join(".png");
                    }
                }
            },
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

gulp.task("createPngCopy", ["createSprite"], function() {
    return gulp.src("./app/temp/sprite/css/*.svg")
        .pipe(svg2png())
        .pipe(gulp.dest("./app/temp/sprite/css"));
});

gulp.task("copySpriteGraphic", ["createPngCopy"], function() {
    return gulp.src("./app/temp/sprite/css/**/*.{svg,png}")
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

gulp.task("icons", ["beginClean", "createSprite", "createPngCopy", "copySpriteGraphic", "copySpriteCSS", "endClean"]);

gulp.task("scripts", ["modernizr"], function(callback) {
    webpack(require("./webpack.config.js"), function(err, stats) {
        if (err) {
            console.log(err.toString());
        }
        console.log(stats.toString());
        callback();
    });
});

gulp.task("scriptsRefresh", ["scripts"], function() {
    browserSync.reload();
});

gulp.task("modernizr", function() {
    return gulp.src(["./app/assets/styles/**/*.css", "./app/assets/scripts/**/*.js"])
        .pipe(modernizr({
            "options": [
                "setClasses"
            ]
        }))
        .pipe(gulp.dest("./app/temp/scripts/"));
});

gulp.task("deleteDistFolder", ["icons"], function() {
    return del("./docs");
});

gulp.task("copyGeneralFiles", ["deleteDistFolder"], function() {
    var pathsToCopy = [
        "./app/**/*",
        "!./app/index.html",
        "!./app/assets/images/**",
        "!./app/assets/styles/**",
        "!./app/assets/scripts/**",
        "!./app/temp",
        "!./app/temp/**"
    ]

    return gulp.src(pathsToCopy)
        .pipe(gulp.dest("./docs"));
});

gulp.task("optimizeImages", ["deleteDistFolder"], function() {
    return gulp.src(["./app/assets/images/**/*", "!./app/assets/images/icons", "!./app/assets/images/icons/**/*"])
        .pipe(imagemin({
            progressive: true,
            interlaced: true,
            multipass: true
        }))
        .pipe(gulp.dest("./docs/assets/images"));
});

gulp.task("useminTrigger", ["deleteDistFolder"], function() {
    gulp.start("usemin");
});

gulp.task('usemin', ['styles', 'scripts'], function() {
    return gulp.src("./app/index.html")
        .pipe(usemin({
            css: [function() {
                return rev()
            }, function() {
                return cssnano()
            }],
            js: [function() {
                return rev()
            }, function() {
                return uglify()
            }]
        }))
        .pipe(gulp.dest("./docs"));
});

gulp.task("build", ["deleteDistFolder", "copyGeneralFiles", "optimizeImages", "useminTrigger"]);
