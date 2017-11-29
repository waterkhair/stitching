"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _common = require("./common");

var _mongodbStitch = require("mongodb-stitch");

// Methods
// Modules
var callNamedPipelineCreator = function callNamedPipelineCreator(client) {
    return function (name) {
        var args = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "";
        return new Promise(function (resolve, reject) {
            if (client) {
                if (client.authedId()) {
                    client.executePipeline([{
                        action: "namedPipeline",
                        args: {
                            args: args,
                            name: name
                        },
                        service: ""
                    }]).then(resolve).catch(reject);
                } else {
                    reject(new Error(_common.MESSAGES.CLIENT.MUST_BE_AUTHENTICATED));
                }
            } else {
                reject(new Error(_common.MESSAGES.CLIENT.CLIENT_NOT_INITIALIZED));
            }
        });
    };
};

exports.default = function (appId, baseUrl, cluster, database) {
    var client = new _mongodbStitch.StitchClient(appId, { baseUrl: baseUrl });
    var db = client.service("mongodb", cluster).db(database);

    return {
        callNamedPipeline: callNamedPipelineCreator(client),
        client: client,
        db: db
    };
};