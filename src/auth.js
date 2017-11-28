// Constants
const {COUNT, INDEXES, MESSAGES, PROVIDERS} = require("./common");

// Methods
const authenticate = (client) => (provider) => {
    client.authenticate(provider);
};
const emailConfirm = (client) => (tokenId, token) => new Promise((resolve, reject) => {
    if (token && tokenId) {
        client.auth
            .provider(PROVIDERS.USERPASS)
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
});
const registerUser = (client) => (email, password) => new Promise((resolve, reject) => {
    client
        .register(email, password)
        .then(() => {
            resolve(MESSAGES.AUTH.USER_REGISTERED);
        })
        .catch(reject);
});
const passwordReset = (client) => (tokenId, token, newPassword, confirmNewPassword) => new Promise((resolve, reject) => {
    if (newPassword && confirmNewPassword) {
        if (newPassword === confirmNewPassword) {
            client.auth
                .provider(PROVIDERS.USERPASS)
                .passwordReset(tokenId, token, newPassword)
                .then(() => {
                    resolve(MESSAGES.AUTH.PASSWORD_RESETED);
                })
                .catch(reject);
        } else {
            reject(new Error(MESSAGES.AUTH.PASSWORDS_DOES_NOT_MATCH));
        }
    } else {
        reject(new Error(MESSAGES.AUTH.INVALID_PASSWORD));
    }
});
const sendPasswordReset = (client) => (email) => new Promise((resolve, reject) => {
    client.auth
        .provider(PROVIDERS.USERPASS)
        .sendPasswordReset(email)
        .then(() => {
            resolve(`${MESSAGES.AUTH.EMAIL_SENT_TO} ${email}`);
        })
        .catch(reject);
});
const updateMetadata = (client, db, metadataCollection) => (metadata) => new Promise((resolve, reject) => {
    if (client) {
        const authId = client.authedId();
        if (authId) {
            if (metadataCollection) {
                db
                    .collection(metadataCollection)
                    .updateOne({
                        owner_id: authId
                    }, {$set: {...metadata}}, {upsert: true})
                    .then((res) => {
                        if (res.result.length === COUNT.ONE) {
                            resolve(MESSAGES.AUTH.METADATA_UPDATED);
                        } else {
                            reject(new Error(MESSAGES.AUTH.METADATA_DOES_NOT_EXISTS));
                        }
                    })
                    .catch(reject);
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
const getUserCredentials = (client, db, metadataCollection) => () => new Promise((resolve, reject) => {
    if (client) {
        const authId = client.authedId();
        if (authId) {
            client
                .userProfile()
                .then((userData) => {
                    if (userData.data) {
                        let metadata = {};

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
                            db
                                .collection(metadataCollection)
                                .find({})
                                .then((res) => {
                                    if (res && res.length === COUNT.ONE) {
                                        metadata = Object.assign({}, metadata, res[INDEXES.FIRST]);
                                    }

                                    resolve({
                                        email: userData.data.email,
                                        metadata
                                    });
                                })
                                .catch(reject);
                        } else {
                            resolve({
                                email: userData.data.email,
                                metadata
                            });
                        }
                    }
                })
                .catch(reject);
        } else {
            resolve(null);
        }
    } else {
        reject(new Error(MESSAGES.CLIENT.CLIENT_NOT_INITIALIZED));
    }
});
const login = (client, db, metadataCollection) => (email, password) => new Promise((resolve, reject) => {
    client.login(email, password)
        .then(() => {
            getUserCredentials(client, db, metadataCollection)()
                .then(resolve)
                .catch(reject);
        })
        .catch(() => {
            reject(new Error(MESSAGES.AUTH.WRONG_EMAIL_PASSWORD));
        });
});
const logout = (client) => () => client.logout();

module.exports = (client, db, metadataCollection) => ({
    authenticate: authenticate(client),
    emailConfirm: emailConfirm(client),
    getUserCredentials: getUserCredentials(client, db, metadataCollection),
    login: login(client, db, metadataCollection),
    logout: logout(client),
    passwordReset: passwordReset(client),
    registerUser: registerUser(client),
    sendPasswordReset: sendPasswordReset(client),
    updateMetadata: updateMetadata(client, db, metadataCollection)
});
