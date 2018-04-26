module.exports = function(grunt) {

	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			js: {
				src: [
					'src/Plugin.js',
					'src/**/*.js'
				],
				dest: 'dist/slick-ui.min.js'
			}
		},

		watch: {
			scripts: {
				files: [
					'src/Plugin.js',
					'src/**/*.js'
				],
				tasks: ['uglify'],
			},
		},
	});
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');
	// Default task(s).
	grunt.registerTask('default', ['uglify', 'watch']);

};
