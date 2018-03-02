'use strict';

// tools --------------------------------------------------
var gulp            = require('gulp')
var rimraf          = require('rimraf')
var rsync           = require('gulp-rsync')
var gulpif          = require('gulp-if')
var gutil           = require('gulp-util')

var path = {
  // bot -----------------------------------------------
  bot: {
      root:       './',
      dest_user:  'arseny',
      dest_host:  '89.188.160.102',
      dest_dev:   '/usr/home/arseny/telegram-bot-telegraf/',
      dest_prod:  '/usr/home/arseny/telegram-bot-telegraf/',
  },
}

// built flags --------------------------------------------
var buildFlag = {
  production: gutil.env.production ? true : false,
}

var rsyncConfGlob = {
  progress:       	     true,
  incremental:    	     true,
  relative:       	     true,
  emptyDirectories:      true,
  recursive:      	     true,
  clean:          	     false,
  exclude:        	     ['.*', 'README.md', 'node_modules', 'package-lock.json', 'gulpfile.js', 'cert']
};




//                                                          |
//                         tasks                            |
//                                                          |

gulp.task('bot:deploy:prod', function() {
  var rsyncConf = {};
  for (var key in rsyncConfGlob) { rsyncConf[key] = rsyncConfGlob[key]; }
  rsyncConf.hostname      = path.bot.dest_host;
  rsyncConf.username      = path.bot.dest_user;
  rsyncConf.root          = path.bot.root;
  rsyncConf.destination   = path.bot.dest_prod;

  gulp.src([ path.bot.root ])
    .pipe(rsync(rsyncConf));
});


gulp.task('deploy', [
  'bot:deploy:prod'
]);



// -------------------------------------------------------- | default
gulp.task('default', [
  'deploy'
]);
