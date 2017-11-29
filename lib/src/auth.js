"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

// Modules
var _require = require("./common"),
    COUNT = _require.COUNT,
    INDEXES = _require.INDEXES,
    MESSAGES = _require.MESSAGES,
    PROVIDERS = _require.PROVIDERS;

// Method creatorss


var authenticateCreator = function authenticateCreator(client) {
    return function (provider) {
        client.authenticate(provider);
    };
};
var emailConfirmCreator = function emailConfirmCreator(client) {
    return function (tokenId, token) {
        return new Promise(function (resolve, reject) {
            if (token && tokenId) {
                client.auth.provider(PROVIDERS.USERPASS).emailConfirm(tokenId, token).then(function () {
                    resolve(MESSAGES.AUTH.EMAIL_CONFIRMED);
                }).catch(function () {
                    reject(new Error(MESSAGES.AUTH.BAD_EMAIL_CONFIRMATION));
                });
            } else {
                reject(new Error(MESSAGES.AUTH.BAD_EMAIL_CONFIRMATION));
            }
        });
    };
};
var registerUserCreator = function registerUserCreator(client) {
    return function (email, password) {
        return new Promise(function (resolve, reject) {
            client.register(email, password).then(function () {
                resolve(MESSAGES.AUTH.USER_REGISTERED);
            }).catch(reject);
        });
    };
};
var passwordResetCreator = function passwordResetCreator(client) {
    return function (tokenId, token, newPassword, confirmNewPassword) {
        return new Promise(function (resolve, reject) {
            if (newPassword && confirmNewPassword) {
                if (newPassword === confirmNewPassword) {
                    client.auth.provider(PROVIDERS.USERPASS).passwordReset(tokenId, token, newPassword).then(function () {
                        resolve(MESSAGES.AUTH.PASSWORD_RESETED);
                    }).catch(reject);
                } else {
                    reject(new Error(MESSAGES.AUTH.PASSWORDS_DOES_NOT_MATCH));
                }
            } else {
                reject(new Error(MESSAGES.AUTH.INVALID_PASSWORD));
            }
        });
    };
};
var sendPasswordResetCreator = function sendPasswordResetCreator(client) {
    return function (email) {
        return new Promise(function (resolve, reject) {
            client.auth.provider(PROVIDERS.USERPASS).sendPasswordReset(email).then(function () {
                resolve(MESSAGES.AUTH.EMAIL_SENT_TO + " " + email);
            }).catch(reject);
        });
    };
};
var updateMetadataCreator = function updateMetadataCreator(client, db, metadataCollection) {
    return function (metadata) {
        return new Promise(function (resolve, reject) {
            if (client) {
                var authId = client.authedId();
                if (authId) {
                    if (metadataCollection) {
                        db.collection(metadataCollection).updateOne({ owner_id: authId }, { $set: _extends({}, metadata) }, { upsert: true }).then(function (res) {
                            if (res.result.length === COUNT.ONE) {
                                resolve(MESSAGES.AUTH.METADATA_UPDATED);
                            } else {
                                reject(new Error(MESSAGES.AUTH.METADATA_DOES_NOT_EXISTS));
                            }
                        }).catch(reject);
                    } else {
                        reject(new Error(MESSAGES.AUTH.NO_METADATA_COLLECTION));
                    }
                } else {
                    reject(new Error(MESSAGES.CLIENT.MUST_BE_AUTHENTICATED));
                }
            } else {
                reject(new Error(MESSAGES.CLIENT.CLIENT_NOT_INITIALIZED));
            }
        });
    };
};
var getUserCredentialsCreator = function getUserCredentialsCreator(client, db, metadataCollection) {
    return function () {
        return new Promise(function (resolve, reject) {
            if (client) {
                var authId = client.authedId();
                if (authId) {
                    client.userProfile().then(function (userData) {
                        if (userData.data) {
                            var metadata = {};

                            if (userData.data.name) {
                                metadata.name = {
                                    value: userData.data.name
                                };
                            }

                            if (userData.data.picture) {
                                metadata.picture = {
                                    value: userData.data.picture
                                };
                            }

                            if (metadataCollection) {
                                db.collection(metadataCollection).find({}).then(function (res) {
                                    if (res && res.length === COUNT.ONE) {
                                        metadata = Object.assign({}, metadata, res[INDEXES.FIRST]);
                                    }

                                    resolve({
                                        email: userData.data.email,
                                        metadata: metadata
                                    });
                                }).catch(reject);
                            } else {
                                resolve({
                                    email: userData.data.email,
                                    metadata: metadata
                                });
                            }
                        }
                    }).catch(reject);
                } else {
                    resolve(null);
                }
            } else {
                reject(new Error(MESSAGES.CLIENT.CLIENT_NOT_INITIALIZED));
            }
        });
    };
};
var loginCreator = function loginCreator(client, db, metadataCollection) {
    return function (email, password) {
        return new Promise(function (resolve, reject) {
            client.login(email, password).then(function () {
                getUserCredentialsCreator(client, db, metadataCollection)().then(resolve).catch(reject);
            }).catch(function () {
                reject(new Error(MESSAGES.AUTH.WRONG_EMAIL_PASSWORD));
            });
        });
    };
};
var logoutCreator = function logoutCreator(client) {
    return function () {
        return client.logout();
    };
};

module.exports = function (client, db, metadataCollection) {
    return {
        authenticate: authenticateCreator(client),
        emailConfirm: emailConfirmCreator(client),
        getUserCredentials: getUserCredentialsCreator(client, db, metadataCollection),
        login: loginCreator(client, db, metadataCollection),
        logout: logoutCreator(client),
        passwordReset: passwordResetCreator(client),
        registerUser: registerUserCreator(client),
        sendPasswordReset: sendPasswordResetCreator(client),
        updateMetadata: updateMetadataCreator(client, db, metadataCollection)
    };
};