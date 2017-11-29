"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.connect = exports.db = exports.client = exports.auth = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; // Modules


var _common = require("./common");

var _auth = require("./auth");

var _auth2 = _interopRequireDefault(_auth);

var _connect = require("./connect");

var _connect2 = _interopRequireDefault(_connect);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Helpers
var authObj = null;
var clientObj = null;
var connectionObj = null;
var dbObj = null;

var auth = exports.auth = function auth() {
    if (!authObj) {
        throw new Error(_common.MESSAGES.STITCHING.STITCHING_NOT_INITIALIZED);
    }

    return _extends({}, authObj);
};

var client = exports.client = function client() {
    if (!clientObj) {
        throw new Error(_common.MESSAGES.STITCHING.STITCHING_NOT_INITIALIZED);
    }

    return _extends({}, clientObj);
};

var db = exports.db = function db() {
    if (!dbObj) {
        throw new Error(_common.MESSAGES.STITCHING.STITCHING_NOT_INITIALIZED);
    }

    return _extends({}, dbObj);
};

var connect = exports.connect = function connect(appId, baseUrl, cluster, database, metadataCollection) {
    if (appId && baseUrl && cluster && database) {
        connectionObj = (0, _connect2.default)(appId, baseUrl, cluster, database);
        clientObj = connectionObj.client;
        dbObj = connectionObj.db;
        authObj = (0, _auth2.default)(clientObj, dbObj, metadataCollection);
    }
};

exports.default = {
    auth: auth,
    client: client,
    connect: connect,
    db: db
};