"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var COUNT = exports.COUNT = {
    ONE: 1
};

var INDEXES = exports.INDEXES = {
    FIRST: 0
};

var MESSAGES = exports.MESSAGES = {
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

var PROVIDERS = exports.PROVIDERS = {
    Facebook: "facebook",
    Google: "google",
    Twitter: "twitter",
    UserPass: "userpass"
};