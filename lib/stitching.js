"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.providers = exports.connect = exports.auth = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; // Modules


var _mongodbStitch = require("mongodb-stitch");

// Constants
var COUNT = {
    ONE: 1
};
var INDEXES = {
    FIRST: 0
};
var MESSAGES = {
    AUTH: {
        BAD_EMAIL_CONFIRMATION: "Bad email confirmation",
        EMAIL_CONFIRMED: "Email confirmed",
        EMAIL_SENT_TO: "Email sent to",
        INVALID_PASSWORD: "Invalid password",
        LOGOUT: "You have been logged out",
        METADATA_DOES_NOT_EXISTS: "Metadata does not exists",
        METADATA_UPDATED: "Metadata updated",
        NO_METADATA_COLLECTION: "No metadata collection was provided",
        PASSWORD_RESETED: "Password reseted",
        USER_REGISTERED: "User registered",
        WRONG_EMAIL_PASSWORD: "Wrong email/password"
    },
    CLIENT: {
        CLIENT_NOT_INITIALIZED: "Client not initialized",
        MUST_BE_AUTHENTICATED: "Must be authenticated"
    },
    STITCHING: {
        STITCHING_NOT_INITIALIZED: "You need to initialize Stitching first"
    }
};
var PROVIDERS = {
    Facebook: "facebook",
    Google: "google"
};

// Helpers
var authenticated = false;
var client = null;
var credentials = null;
var db = null;
var metadataCollectionName = null;

// Higher order functions
var isAuthenticated = function isAuthenticated(promise) {
    if (!authenticated) {
        throw new Error(MESSAGES.STITCHING.MUST_BE_AUTHENTICATED);
    }

    return promise;
};
var isInitialized = function isInitialized(promise) {
    if (!client || !db) {
        throw new Error(MESSAGES.STITCHING.STITCHING_NOT_INITIALIZED);
    }

    return promise;
};

// Helpers
var _getCredentials = function _getCredentials() {
    return new Promise(function (resolve, reject) {
        if (client) {
            if (credentials) {
                resolve(credentials);
            } else {
                var authId = client.authedId();
                if (authId) {
                    authenticated = true;
                    client.userProfile().then(function (userData) {
                        if (userData.data) {
                            credentials = {
                                email: userData.data.email,
                                metadata: {}
                            };

                            if (userData.data.name) {
                                credentials.metadata.name = {
                                    type: "text",
                                    value: userData.data.name
                                };
                            }

                            if (userData.data.picture) {
                                credentials.picture = {
                                    type: "image",
                                    value: userData.data.picture
                                };
                            }

                            if (metadataCollectionName) {
                                db.collection(metadataCollectionName).find({}).execute().then(function (res) {
                                    if (res && res.length === COUNT.ONE) {
                                        credentials.metadata = Object.assign({}, credentials.metadata, res[INDEXES.FIRST]);
                                    }

                                    resolve(credentials);
                                }).catch(reject);
                            } else {
                                resolve(credentials);
                            }
                        }
                    }).catch(reject);
                } else {
                    resolve(null);
                }
            }
        } else {
            reject(new Error(MESSAGES.CLIENT.CLIENT_NOT_INITIALIZED));
        }
    });
};

var auth = exports.auth = {
    authenticate: function authenticate(provider) {
        return isInitialized(new Promise(function (resolve, reject) {
            client.authenticate(provider).then(resolve).catch(reject);
        }));
    },
    emailConfirm: function emailConfirm(tokenId, token) {
        return isInitialized(new Promise(function (resolve, reject) {
            if (token && tokenId) {
                client.auth.provider("userpass").emailConfirm(tokenId, token).then(function () {
                    resolve(MESSAGES.AUTH.EMAIL_CONFIRMED);
                }).catch(function () {
                    reject(new Error(MESSAGES.AUTH.BAD_EMAIL_CONFIRMATION));
                });
            } else {
                reject(new Error(MESSAGES.AUTH.BAD_EMAIL_CONFIRMATION));
            }
        }));
    },
    getCredentials: function getCredentials() {
        return isInitialized(_getCredentials());
    },
    login: function login(email, password) {
        return isInitialized(new Promise(function (resolve, reject) {
            client.login(email, password).then(function () {
                _getCredentials().then(resolve).catch(reject);
            }).catch(function () {
                reject(new Error(MESSAGES.AUTH.WRONG_EMAIL_PASSWORD));
            });
        }));
    },
    logout: function logout() {
        return isInitialized(isAuthenticated(new Promise(function (resolve, reject) {
            client.logout().then(function () {
                authenticated = false;
                credentials = null;
                resolve(MESSAGES.AUTH.LOGOUT);
            }).catch(reject);
        })));
    },
    passwordReset: function passwordReset(tokenId, token, newPassword) {
        return isInitialized(new Promise(function (resolve, reject) {
            if (newPassword) {
                client.auth.provider("userpass").passwordReset(tokenId, token, newPassword).then(function () {
                    resolve(MESSAGES.AUTH.PASSWORD_RESETED);
                }).catch(reject);
            } else {
                reject(new Error(MESSAGES.AUTH.INVALID_PASSWORD));
            }
        }));
    },
    registerUser: function registerUser(email, password) {
        return isInitialized(new Promise(function (resolve, reject) {
            client.register(email, password).then(function () {
                resolve(MESSAGES.AUTH.USER_REGISTERED);
            }).catch(reject);
        }));
    },
    sendPasswordReset: function sendPasswordReset(email) {
        return isInitialized(new Promise(function (resolve, reject) {
            client.auth.provider("userpass").sendPasswordReset(email).then(function () {
                resolve(MESSAGES.AUTH.EMAIL_SENT_TO + " " + email);
            }).catch(reject);
        }));
    },
    updateMetadata: function updateMetadata(metadata) {
        return isInitialized(isAuthenticated(new Promise(function (resolve, reject) {
            if (metadataCollectionName) {
                db.collection(metadataCollectionName).updateOne({
                    owner_id: client.authedId()
                }, {
                    $set: _extends({}, metadata)
                }, {
                    upsert: true
                }).then(function (res) {
                    if (res.matchedCount === COUNT.ONE || res.upsertedId.id) {
                        credentials.metadata = metadata;
                        resolve(MESSAGES.AUTH.METADATA_UPDATED);
                    } else {
                        reject(new Error(MESSAGES.AUTH.METADATA_DOES_NOT_EXISTS));
                    }
                }).catch(reject);
            } else {
                reject(new Error(MESSAGES.AUTH.NO_METADATA_COLLECTION));
            }
        })));
    }
};

var connect = exports.connect = function connect(appId, baseUrl, cluster, database, collectionName) {
    if (appId && baseUrl && cluster && database) {
        client = new _mongodbStitch.StitchClient(appId, { baseUrl: baseUrl });
        db = client.service("mongodb", cluster).db(database);
        metadataCollectionName = collectionName;
    }
};

var providers = exports.providers = PROVIDERS;

exports.default = {
    auth: auth,
    authenticated: authenticated,
    client: client,
    connect: connect,
    db: db,
    providers: providers
};