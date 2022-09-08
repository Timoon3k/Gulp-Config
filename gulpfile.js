const { src, dest, series, parallel, watch } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const cssnano = require('gulp-cssnano');
const rename = require('gulp-rename');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const sourcemaps = require('gulp-sourcemaps');
const clean = require('gulp-clean');
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;

// Ścieżki tasków
const paths = {
	sass: './src/sass/**/*.scss',
	javaScript: './src/js/**/*.js',
	convertImages: 'src/img/*',
	dist: './dist',
	sassDest: './dist/css',
	javaScriptDest: './dist/js',
	imageminDest: 'dist/img',
};

// Kompilator SASS
function sassCompiler(done) {
	src(paths.sass)
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer())
		.pipe(cssnano())
		.pipe(rename({ suffix: '.min' }))
		.pipe(sourcemaps.write())
		.pipe(dest(paths.sassDest));

	done();
}

function javaScript(done) {
	src(paths.javaScript)
		.pipe(sourcemaps.init())
		.pipe(
			babel({
				presets: ['@babel/env'],
			})
		)
		.pipe(rename({ suffix: '.min' }))
		.pipe(uglify())
		.pipe(sourcemaps.write())
		.pipe(dest(paths.javaScriptDest));

	done();
}

// Konwenter zdjęć
function convertImages(done) {
	src(paths.convertImages).pipe(imagemin()).pipe(dest(paths.imageminDest));

	done();
}

// Usuwanie folderu dist
function cleanStuff(done) {
	src(paths.dist, { read: false }).pipe(clean());

	done();
}

function handleKits(done) {
	src(paths.convertImages).pipe(imagemin()).pipe(dest(paths.imageminDest));

	done();
}

// Liveserver
function startBrowserSync(done) {
	browserSync.init({
		server: {
			baseDir: './',
		},
	});
	done();
}

// Liveserver , aktualizacja danych w czasie rzeczywistym
function watchForChanges(done) {
	watch('./*.html').on('change', reload);
	watch([paths.sass, paths.javaScript], parallel(sassCompiler, javaScript)).on('change', reload);
	watch(paths.convertImages, convertImages).on('change', reload);
	done();
}

// Wywoływanie tasków
const mainFunctions = parallel(sassCompiler, javaScript, convertImages);
exports.cleanStuff = cleanStuff;
exports.default = series(mainFunctions, startBrowserSync, watchForChanges);
