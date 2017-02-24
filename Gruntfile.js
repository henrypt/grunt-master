module.exports = function (grunt) {
    var sassStyle = 'expanded';

    // LiveReload的默认端口号，你也可以改成你想要的端口号

    var lrPort = 35729;
    // 使用connect-livereload模块，生成一个与LiveReload脚本
    // <script src="http://127.0.0.1:35729/livereload.js?snipver=1" type="text/javascript"></script>
    var lrSnippet = require('connect-livereload')({ port: lrPort });
    // 使用 middleware(中间件)，就必须关闭 LiveReload 的浏览器插件
    var lrMiddleware = function (connect, options) {
        return [
          // 把脚本，注入到静态文件中
          lrSnippet,
          // 静态文件服务器的路径
          connect.static(options.base[0]),
          // 启用目录浏览(相当于IIS中的目录浏览)
          connect.directory(options.base[0])
        ];
    };
    // Project configuration.
    //  grunt.initConfig：定义各种模块的参数，每一个成员项对应一个同名模块。
    //  grunt.loadNpmTasks：加载完成任务所需的模块。
    //  grunt.registerTask：定义具体的任务。第一个参数为任务名，第二个参数是一个数组， 表示该任务需要依次使用的模块。
    //
    //  每个目标的具体设置，需要参考该模板的文档。
    //    • expand：如果设为true，就表示下面文件名的占位符（即*号）都要扩展成具体的文件名。
    //    • cwd：需要处理的文件（input）所在的目录。
    //    • src：表示需要处理的文件。如果采用数组形式，数组的每一项就是一个文件名，可以使用通配符。
    //    • dest：表示处理后的文件名或所在目录。
    //    • ext：表示处理后的文件后缀名。
    //  grunt常用模块：
    //    • grunt-contrib-clean：删除文件。
    //    • grunt-contrib-compass：使用compass编译sass文件。
    //    • grunt-contrib-concat：合并文件。
    //    • grunt-contrib-copy：复制文件。
    //    • grunt-contrib-cssmin：压缩以及合并CSS文件。
    //    • grunt-contrib-imagemin：图像压缩模块。
    //    • grunt-contrib-jshint：检查JavaScript语法。
    //    • grunt-contrib-uglify：压缩以及合并JavaScript文件。
    //    • grunt-contrib-watch：监视文件变动，做出相应动作。
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        //清除目录
        clean: {
            all: ['dist/html/**', 'dist/*.*'],
            image: 'dist/html/images',
            css: 'dist/html/css',
            html: 'dist/html/**/*'
        },
        sass: {
            output: {
                options: { style: sassStyle },
                files: { './style.css': './scss/style.scss' }
            }
        },
        copy: {
            src: {
                files: [
                  {
                      expand: true,
                      cwd: 'src',
                      src: ['*.html'],
                      dest: 'dist/html'
                  }
                ]
            },
            image: {
                files: [
                  {
                      expand: true,
                      cwd: 'src',
                      src: ['images/*.{png,jpg,jpeg,gif}'],
                      dest: 'dist/html'
                  }
                ]
            }
        },
        /*
        concat: {
          options: {separator: ''},
          dist: {
            src: ['./src/plugin.js','./src/plugin2.js'],
            dest: './global.js'
          }
        },
        */
        concat: {
            options: {
                separator: ';',
                stripBanners: true
            },
            js: {
                src: ["src/js/*.js"],
                dest: "dist/html/js/app.js"
            },
            css: {
                src: ["src/css/*.css"],
                dest: "dist/html/css/main.css"
            }
        },
        /*
        uglify: {
          compressjs: {
            files: {
              './global.min.js': ['./global.js']
            }
          }
        },
        */
        //压缩JS
        uglify: {
            prod: {
                options: {
                    mangle: {
                        except: ['require', 'exports', 'module', 'window']
                    },
                    compress: {
                        global_defs: {
                            PROD: true
                        },
                        dead_code: true,
                        pure_funcs: [
                          "console.log",
                          "console.info"
                        ]
                    }
                },
                files: [{
                    expand: true,
                    cwd: 'dist/html',
                    src: ['js/*.js', '!js/*.min.js'],
                    dest: 'dist/html'
                }]
            }
        },
        //压缩CSS
        cssmin: {
            prod: {
                options: {
                    report: 'gzip'
                },
                files: [
                  {
                      expand: true,
                      cwd: 'dist/html',
                      src: ['css/*.css'],
                      dest: 'dist/html'
                  }
                ]
            }
        },
        //压缩图片
        imagemin: {
            prod: {
                options: {
                    optimizationLevel: 7,
                    pngquant: true
                },
                files: [
                  { expand: true, cwd: 'dist/html', src: ['ges/*.{png,jpg,jpeg,gif,webp,svg}'], dest: 'dist/html' }
                ]
            }
        },

        // 处理html中css、js 引入合并问题
        usemin: {
            html: 'dist/html/*.html'
        },

        //压缩HTML
        htmlmin: {
            options: {
                removeComments: true,
                removeCommentsFromCDATA: true,
                collapseWhitespace: true,
                collapseBooleanAttributes: true,
                removeAttributeQuotes: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeOptionalTags: true
            },
            html: {
                files: [
                  { expand: true, cwd: 'dist/html', src: ['*.html'], dest: 'dist/html' }
                ]
            }
        },

        jshint: {
            all: ['./global.js']
        },
        sprite: {
            options: {
                //追加时间戳，默认不追加
                spritestamp: true
            },
            all: {
                // src: 'test_files/*.{jpg,png}',
                src: ['./css/images/sprites_file/*.png', './css/images/sprites_file/*.jpg'],
                dest: './css/images/sprite.basic.png',
                destCss: './css/images/sprites.css'
                // imgPath: '', //指定css样式表中 img路径
                //padding: 10,
                // algorithm: 'left-right', // 图标在 spriesheet中的排列方式
                //algorithmOpts: {sort: true} //图标排列 是否按顺序
                // engine: , 现在安装的是gm
                // imgOpts: {quality: 10}
                //可选: 指定CSS格式 (默认根据destCSS中的后缀设置格式)
                // (stylus, scss, scss_maps, sass, less, json, json_array, css)
                // cssFormat: ,
                // cssTemplate: ,
                // cssHandlebarsHelpers: ,
                // cssVarMap: ,
                // cssSpritesheetName: ,
                // cssOpts: ,
            }
        },
        watch: {
            client: {
                options: {
                    livereload: lrPort
                },
                files: ['*.html', 'css/*', 'js/*', 'images/**/*']
            },
            scripts: {
                files: ['./src/plugin.js', './src/plugin2.js'],
                tasks: ['concat', 'jshint', 'uglify']
            },
            sass: {
                files: ['./scss/style.scss'],
                tasks: ['sass']
            }
            //,
            // sprite:{
            //   files: ['./css/images/sprites_file/*.png', './css/images/sprites_file/*.jpg'],
            //   tasks:['spritesmith']
            // },
            /*
            livereload: {
              options: {
                  livereload: '<%= connect.options.livereload %>'
              },
              files: [
                  'index.html',
                  'style.css',
                  'js/global.min.js'
              ]
            }
            */
        },
        connect: {
            options: {
                port: 8000,
                open: true,
                livereload: 35729,
                hostname: 'localhost',
                // 物理路径(默认为. 即根目录) 注：使用'.'或'..'为路径的时，可能会返回403 Forbidden. 此时将该值改为相对路径 如：/grunt/reloard。
                base: '.'
            },
            livereload: {
                options: {
                    // 通过LiveReload脚本，让页面重新加载。
                    middleware: lrMiddleware
                }
            }

        }
    });

    // Load the plugin that provides the "uglify" task.
    //grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-spritesmith');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');

    // Default task(s).
    grunt.registerTask('outputcss', ['sass']);
    grunt.registerTask('concatjs', ['concat']);
    grunt.registerTask('compressjs', ['concat', 'jshint', 'uglify']);
    grunt.registerTask('watchit', ['sass', 'concat', 'jshint', 'uglify', 'connect', 'sprite', 'watch']);
    grunt.registerTask('live', ['connect', 'watch']);
    grunt.registerTask('default');

};
