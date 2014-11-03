module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        shell: {
            serve: {
                command: 'jekyll serve --watch'
            }
        },
        concat: {
            options: {
                separator: ';'
            },
            js: {
                files: {
                    '<%= pkg.dstRoot %>/js/jquery.min.js': '<%= pkg.srcRoot %>/js/lib/jquery-1.11.1.min.js',
                    '<%= pkg.dstRoot %>/js/arbor.js': '<%= pkg.srcRoot %>/js/arbor.js',
                    '<%= pkg.dstRoot %>/js/arbor-tween.js': '<%= pkg.srcRoot %>/js/arbor-tween.js',
                    '<%= pkg.dstRoot %>/js/graphics.js': '<%= pkg.srcRoot %>/js/graphics.js',
                    '<%= pkg.dstRoot %>/js/arbor_main.js': '<%= pkg.srcRoot %>/js/arbor_main.js'
                }
            },
            css: {
                files: {
                    '_tmp/css/style.css': ['<%= pkg.srcRoot %>/css/*.css']
                }
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            targets: {
                files: {
                    
                }
            }
        },
        jshint: {
            files: [],
            options: {
                //console: true,
                //module: true
            }
        },
        watch: {
            files: ['<%= jshint.files %>'],
            tasks: ['jshint', 'qunit']
        },
        cssmin: {
            minify: {
                expand: true,
                cwd: '_tmp/css/',
                src: ['*.css', '!*.min.css'],
                dest: 'build/css/',
                ext: '.min.css'
            }
        }
    });

    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    // Default task(s).
    grunt.registerTask('build', ['jshint', 'concat', 'uglify', 'cssmin']);
    grunt.registerTask('serve', ['jshint', 'concat', 'uglify', 'cssmin', 'shell:serve']);
    grunt.registerTask('debug', ['shell:serve']);
};