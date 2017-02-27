const gulp = require('lodash/bindAll')(require('gulp'), ['src', 'watch', 'task', 'dest', 'start', 'run'])
const {src, watch, task, dest, start, run} = gulp
const chalk = require('chalk')
const glob = require('glob')
const toString = require('lodash/toString')
const gutil = require('gulp-util')
const cluster = require('cluster')
const browserSync = require('browser-sync')

let currentWorker
let defaultURL
let currentBs = browserSync.create()

function reloadBs () {
  currentBs && currentBs.reload()
}

async function newFork () {
  return new Promise((resolve, reject) => {
    if (currentWorker) {
      return reject(new Error('has currentWorker'))
    }

    cluster.setupMaster({
      exec: 'bootstrap/serve.js',
      silent: true
    })

    const worker = cluster.fork()

    worker.on('message', ({type, port, address, defaultURL}) => {
      if (type === 'LISTEN_SERVER') {
        resolve({ worker, type, port, address, defaultURL })
      }
    })
  })
}

task('up-serve', ['down-serve'], async () => {
  const {worker, defaultURL: _defaultURL} = await newFork()

  defaultURL = _defaultURL

  currentWorker = worker

  reloadBs()
})

task('down-serve', (done) => {
  if (currentWorker) {
    currentWorker.on('message', ({type}) => {
      if (type === 'CLOSING_WORKER') {
        defaultURL = null
        currentWorker = null
        done()
      }
    })

    currentWorker.send({
      type: 'CLOSE_SERVER'
    })
  } else {
    done()
  }
})

task('up-serve:watch', [ 'up-serve' ], () => {
  const paths = Array.prototype.concat.apply([], [
    glob.sync('app/**/*.js'),
    glob.sync('config/**/*.js'),
    glob.sync('util/**/*.js'),
    glob.sync('bootstrap/*.js')
  ])

  gutil.log('Watch files: %s.', paths.map(e => chalk.yellow(toString(e))).join(', '))

  watch(paths, ['up-serve'])
})

task('browserSync', ['up-serve:watch'], (done) => {
  const bs = currentBs

  console.log(defaultURL)

  bs.init({
    open: false,
    proxy: defaultURL
  }, (err) => {
    if (err) { done(err) }
  })
})


// Reload by template
task('tempalte:reload', () => {reloadBs()})

task('tempalte:watch', () => {
  watch(['resources/view/**/*.pug'], ['tempalte:reload'])
})



/* STYLES */
task('style', () =>
  src(['resources/styles/**/*.css'])
  .pipe(require('gulp-postcss')([
    require('postcss-import')(),
    require('precss')(),
    require('postcss-cssnext')()
  ]))
  .pipe(dest('www/css'))
  .pipe(currentBs.stream())
)


task('style:watch', ['style'], () => {
  watch(['resources/styles/**/*.css'], ['style'])
})




// Events
gulp.on('task_start', e => gutil.log('Start Task [%s]: %s', chalk.blue(e.task), e.message))
gulp.on('task_stop', e => gutil.log('Stop  Task [%s]: %s', chalk.blue(e.task), e.message))
gulp.on('task_err', e => gutil.log('Error Task [%s]: %s\n', chalk.red(e.task), e.message, e.err))

// Default Task
start.apply(null, [ 'browserSync', 'style:watch', 'tempalte:watch' ])

