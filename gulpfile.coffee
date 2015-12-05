del     = require 'del'
path    = require 'path'
gulp    = require 'gulp'
plumber = require 'gulp-plumber'
coffee  = require 'gulp-coffee'
pepper  = require 'gulp-pepper'
salt    = require 'gulp-salt'
gutil   = require 'gulp-util'
bump    = require 'gulp-bump'
debug   = require 'gulp-debug'
 
onError = (err) -> gutil.log err

gulp.task 'coffee', ->
    gulp.src ['coffee/**/*.coffee'], base: './coffee'
        .pipe plumber()
        .pipe debug title: 'coffee'
        .pipe pepper
            stringify: (info) -> 'chalk.blue("'+info.class + info.type + info.method + ' ► ")'
            paprika: 
                dbg: 'log'
            paprikaPrefix:  'chalk.gray("'
            paprikaPostfix: ':")'
        .pipe coffee(bare: true).on 'error', onError
        .pipe gulp.dest 'js/'
    
gulp.task 'bin', ->
    gulp.src ['bin/*.coffee'], base: '.'
        .pipe plumber()
        .pipe debug title: 'bin'
        .pipe coffee(bare: true).on 'error', onError
        .pipe gulp.dest '.'
                
gulp.task 'salt', ->
    gulp.src ['coffee/**/*.coffee', 'bin/*.coffee'], base: '.'
        .pipe plumber()
        .pipe debug title: 'salt'
        .pipe salt()
        .pipe gulp.dest '.'

gulp.task 'bump', ->
    gulp.src './package.json'
        .pipe bump()
        .pipe gulp.dest '.'

gulp.task 'clean', ->
    del [
        'js'
    ]

gulp.task 'build', ['clean', 'salt', 'coffee', 'bin']

gulp.task 'default', ->
                
    gulp.watch 'coffee/**/*.coffee', ['coffee']
    gulp.watch 'bin/*.coffee',       ['bin'   ]
    gulp.watch 'style/*.styl',       ['style' ]
