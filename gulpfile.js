// npm install browser-sync gulp --save-dev 
const { gulp, watch, series, parallel, src, dest} = require('gulp');
// Browser Sync (https://www.browsersync.io/docs/gulp)
var browserSync = require('/usr/local/lib/node_modules/browser-sync').create();

/**
 * [serve description]
 */
function serve() {

	// Serve files from the root of this project
	// https://www.browsersync.io/docs/options
	browserSync.init({
		baseDir: "./",
		browser: "firefox",
		server: true,
		port: 3010,
		open: "local",
		online: false
	});
	watch("knockoutcrud.js").on('change', browserSync.reload);
	watch("html.index").on('change', browserSync.reload);
	watch("js/*.js").on('change', browserSync.reload);
	watch("css/*.css").on('change', browserSync.reload);
};

exports.serve = series(serve);