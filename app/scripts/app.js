'use strict';

angular
  .module('automatApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ngRoute',
    'ngTouch',
    'hc.marked', // think Can be removed
    'ngLocalStore', // can be removed android webview doesn't support local storage
    'xc.indexedDB',
    'mgcrea.ngStrap',
    'ab-base64', // needed because atob is brocken ... base64 with unicode chars doesn't work well
  ])
  .config(function ($routeProvider, $indexedDBProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });

    var myVersion = 1;

    $indexedDBProvider
      .connection('metalab')
      .upgradeDatabase(myVersion, function(event, db, tx){
        var objStore = db.createObjectStore('automat', {keyPath: 'dir'});
        var settingObjStore = db.createObjectStore('settings', {keyPath: 'lastModified'});

      });
  }
);

