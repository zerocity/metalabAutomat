'use strict';

angular.module('automatApp')
  .controller('MainCtrl', function ($scope,$http,$interval,base64,$indexedDB) {

  var clientTokken = '683b134e2e89d670c797e1d77e9e6bfca3b62192';
  var repoUrl='https://api.github.com/repos/zerocity/metalabAutomat/contents/';
  var repoUrlAll = 'https://api.github.com/repos/zerocity/metalabAutomat/git/trees/master';
  var jsonpCallback = '?callback=JSON_CALLBACK';
  var recursive = '&recursive=1';
  var apiAccess = '&access_token='+clientTokken;
  //var HEADER = {headers: {'Authorization':'Basic '+clientTokken}}
  var config = {headers:  {
      'Authorization': 'token '+clientTokken,
      'Accept': 'application/vnd.github-blob.raw',
      'X-Testing' : 'testing'
    }
  };

  // initallasie
  $scope.progressBar = 0;

  var db = $indexedDB.objectStore('automat');
  var dbSettings = $indexedDB.objectStore('settings');

  var base64lib = function(content) {
      return base64.decode(content.replace(/\n/g ,''));
  };

  var getLastModified = function() {
    dbSettings.getAll().then(function (result) {
      $scope.lastModified = result[result.length -1].lastModified;
    });
  };

  var checkForUpdates = function(){
    var getData = $http.jsonp(repoUrl+jsonpCallback+apiAccess);
    if (typeof $scope.lastModified === 'undefined') {
      getLastModified();
    } else {
      getLastModified();
      return getData.then(function (response) {
          if (response.data.meta['Last-Modified'] === $scope.lastModified ) {
            return true;
          } else {
            return false;
          }
      });
    }
  };

  var getGithubData = function() {
    var mdFiles = [];
    var data = [];

    var githubDataDir = $http.jsonp(repoUrlAll+jsonpCallback+recursive+apiAccess,config);

    githubDataDir.then(function ( response ) {
      //indexdb
      dbSettings.clear();
      dbSettings.insert({"lastModified":response.data.meta['Last-Modified']});
      //set new last modifed
      getLastModified();

      var tree = response.data.data.tree;
      $scope.maxProgress = tree.length;

      for (var i = 0; i < tree.length; i++) {
        var path = tree[i].path;
        var posMd = path.indexOf('.md');$scope.img
        var posJpg = path.indexOf('listview.jpg');
        //pos of dir from path name
        var posDir = path.indexOf('/') + 1;
        var dir = path.slice(0,posDir-1);

        if (posMd >= 0) {
          //remove directory path an md extension
          var title = path.slice(posDir,posMd);
          var euro = title.match(/\d+ Euro/);
          if (euro) {euro = euro[0];} else {euro = '';}

          mdFiles.push({
            'dir'  : dir,
            'title': title,
            'euro' : euro,
            'url'  :tree[i].url
          });

          getGithubFileData(tree[i].url,dir).then(function (res) {
            // get the content of the markdown file an append it to the mdFiles Ditionary
            $scope.progressBar ++;
            var tess = _.findWhere(mdFiles,{'dir':res.dir});
            tess.md = res.src;
          });
        }else if(posJpg >= 0) {
          getGithubFileData(tree[i].url,dir).then(function (res) {
              var tess = _.findWhere(mdFiles,{'dir':res.dir});
              tess.src = res.src;
              data.push(tess);
              $scope.progressBar ++;
              if ($scope.progressBar === tree.length) {
                console.log('Data is inserted in indexedDB');
                db.clear().then(function (res){}); // no double entries
                db.insert(data);
                $scope.data = data;
              }
            });
        }else{
          // all other files
          $scope.progressBar ++;
        };
      }//end for
    });
  };

  if (typeof $scope.lastModified === 'undefined') {
    // db initalisation
    getGithubData();
  };

  $scope.isProgressActive = function() {
    if ($scope.progressBar === $scope.maxProgress || $scope.progressBar === 0 ) {
      return 'hide';
    } else {
      return 'active';
    }
  };

  var getGithubFileData = function(url,dir) {
    return $http.jsonp(url+jsonpCallback+apiAccess,config).then(function (response) {
      return {'src':response.data.data.content,'dir':dir};
    });
  };

  // inital scope setup
  db.getAll().then(function (results) {
    $scope.data = results;
  });

  // Update intervall





  $interval(function() {
    checkForUpdates().then(function (res) {
      if (res === false) {
        console.log('... update indexedDB');
        getGithubData();
      }else{
        //console.log('no update');
        // Update intervall
      }
    });
  },60*60*1000);// every 60 minutes

  $scope.setModalContent = function(dir) {
    var modal = _.findWhere($scope.data,{'dir':dir});
    $scope.modal.content = modal.md;
    $scope.modal.img = modal.img;
  };

  //modal initation
  $scope.modal = {
    'title'   : undefined,
    'content' : undefined,
  };

  $scope.markdown = function() {
    if (typeof $scope.modal.content === 'undefined') {
      return 'loading ...';
    } else {
      return marked(base64lib($scope.modal.content));
    }
  };

});

