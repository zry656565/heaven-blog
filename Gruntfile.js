module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                separator: ';'
            },
            targets: {
                files: {
                    '<%= pkg.dstRoot %>/js/jquery.min.js': '<%= pkg.srcRoot %>/js/lib/jquery-1.11.1.min.js'
                }
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            targets: {
                files: {
                    '<%= pkg.dstRoot %>/js/arbor.min.js': [
                        '<%= pkg.srcRoot %>/js/arbor.js', '<%= pkg.srcRoot %>/js/arbor-tween.js',
                        '<%= pkg.srcRoot %>/js/graphics.js', '<%= pkg.srcRoot %>/js/arbor_main.js'
                    ],
                    '<%= pkg.dstRoot %>/js/index.min.js': '<%= pkg.srcRoot %>/js/index_main.js'
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // Default task(s).
    grunt.registerTask('default', ['concat', 'uglify']);

};