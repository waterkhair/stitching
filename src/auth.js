// Modules
import {COUNT, INDEXES, MESSAGES, PROVIDERS} from "./common";

// Method creatorss
const authenticateCreator = (client) => (provider) => {
    client.authenticate(provider);
};
const emailConfirmCreator = (client) => (tokenId, token) => new Promise((resolve, reject) => {
    if (token && tokenId) {
        client.auth
            .provider(PROVIDERS.UserPass)
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
const registerUserCreator = (client) => (email, password) => new Promise((resolve, reject) => {
    client
        .register(email, password)
        .then(() => {
            resolve(MESSAGES.AUTH.USER_REGISTERED);
        })
        .catch(reject);
});
const passwordResetCreator = (client) => (tokenId, token, newPassword) => new Promise((resolve, reject) => {
    if (newPassword) {
        client.auth
            .provider(PROVIDERS.UserPass)
            .passwordReset(tokenId, token, newPassword)
            .then(() => {
                resolve(MESSAGES.AUTH.PASSWORD_RESETED);
            })
            .catch(reject);
    } else {
        reject(new Error(MESSAGES.AUTH.INVALID_PASSWORD));
    }
});
const sendPasswordResetCreator = (client) => (email) => new Promise((resolve, reject) => {
    client.auth
        .provider(PROVIDERS.UserPass)
        .sendPasswordReset(email)
        .then(() => {
            resolve(`${MESSAGES.AUTH.EMAIL_SENT_TO} ${email}`);
        })
        .catch(reject);
});
const updateMetadataCreator = (client, db, metadataCollection) => (metadata) => new Promise((resolve, reject) => {
    if (client) {
        const authId = client.authedId();
        if (authId) {
            if (metadataCollection) {
                db
                    .collection(metadataCollection)
                    .updateOne({owner_id: authId}, {$set: {...metadata}}, {upsert: true})
                    .then((res) => {
                        if (res.matchedCount === COUNT.ONE) {
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
const getUserCredentialsCreator = (client, db, metadataCollection) => () => new Promise((resolve, reject) => {
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
                                .execute()
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
const loginCreator = (client, db, metadataCollection) => (email, password) => new Promise((resolve, reject) => {
    client.login(email, password)
        .then(() => {
            getUserCredentialsCreator(client, db, metadataCollection)()
                .then(resolve)
                .catch(reject);
        })
        .catch(() => {
            reject(new Error(MESSAGES.AUTH.WRONG_EMAIL_PASSWORD));
        });
});
const logoutCreator = (client) => () => client.logout();

export default (client, db, metadataCollection) => ({
    authenticate: authenticateCreator(client),
    emailConfirm: emailConfirmCreator(client),
    getUserCredentials: getUserCredentialsCreator(client, db, metadataCollection),
    login: loginCreator(client, db, metadataCollection),
    logout: logoutCreator(client),
    passwordReset: passwordResetCreator(client),
    registerUser: registerUserCreator(client),
    sendPasswordReset: sendPasswordResetCreator(client),
    updateMetadata: updateMetadataCreator(client, db, metadataCollection)
});
