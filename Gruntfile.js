module.exports = function(grunt) {
  grunt.initConfig({
    jshint: {
      options: {
        jshintrc: true
      },
      all: {
        src: ['app/**/*.js', 'server.js'],
        filter: 'isFile'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('build', ['jshint']);
};