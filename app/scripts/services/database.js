'use strict';

angular.module('automatApp')
  .factory('database', function (pouchdb) {
    return pouchdb.create('automat');
});
