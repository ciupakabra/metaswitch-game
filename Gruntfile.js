module.exports = function(grunt) {
	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			slick_ui: {
				src: [
					'src/slick-ui/Plugin.js',
					'src/slick-ui/**/*.js'
				],
				dest: 'build/slick-ui.min.js'
			},

			classes: {
				src: [
					'src/Network/node.js',
					'src/Panels/Panel.js',
					'src/*.js',
					'src/**/*.js',
					'!src/slick-ui/*.js',
					'!src/game.js'
				],
				dest: 'build/classes.min.js'
			},

			tutorial: {
				src: [
					'src/tutorial.js'
				],
				dest: 'build/tutorial.min.js'
			},

			game: {
				src: [
					'src/game.js'
				],
				dest: 'build/game.min.js'
			}
		},

		watch: {
			scripts: {
				files: [
					'src/*.js'
				],
				tasks: ['uglify'],
			},
		},
	});

	grunt.loadNpmTasks('grunt-contrib-uglify-es');
	grunt.loadNpmTasks('grunt-contrib-watch');
	// Default task(s).
	grunt.registerTask('default', ['uglify', 'watch']);
};
