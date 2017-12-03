# Stitching
A NodeJS module to use [MongoDB Stitch](https://www.mongodb.com/cloud/stitch) Authentication in an easy way.

## Documentation

[StitchingJS.com](http://stitchingjs.com/)
[MongoDB Stitch Documnetation](https://docs.mongodb.com/stitch/)

## Support

  - [Bug Reports](https://github.com/waterkhair/stitching/issues/)
  - [MongoDB Support](https://docs.mongodb.org/manual/support/)

## Installation

```sh
$ npm install stitching
```

## Overview

For now, the plan is to give an easy way to manage [Authentication](https://docs.mongodb.com/stitch/authentication/) using [MongoDB Stitch](https://www.mongodb.com/cloud/stitch), but the real goal is to make everything else easier.

### Setting up Stitching.

Before using Stitching, you need to setup a `MongoDB Stitch` app. To get started, you can visit [Getting Started](https://docs.mongodb.com/stitch/getting-started/) page and follow the instructions. After you finish setting up a `MongoDB Stitch` app, you can use your APP ID to handle `Authentication`.

### Setting up Email/Password authentication

Before registering an user, you need to enable email/password authentication in `MongoDB Stitch` (Authentication -> Providers -> Email/Password):

* Email Confirm URL: The URL included on the confirmation email. You will need to setup Stitching to receive a Token/Token ID pair in order to confirm an email.
* Password Reset URL: The URL included on the password reset email. You will need to setup Stitching to receive a Token/Token ID pair in order to reset a password.
* Reset Password Email Subject: Subject for the reset password email.
* Email Confirmation Subject: Subject for the confirmation email.

### Creating optional metadata collection

Inside MongoDB Stitch, go to your Atlas Cluster and create a new collection:

* Database: The database where your metadata collection will belong (I.E. example).
* Collection: The metadata collection name used to store our user metadata (I.E. metadata).

After you created your collection, you need to set the next `Field Rules`:

#### Top-Level Document
READ
```json
{
  "owner_id": "%%user.id"
}
```
WRITE
```json
{
  "%or": [
    {
      "%%prevRoot.owner_id": "%%user.id"
    },
    {
      "%%prevRoot": {
        "%exists": false
      }
    }
  ]
}
```

#### owner_id
VALID
```json
"%%user.id"
```

**Note:** Email/Password authentication doesn't handle metadata out of the box. This means that after login to your MongoDB Stitch app, you don't have other information regarding the email. We need a collection to save user name, date of birth, address, etc. This is optional and we can skip this step.

### Connecting to MongoDB Stitch using Stitching

```js
var STITCH_CONFIG = {
    APP_ID: "example-<random_value>",
    CLUSTER: "mongodb-atlas",
    DB: "example",
    ENDPOINT: "https://stitch.mongodb.com",
    METADATA: "metadata" // Optional collection name to handle user metadata (I.E. name, dob, profile_image, etc)
};
var stitching = require("stitching");

stitching.connect(STITCH_CONFIG.APP_ID, STITCH_CONFIG.ENDPOINT, STITCH_CONFIG.CLUSTER, STITCH_CONFIG.DB, STITCH_CONFIG.METADATA);
```

After you connect your `Stitching`, you can access auth (`Stitching Authentication`), client (`MongoDB Stitch Client`), db (`MongoDB Stitch DB`) and providers (enum).

### Register a user

To register a new user (email/password):

```js
var stitching = require("stitching");

var email = "email@email.com";
var password = "Password1!";

stitching
    .auth()
    .registerUser(email, password)
    .then(() => {
        console.log(`An email was sent to ${email}. Please confirm the email by accessing the link provided.`);
    })
    .catch(console.error);
```

### Confirm an email

To confirm an email you need to setup `Stitching` on the `Email Confirm URL` to receive a Token/Token ID pair.

```js
var stitching = require("stitching");

// Logic to retrieve the Token/Token ID params from the Email Confirm URL
var token = "<TOKEN>";
var tokenId = "<TOKEN_ID>";

stitching
    .auth()
    .emailConfirm(tokenId, token)
    .then(console.log)
    .catch(console.error);
```

### Reset a password

In order to reset a password, first we need to sent a `Reset Password Email`:

```js
var stitching = require("stitching");

var email = "email@email.com";

stitching
    .auth()
    .passwordReset(tokenId, token, newPassword)
    .then(console.log)
    .catch(console.error);
```

After a `Reset Password Email URL` is accessed through the link provided on the `Reset Password Email`, we need to set the new password:

```js
var stitching = require("stitching");

// Logic to retrieve the Token/Token ID params from the Reset Password Email URL
var token = "<TOKEN>";
var tokenId = "<TOKEN_ID>";

var newPassword = "AnotherPassword1!";

stitching
    .auth()
    .passwordReset(tokenId, token, newPassword)
    .then(console.log)
    .catch(console.error);
```

### Login

After a registered email is confirmed, we can login:

```js
var stitching = require("stitching");

var email = "email@email.com";
var password = "Password1!";

stitching
    .auth()
    .login(email, password)
    .then((credentials) => {
        // If we setup metadata collection, we log it to console
        console.log(credentials.metadata);
    })
    .catch(console.error);
```

### Logout

Whenever we want to logout:

```js
var stitching = require("stitching");

stitching
    .auth()
    .logout()
    .catch(console.error);
```

### Update metadata

Whenever we want to logout:

```js
var stitching = require("stitching");

var metadata = {
    name: "John Doe",
    address: "123 Abc Street"
};

stitching
    .auth()
    .updateMetadata(metadata)
    .then(console.log)
    .catch(console.error);
```