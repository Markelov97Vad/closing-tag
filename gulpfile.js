const gulp = require('gulp');
const concatCss = require('gulp-concat-css');
const plumber = require('gulp-plumber');
const del = require('del');
const browserSync = require('browser-sync').create();
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const mediaquery = require('postcss-combine-media-query');
const cssnano = require('cssnano');
const htmlMinify = require('html-minifier');
const sass = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const babel = require('gulp-babel');

const pathConfig = {
  html: 'src/**/*.html',
  css: 'src/**/*.css',
  fonts: 'src/fonts/**/*.{woff,woff2}',
  image: 'src/images/**/*.{jpg,png,svg,gif,ico,webp,avif}',
  build: './dist',
  styleFile: 'styles.css',
  pug: 'src/pages/**/*.pug',
  js: 'src/scripts/**/*.js',
  scss: 'src/index.scss',
  pageScss: 'src/pages/**/*.scss'
}



function html() {
  const options = {
    removeComments: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    sortClassName: true,
    useShortDoctype: true,
    collapseWhitespace: true,
    minifyCSS: true,
    keepClosingSlash: true
  }

  return gulp.src(pathConfig.html) // откуда брать HTML-файлы.
        .pipe(plumber()) // Чтобы избежать ошибок при сборке
        .on('data', function(file) {
          const bufferFile = Buffer.from(htmlMinify.minify(file.contents.toString(), options));
          file.contents = bufferFile
          return file;
        })
        .pipe((gulp.dest('dist/'))) // точка назначения
        .pipe(browserSync.reload({stream: true})) // перезагрузка браузера при выполнении каждой команды
}


function serve() {
  browserSync.init({
    server: {
      baseDir: pathConfig.build
    }
  });
}

function scripts() {
	return gulp.src(pathConfig.js, {
      sourcemaps: true
    })
    .pipe(babel())
		.pipe(uglify())
		.pipe(concat('main.min.js'))
		.pipe(gulp.dest('dist/js/'))
    .pipe(browserSync.reload({stream: true}))
}

function images() {
  return gulp.src(pathConfig.image)
    .pipe(gulp.dest('dist/images'))
    .pipe(browserSync.reload({stream: true}));
}

function clean() {
  return del('dist');
}

function scss() {
  const plugins = [
    autoprefixer(),
    mediaquery(),
    cssnano()
  ];
  return gulp.src('src/**/*.scss')
        .pipe(sass())
        .pipe(plumber())
        .pipe(concatCss('bundle.css'))
        .pipe(postcss(plugins))
        .pipe(gulp.dest('dist/'))
        .pipe(browserSync.reload({stream: true}));
}
function fonts() {
  return gulp.src(pathConfig.fonts)
          .pipe(plumber())
          .pipe(gulp.dest('dist/fonts'))
          .pipe(browserSync.reload({stream: true}))
}

function watchFiles() {
  gulp.watch([pathConfig.html], html);
  gulp.watch([pathConfig.scss,'src/styles/scss'], scss);
  gulp.watch([pathConfig.js], scripts);
  gulp.watch([pathConfig.image], images);
}


const build = gulp.series(clean, gulp.parallel(html, scss, fonts, images, scripts));
const watchapp = gulp.parallel(build, watchFiles, serve);

exports.html = html;
exports.scss = scss; 
exports.images = images;
exports.clean = clean;

exports.build = build;
exports.watchapp = watchapp;
exports.default = watchapp;