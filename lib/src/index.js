"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

// Modules
var _require = require("./common"),
    MESSAGES = _require.MESSAGES;

var initAuth = require("./auth");
var initConnection = require("./connect");

// Helpers
var authObj = null;
var clientObj = null;
var connectionObj = null;
var dbObj = null;

var auth = function auth() {
    if (!authObj) {
        throw new Error(MESSAGES.STITCHING.STITCHING_NOT_INITIALIZED);
    }

    return _extends({}, authObj);
};

var client = function client() {
    if (!clientObj) {
        throw new Error(MESSAGES.STITCHING.STITCHING_NOT_INITIALIZED);
    }

    return _extends({}, clientObj);
};

var db = function db() {
    if (!dbObj) {
        throw new Error(MESSAGES.STITCHING.STITCHING_NOT_INITIALIZED);
    }

    return _extends({}, dbObj);
};

var connect = function connect(appId, baseUrl, cluster, database, metadataCollection) {
    if (appId && baseUrl && cluster && database) {
        connectionObj = initConnection(appId, baseUrl, cluster, database);
        clientObj = connectionObj.client;
        dbObj = connectionObj.db;
        authObj = initAuth(clientObj, dbObj, metadataCollection);
    }
};

module.exports = {
    auth: auth,
    client: client,
    connect: connect,
    db: db
};