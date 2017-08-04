var gulp = require('gulp');
var rename = require('gulp-rename');
var postcss = require('gulp-postcss');
var cssgrace = require('cssgrace');
var autoprefixer = require('autoprefixer');
var sass = require('gulp-sass');
var config = require("./config/config.js");
var nodemon = require('gulp-nodemon')
var browserSync = require('browser-sync');

var minifyCss = require('gulp-minify-css');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin');
// var jshint = require('gulp-jshint');

var reload = browserSync.reload;

var watchPaths = {
    sass: ['./public/sass/**/*.scss'],
    js: ['./public/scripts/**/*.js'],
    distCss: ['./assets/css/**/*.css'],
    distJs: ['./dist/js/**/*.js'],
    node: ['app.js', 'routers/**/*.js', 'models/**/*.js', 'config/**/*.js', '*.ejs', 'views/**/*.ejs'],
    staticResources: ['views/**/*.*', 'assets/images/**/*.*', 'scripts/**/*.*'] //静态资源
};

var buildPath = {
    js: {
        inpath: "./public/scripts/**/*.js",
        outpath: "./build/scripts"
    },
    css: {
        inpath: "./public/css/**/*.css",
        outpath: "./build/css"
    },
    img: {
        inpath: "./public/images/**/*.{png,jpg,gif,jpeg}",
        outpath: "./build/images"
    }
}

//compress PNG/SVG/JPEG/GIF
gulp.task('imgmin', function() {
    return gulp.src(buildPath.img.inpath)
        .pipe(imagemin({
            optimizationLevel: 5, //类型：Number  默认：3  取值范围：0-7（优化等级）
            progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
            interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
            multipass: true //类型：Boolean 默认：false 多次优化svg直到完全优化
        }))
        .pipe(gulp.dest(buildPath.img.outpath));
});

//压缩混淆js
gulp.task('jsmin', function() {
    return gulp.src(buildPath.js.inpath)
        .pipe(uglify())
        .pipe(gulp.dest(buildPath.js.outpath))
})

//压缩css
gulp.task('cssmin', function() {
    return gulp.src(buildPath.css.inpath)
        .pipe(minifyCss({
            keepSpecialComments: 0
        }))
        .pipe(gulp.dest(buildPath.css.outpath))
});

gulp.task("build", ['imgmin', 'jsmin', 'cssmin']);

// 编译sass
gulp.task('sass', function() {
    // 自动补全配置项
    var autoprefixerOptions = {
        browsers: [
            '> 1%',
            'ie 7',
            'Firefox <= 20',
            'last 5 ios versions',
            'last 5 Android versions',
            'last 5 versions'
        ],
        cascade: false
    };
    var processors = [
        cssgrace,
        autoprefixer(autoprefixerOptions)
    ];
    return gulp.src('public/sass/app.scss')
        .pipe(sass())
        .on('error', sass.logError)
        .pipe(postcss(processors))
        .pipe(rename('app.css'))
        .pipe(gulp.dest('./public/css'))
});
gulp.task('watch', ['sass'], function() {
  gulp.watch(watchPaths.sass, ['sass']);
});
gulp.task('node', function() {
    nodemon({
        script: 'app.js',
        watch: watchPaths.nodeJs,
        // ext: "js ejs"
        ignore: ["gulpfile.js", "node_modules/**/*.*", "public/**/*.*", "logs/**/*.*", "dataService/**/*.*"]
    }).on("start", function() {
        // reload();
        setTimeout(function() {
            reload()
        }, 500)
    })
})

gulp.task('dev_server', ["node", "sass"], function() {

    browserSync.init({
        proxy: 'http://localhost:' + config.port,
        browser: 'chrome',
        port: 40000
    });

    gulp.watch(watchPaths.sass, ['sass']);
    // gulp.watch(watchPaths.ejs).on('change', reload);
    gulp.watch(watchPaths.distCss).on('change', reload);
    gulp.watch(watchPaths.js).on('change', reload);
})












//var gulp = require('gulp');
//var gutil = require('gulp-util');
//var rename = require('gulp-rename');
//var sequence = require('gulp-sequence');
//
//var minifyCss = require('gulp-minify-css');
//var ngAnnotate = require('gulp-ng-annotate');
//var uglify = require('gulp-uglify');
//var imagemin = require('gulp-imagemin');
//var jshint = require('gulp-jshint');
//
//var postcss = require('gulp-postcss');
//var cssgrace = require('cssgrace');
//var autoprefixer = require('autoprefixer');
//var gulpautoprefixer = require('gulp-autoprefixer');
//var sass = require('gulp-sass');
//var stripDebug = require('gulp-strip-debug');
//
//
//var target_folder = "PC_" + new Date().getTime();
//
//
//var source_folder = "./node_pc/";
//var h5_source_filder = "./h5/www";
//var type = gutil.env.type;
//var target_folder = gutil.env.target_folder ? gutil.env.target_folder : target_folder;
//var base_url = gutil.env.base ? gutil.env.base : "base";
//
//var build_folders = [
//    // 'build',
//    'config',
//    'middlewares',
//    'models',
//    'routers',
//    'views',
//    // 'public',
//    'wap'
//];
//
////gulp build --type
////处理需要build的路径文件源
//var source_folders = build_folders.map(function(x) {
//    return source_folder + x + "/**/*.*";
//});
//
////压缩pc源码
//var buildPcPath = {
//    // js: {
//    //     inpath: "./node_pc/public/scripts/utils/**/*.js",
//    //     outpath: "./" + target_folder + "/public/scripts/utils"
//    // },
//    utils: {
//        inpath: "./node_pc/public/scripts/utils/**/*.js",
//        outpath: "./" + target_folder + "/public/scripts/utils"
//    },
//    libs: {
//        inpath: "./node_pc/public/scripts/libs/**/*.js",
//        outpath: "./" + target_folder + "/public/scripts/libs"
//    },
//    modules: {
//        inpath: "./node_pc/public/scripts/modules/**/*.js",
//        outpath: "./" + target_folder + "/public/scripts/modules"
//    },
//    plugins: {
//        inpath: "./node_pc/public/scripts/plugins/**/*.js",
//        outpath: "./" + target_folder + "/public/scripts/plugins"
//    },
//    sass: {
//        inpath: "./node_pc/public/sass/app.scss",
//        outpath: "./" + target_folder + "/public/css"
//    },
//    img: {
//        inpath: "./node_pc/public/images/**/*.{png,jpg,gif,jpeg}",
//        outpath: "./" + target_folder + "/public/images"
//    }
//}
//
////compress PNG/SVG/JPEG/GIF
//gulp.task('pcimgmin', function() {
//    return gulp.src(buildPcPath.img.inpath)
//        .pipe(imagemin({
//            optimizationLevel: 5, //类型：Number  默认：3  取值范围：0-7（优化等级）
//            progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
//            interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
//            multipass: true //类型：Boolean 默认：false 多次优化svg直到完全优化
//        }))
//        .pipe(gulp.dest(buildPcPath.img.outpath));
//});
//
////压缩混淆js
//gulp.task('js', function() {
//    return gulp.src(['./node_pc/public/scripts/commonConfig.js', './node_pc/public/scripts/constant.js'])
//        .pipe(jshint())
//        .pipe(uglify())
//        .pipe(stripDebug())
//        .pipe(gulp.dest("./" + target_folder + "/public/scripts/"))
//})
//gulp.task("utils", function() {
//    return gulp.src(buildPcPath.utils.inpath)
//        .pipe(jshint())
//        .pipe(uglify())
//        .pipe(stripDebug())
//        .pipe(gulp.dest(buildPcPath.utils.outpath))
//});
//gulp.task("libs", function() {
//    return gulp.src(buildPcPath.libs.inpath)
//        // .pipe(jshint())
//        // .pipe(uglify())
//        // .pipe(stripDebug())
//        .pipe(gulp.dest(buildPcPath.libs.outpath))
//});
//gulp.task("modules", function() {
//    return gulp.src(buildPcPath.modules.inpath)
//        .pipe(jshint())
//        .pipe(uglify())
//        .pipe(stripDebug())
//        .pipe(gulp.dest(buildPcPath.modules.outpath))
//});
//gulp.task('plugins', function() {
//    return gulp.src(buildPcPath.plugins.inpath)
//        .pipe(gulp.dest(buildPcPath.plugins.outpath))
//});
//
//gulp.task('pcjsmin', ['js', 'utils', 'modules', 'libs', 'plugins']);
//
////压缩css
//gulp.task('pcsass', function() {
//    var autoprefixerOptions = {
//        browsers: [
//            '> 1%',
//            'ie 7',
//            'Firefox <= 20',
//            'last 5 ios versions',
//            'last 5 Android versions',
//            'last 5 versions'
//        ],
//        cascade: false
//    };
//    var processors = [
//        cssgrace,
//        autoprefixer(autoprefixerOptions)
//    ];
//    return gulp.src(buildPcPath.sass.inpath)
//        .pipe(sass())
//        .on('error', sass.logError)
//        .pipe(postcss(processors))
//        .pipe(minifyCss({
//            keepSpecialComments: 0
//        }))
//        .pipe(rename('app.css'))
//        .pipe(gulp.dest(buildPcPath.sass.outpath))
//});
//
//gulp.task("buildPC", ['pcimgmin', 'pcjsmin', 'pcsass']);
//
////压缩H5代码
//var buildH5Path = {
//    js: {
//        inpath: './h5/www/js/**/*.js',
//        outpath: "./" + target_folder + '/wap/'+ base_url +'/js'
//    },
//    sass: {
//        inpath: './h5/scss/app.scss',
//        outpath: "./" + target_folder + '/wap/'+ base_url +'/css'
//    },
//    font: {
//        inpath: './h5/www/font/**/*.*',
//        outpath: "./" + target_folder + '/wap/'+ base_url +'/font'
//    },
//    tpl: {
//        inpath: './h5/www/tpl/**/*.html',
//        outpath: "./" + target_folder + '/wap/'+ base_url +'/tpl'
//    },
//    lib: {
//        inpath: './h5/www/lib/**/*.*',
//        outpath: "./" + target_folder + '/wap/'+ base_url +'/lib'
//    },
//    img: {
//        inpath: './h5/www/img/**/*.{png,jpg,gif,jpeg}',
//        outpath: "./" + target_folder + '/wap/'+ base_url +'/img'
//    }
//}
//
////使用ng-annotate进行angular模块依赖自动注入, 引入模块自动加[],防止被混淆
//gulp.task('jsmin', function() {
//    return gulp.src([buildH5Path.js.inpath, "!./h5/www/js/constant.js"])
//        .pipe(ngAnnotate({ single_quotes: true }))
//        .pipe(stripDebug())
//        .pipe(jshint())
//        // .pipe(jshint.reporter("default"))
//        .pipe(uglify())
//        .pipe(gulp.dest(buildH5Path.js.outpath));
//});
//gulp.task('constant', function() {
//    return gulp.src("!./h5/www/js/constant.js")
//        .pipe(ngAnnotate({ single_quotes: true }))
//        .pipe(jshint())
//        .pipe(gulp.dest(buildH5Path.js.outpath));
//});
//gulp.task('lib', function() {
//    return gulp.src(buildH5Path.lib.inpath)
//        .pipe(gulp.dest(buildH5Path.lib.outpath))
//});
//gulp.task('font', function() {
//    return gulp.src(buildH5Path.font.inpath)
//        .pipe(gulp.dest(buildH5Path.font.outpath))
//});
////compress PNG/SVG/JPEG/GIF
//gulp.task('imgmin', function() {
//    return gulp.src(buildH5Path.img.inpath)
//        .pipe(imagemin({
//            optimizationLevel: 5, //类型：Number  默认：3  取值范围：0-7（优化等级）
//            progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
//            interlaced: true, //类型：Boolean 默认：false 隔行扫描gif进行渲染
//            multipass: true //类型：Boolean 默认：false 多次优化svg直到完全优化
//        }))
//        .pipe(gulp.dest(buildH5Path.img.outpath));
//});
////输出模板
//gulp.task('tpl', function() {
//    return gulp.src(buildH5Path.tpl.inpath)
//        .pipe(gulp.dest(buildH5Path.tpl.outpath))
//});
//gulp.task('index', function() {
//    return gulp.src('./h5/www/index.html')
//        .pipe(gulp.dest("./" + target_folder + '/wap/' + base_url));
//});
////css 压缩
//gulp.task('h5sass', function() {
//    gulp.src(buildH5Path.sass.inpath)
//        .pipe(sass())
//        .on('error', sass.logError)
//        .pipe(gulpautoprefixer({
//            browsers: [
//                '> 1%',
//                'last 5 ios versions',
//                'last 5 Android versions',
//                'last 5 versions'
//            ],
//            cascade: false
//        }))
//        .pipe(minifyCss({
//            keepSpecialComments: 0
//        }))
//        .pipe(rename({ extname: '.css' }))
//        .pipe(gulp.dest(buildH5Path.sass.outpath));
//});
//gulp.task('buildH5', ['jsmin', 'imgmin', 'lib', 'tpl', 'font', 'index', 'h5sass','constant'])
//
////拷贝PC代码到目标文件
//gulp.task('copyPCSource', function() {
//    return gulp.src(source_folders, { base: './node_pc' })
//        .pipe(gulp.dest(target_folder))
//});
////拷贝app.js文件到目标文件
//gulp.task('app', function() {
//    return gulp.src(source_folder + "app.js")
//        .pipe(gulp.dest(target_folder))
//});
////拷贝package.json文件到目标文件
//gulp.task('copyPackageJsonFile', function() {
//    return gulp.src(source_folder + "package_dev.json")
//        .pipe(rename('package.json'))
//        .pipe(gulp.dest(target_folder))
//});
//
//gulp.task("logs", function(){
//    return gulp.src("./node_pc/logs").pipe(gulp.dest(target_folder));
//})
///**
//    type 分四类
//        1.宝宝+密码登录版本
//        2.基金超市+密码登录版本
//        3.宝宝+信任登录版本
//        4.基金超市 + 信任登录版本
//    haswap 是否包含H5页面
//**/
////gulp build_notwap --target_folder qlbank
////gulp build_default --target_folder qlbank --base （h5 base url）
//gulp.task("build_default", sequence(['copyPCSource', 'app', 'copyPackageJsonFile', 'logs'], 'buildPC', 'buildH5'));
//gulp.task("build_notwap", sequence(['copyPCSource', 'app', 'copyPackageJsonFile', 'logs'], 'buildPC'));
