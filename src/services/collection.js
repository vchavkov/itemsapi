'use strict';
var Promise = require('bluebird');
var _ = require('lodash');
var config = require('./../../config/index');
var fs = Promise.promisifyAll(require('fs-extra'));

(function(module) {

  var filename = config.collections.filename;

  /**
   * update collection
   */
  module.updateCollectionAsync = function(data, where) {
    return module.getCollectionsAsync()
    .then(function(res) {
      var index = _.findIndex(res, _.pick(where, function(value) {
        return !_.isUndefined(value);
      }));

      if (index === -1) {
        throw new Error('Not found');
      }
      res[index] = _.assign(res[index], data);
      return fs.writeFileAsync(
        filename,
        JSON.stringify(res, null, 4),
        {encoding: 'utf8'}
      );
    })
  }

  /**
   * find collection
   */
  module.findCollectionAsync = function(where) {
    return module.getCollectionsAsync()
    .then(function(res) {
      return res;
    })
    .then(function(res) {
      return _.findWhere(res, _.pick(where, function(value) {
        return !_.isUndefined(value);
      }));
    })
    .then(function(res) {
      if (!res) {
        throw new Error('Not found');
      }
      return res;
    });
  }

  /**
   * add collection manually
   * we should switch to https://github.com/typicode/lowdb later
   * we should make data validation too
   */
  module.addCollectionAsync = function(data) {
    return module.getCollectionsAsync()
    .then(function(res) {
      res.push(data);
      return res;
    })
    .then(function(res) {
      return fs.writeFileAsync(
        filename,
        JSON.stringify(res, null, 4),
        {encoding: 'utf8'}
      );
    });
  }

  /**
   * remove collection manually
   * we should switch to https://github.com/typicode/lowdb later
   */
  module.removeCollectionAsync = function(where) {
    return module.getCollectionsAsync()
    .then(function(res) {
      return _.reject(res, _.pick(where, function(value) {
        return !_.isUndefined(value);
      }));
    })
    .then(function(res) {
      return fs.writeFileAsync(
        filename,
        JSON.stringify(res, null, 4),
        {encoding: 'utf8'}
      );
    });
  }

  /**
   * get collections from json file
   * in the future it should supports other more scalable dbs like mongodb, mysql or redis
   */
  module.getCollectionsAsync = function(data) {
    return fs.readFileAsync(filename)
    .then(function(res) {
      return JSON.parse(res);
    })
    .then(function(res) {
      return _.where(res, data);
    });
  }

  /**
   * get collections list
   */
  module.getCollectionsListAsync = function(data) {
    return module.getCollectionsAsync(data)
    .map(function(res) {
      return res.name;
    });
  }

}(exports));