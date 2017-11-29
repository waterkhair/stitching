// Modules
const {MESSAGES} = require("./common");
const initAuth = require("./auth");
const initConnection = require("./connect");

// Helpers
let authObj = null;
let clientObj = null;
let connectionObj = null;
let dbObj = null;

const auth = () => {
    if (!authObj) {
        throw new Error(MESSAGES.STITCHING.STITCHING_NOT_INITIALIZED);
    }

    return {
        ...authObj
    };
};

const client = () => {
    if (!clientObj) {
        throw new Error(MESSAGES.STITCHING.STITCHING_NOT_INITIALIZED);
    }

    return {
        ...clientObj
    };
};

const db = () => {
    if (!dbObj) {
        throw new Error(MESSAGES.STITCHING.STITCHING_NOT_INITIALIZED);
    }

    return {
        ...dbObj
    };
};

const connect = (appId, baseUrl, cluster, database, metadataCollection) => {
    if (appId && baseUrl && cluster && database) {
        connectionObj = initConnection(appId, baseUrl, cluster, database);
        clientObj = connectionObj.client;
        dbObj = connectionObj.db;
        authObj = initAuth(clientObj, dbObj, metadataCollection);
    }
};

module.exports = {
    auth,
    client,
    connect,
    db
};
