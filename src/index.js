// Modules
import {MESSAGES} from "./common";
import initAuth from "./auth";
import initConnection from "./connect";

// Helpers
let authObj = null;
let clientObj = null;
let connectionObj = null;
let dbObj = null;

export const auth = () => {
    if (!authObj) {
        throw new Error(MESSAGES.STITCHING.STITCHING_NOT_INITIALIZED);
    }

    return {
        ...authObj
    };
};

export const client = () => {
    if (!clientObj) {
        throw new Error(MESSAGES.STITCHING.STITCHING_NOT_INITIALIZED);
    }

    return {
        ...clientObj
    };
};

export const db = () => {
    if (!dbObj) {
        throw new Error(MESSAGES.STITCHING.STITCHING_NOT_INITIALIZED);
    }

    return {
        ...dbObj
    };
};

export const connect = (appId, baseUrl, cluster, database, metadataCollection) => {
    if (appId && baseUrl && cluster && database) {
        connectionObj = initConnection(appId, baseUrl, cluster, database);
        clientObj = connectionObj.client;
        dbObj = connectionObj.db;
        authObj = initAuth(clientObj, dbObj, metadataCollection);
    }
};
