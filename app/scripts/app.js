'use strict';

angular
  .module('automatApp', [
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'pouchdb',
    'hc.marked', // think Can be removed
    'mgcrea.ngStrap',
    'ab-base64', // needed because atob is brocken ... base64 with unicode chars doesn't work well
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  }
);

