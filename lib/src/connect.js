"use strict";

// Modules
var _require = require("./common"),
    MESSAGES = _require.MESSAGES;

var _require2 = require("mongodb-stitch"),
    StitchClient = _require2.StitchClient;

// Methods


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
                    reject(new Error(MESSAGES.CLIENT.MUST_BE_AUTHENTICATED));
                }
            } else {
                reject(new Error(MESSAGES.CLIENT.CLIENT_NOT_INITIALIZED));
            }
        });
    };
};

module.exports = function (appId, baseUrl, cluster, database) {
    var client = new StitchClient(appId, { baseUrl: baseUrl });
    var db = client.service("mongodb", cluster).db(database);

    return {
        callNamedPipeline: callNamedPipelineCreator(client),
        client: client,
        db: db
    };
};