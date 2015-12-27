del  = require 'del'
path = require 'path'
gulp = require 'gulp'
p    = require('gulp-load-plugins') lazy:false
(eval "#{k} = p.#{k}" for k,v of p)
 
onError = (err) -> util.log err

gulp.task 'coffee', ->
    gulp.src ['coffee/**/*.coffee'], base: './coffee'
        .pipe plumber()
        # .pipe debug title: 'coffee'
        .pipe pepper
            stringify: (info) -> 'chalk.blue("'+info.class + info.type + info.method + ' ► ")'
            paprika: 
                dbg: 'log'
            paprikaPrefix:  'chalk.gray("'
            paprikaPostfix: ':")'
        .pipe coffee(bare: true).on 'error', onError
        .pipe gulp.dest 'js/'

gulp.task 'coffee_release', ->
    gulp.src ['coffee/**/*.coffee'], base: './coffee'
        .pipe plumber()
        # .pipe debug title: 'coffee_release'
        .pipe pepper
            stringify: -> '""'
            paprika: 
                dbg: 'log'
        .pipe coffee(bare: true).on 'error', onError
        .pipe gulp.dest 'js/'
                    
gulp.task 'salt', ->
    gulp.src ['coffee/**/*.coffee'], base: '.'
        .pipe plumber()
        .pipe salt()
        .pipe gulp.dest '.'

gulp.task 'bump', ->
    gulp.src './package.json'
        .pipe bump()
        .pipe gulp.dest '.'

gulp.task 'clean', (cb) ->
    del.sync [ 'js' ]
    cb()
    
gulp.task 'test', (cb) ->
    child_process = require 'child_process'
    test = child_process.spawn "mocha", ['--compilers', 'coffee:coffee-script/register'], stdio: 'inherit'
    test.on 'close', cb

gulp.task 'release', ['clean', 'salt', 'coffee_release']

gulp.task 'default', ->
                
    gulp.watch 'coffee/**/*.coffee', ['salt']
    gulp.watch 'test/*.coffee', ['test']
