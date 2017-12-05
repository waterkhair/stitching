// Modules
import {StitchClient} from "mongodb-stitch";

// Constants
const COUNT = {
    ONE: 1
};
const INDEXES = {
    FIRST: 0
};
const MESSAGES = {
    AUTH: {
        BAD_EMAIL_CONFIRMATION: "Bad email confirmation",
        EMAIL_CONFIRMED: "Email confirmed",
        EMAIL_SENT_TO: "Email sent to",
        INVALID_PASSWORD: "Invalid password",
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
const PROVIDERS = {
    Facebook: "facebook",
    Google: "google"
};

// Helpers
let authenticated = false;
let client = null;
let credentials = null;
let db = null;
let metadataCollectionName = null;

// Higher order functions
const isAuthenticated = (promise) => {
    if (!authenticated) {
        throw new Error(MESSAGES.STITCHING.MUST_BE_AUTHENTICATED);
    }

    return promise;
};
const isInitialized = (promise) => {
    if (!client || !db) {
        throw new Error(MESSAGES.STITCHING.STITCHING_NOT_INITIALIZED);
    }

    return promise;
};

// Helpers
const getCredentials = () => new Promise((resolve, reject) => {
    if (client) {
        if (credentials) {
            resolve(credentials);
        } else {
            const authId = client.authedId();
            if (authId) {
                authenticated = true;
                client
                    .userProfile()
                    .then((userData) => {
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
                                db
                                    .collection(metadataCollectionName)
                                    .find({})
                                    .execute()
                                    .then((res) => {
                                        if (res && res.length === COUNT.ONE) {
                                            credentials.metadata = Object.assign({}, credentials.metadata, res[INDEXES.FIRST]);
                                        }

                                        resolve(credentials);
                                    })
                                    .catch(reject);
                            } else {
                                resolve(credentials);
                            }
                        }
                    })
                    .catch(reject);
            } else {
                resolve(null);
            }
        }
    } else {
        reject(new Error(MESSAGES.CLIENT.CLIENT_NOT_INITIALIZED));
    }
});

export const auth = {
    authenticate: (provider) => isInitialized(new Promise((resolve, reject) => {
        client
            .authenticate(provider)
            .then(resolve)
            .catch(reject);
    })),
    emailConfirm: (tokenId, token) => isInitialized(new Promise((resolve, reject) => {
        if (token && tokenId) {
            client.auth
                .provider("userpass")
                .emailConfirm(tokenId, token)
                .then(() => {
                    resolve(MESSAGES.AUTH.EMAIL_CONFIRMED);
                })
                .catch(() => {
                    reject(new Error(MESSAGES.AUTH.BAD_EMAIL_CONFIRMATION));
                });
        } else {
            reject(new Error(MESSAGES.AUTH.BAD_EMAIL_CONFIRMATION));
        }
    })),
    getCredentials: () => isInitialized(getCredentials()),
    login: (email, password) => isInitialized(new Promise((resolve, reject) => {
        client.login(email, password)
            .then(() => {
                getCredentials()
                    .then(resolve)
                    .catch(reject);
            })
            .catch(() => {
                reject(new Error(MESSAGES.AUTH.WRONG_EMAIL_PASSWORD));
            });
    })),
    logout: () => isInitialized(isAuthenticated(new Promise((resolve, reject) => {
        client
            .logout()
            .then(() => {
                authenticated = false;
                credentials = null;
                resolve();
            })
            .catch(reject);
    }))),
    passwordReset: (tokenId, token, newPassword) => isInitialized(new Promise((resolve, reject) => {
        if (newPassword) {
            client.auth
                .provider("userpass")
                .passwordReset(tokenId, token, newPassword)
                .then(() => {
                    resolve(MESSAGES.AUTH.PASSWORD_RESETED);
                })
                .catch(reject);
        } else {
            reject(new Error(MESSAGES.AUTH.INVALID_PASSWORD));
        }
    })),
    registerUser: (email, password) => isInitialized(new Promise((resolve, reject) => {
        client
            .register(email, password)
            .then(() => {
                resolve(MESSAGES.AUTH.USER_REGISTERED);
            })
            .catch(reject);
    })),
    sendPasswordReset: (email) => isInitialized(new Promise((resolve, reject) => {
        client.auth
            .provider("userpass")
            .sendPasswordReset(email)
            .then(() => {
                resolve(`${MESSAGES.AUTH.EMAIL_SENT_TO} ${email}`);
            })
            .catch(reject);
    })),
    updateMetadata: (metadata) => isInitialized(isAuthenticated(new Promise((resolve, reject) => {
        if (metadataCollectionName) {
            db
                .collection(metadataCollectionName)
                .updateOne({
                    owner_id: client.authedId()
                }, {
                    $set: {
                        ...metadata
                    }
                }, {
                    upsert: true
                })
                .then((res) => {
                    if (res.matchedCount === COUNT.ONE || res.upsertedId.id) {
                        credentials.metadata = metadata;
                        resolve(MESSAGES.AUTH.METADATA_UPDATED);
                    } else {
                        reject(new Error(MESSAGES.AUTH.METADATA_DOES_NOT_EXISTS));
                    }
                })
                .catch(reject);
        } else {
            reject(new Error(MESSAGES.AUTH.NO_METADATA_COLLECTION));
        }
    })))
};

export const connect = (appId, baseUrl, cluster, database, collectionName) => {
    if (appId && baseUrl && cluster && database) {
        client = new StitchClient(appId, {baseUrl});
        db = client.service("mongodb", cluster).db(database);
        metadataCollectionName = collectionName;
    }
};

export const providers = PROVIDERS;

export default {
    auth,
    authenticated,
    client,
    connect,
    db,
    providers
};
