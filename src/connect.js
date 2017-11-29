// Modules
const {MESSAGES} = require("./common");
const {StitchClient} = require("mongodb-stitch");

// Methods
const callNamedPipelineCreator = (client) => (name, args = "") => new Promise((resolve, reject) => {
    if (client) {
        if (client.authedId()) {
            client
                .executePipeline([
                    {
                        action: "namedPipeline",
                        args: {
                            args,
                            name
                        },
                        service: ""
                    }
                ])
                .then(resolve)
                .catch(reject);
        } else {
            reject(new Error(MESSAGES.CLIENT.MUST_BE_AUTHENTICATED));
        }
    } else {
        reject(new Error(MESSAGES.CLIENT.CLIENT_NOT_INITIALIZED));
    }
});

module.exports = (appId, baseUrl, cluster, database) => {
    const client = new StitchClient(appId, {baseUrl});
    const db = client.service("mongodb", cluster).db(database);

    return {
        callNamedPipeline: callNamedPipelineCreator(client),
        client,
        db
    };
};
