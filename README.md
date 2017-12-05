# Stitching
A NodeJS module to use [MongoDB Stitch](https://www.mongodb.com/cloud/stitch) Authentication in an easy way.

## Content

  - [Documentation](https://www.npmjs.com/package/stitching#documentation)
  - [Support](https://www.npmjs.com/package/stitching#support)
  - [Installation](https://www.npmjs.com/package/stitching#installation)
  - [Overview](https://www.npmjs.com/package/stitching#overview)
  - [Setting up MongoDB Stitch app](https://www.npmjs.com/package/stitching#setting-up-mongodb-stitch-app)
    - [Setting up Email/Password authentication](https://www.npmjs.com/package/stitching#setting-up-emailpassword-authentication)
    - [Creating optional metadata collection](https://www.npmjs.com/package/stitching#creating-optional-metadata-collection)
        - [Top-Level Document](https://www.npmjs.com/package/stitching#top-level-document)
  - [Usage](https://www.npmjs.com/package/stitching#usage)
    - [Connecting to MongoDB Stitch app using Stitching](https://www.npmjs.com/package/stitching#connecting-to-mongodb-stitch-app-using-stitching)
    - [Provider authentication](https://www.npmjs.com/package/stitching#provider-authentication)
    - [Register a user](https://www.npmjs.com/package/stitching#register-a-user)
        - [Confirm an email](https://www.npmjs.com/package/stitching#confirm-an-email)
        - [Reset a password](https://www.npmjs.com/package/stitching#reset-a-password)
        - [Login](https://www.npmjs.com/package/stitching#login)
        - [Logout](https://www.npmjs.com/package/stitching#logout)
    - [Update user metadata](https://www.npmjs.com/package/stitching#update-user-metadata)

## Documentation

- [StitchingJS.com](http://stitchingjs.com/)
- [MongoDB Stitch Documentation](https://docs.mongodb.com/stitch/)

## Support

  - [Bug Reports](https://github.com/waterkhair/stitching/issues/)
  - [MongoDB Support](https://docs.mongodb.org/manual/support/)

## Installation

```sh
$ npm install stitching
```

## Overview

For now, the plan is to give an easy way to manage [Authentication](https://docs.mongodb.com/stitch/authentication/) using [MongoDB Stitch](https://www.mongodb.com/cloud/stitch), but the real goal is to make everything else easier.

## Setting up MongoDB Stitch app

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

READ (Only the owner of a document can read it)
```json
{
  "owner_id": "%%user.id"
}
```
WRITE (Anyone can create a new document, but only the owner of a document can write to it)
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

## Usage

### Connecting to MongoDB Stitch app using Stitching

Before using any `Stitching` functionality, lets connect to our `MongoDB Stitch` app.

```js
const stitching = require("stitching");

// Configuration
const APP_ID = "example-<random_value>";
const CLUSTER = "mongodb-atlas";
const DB = "example";
const ENDPOINT = "https://stitch.mongodb.com";
const METADATA = "metadata"; // Optional collection name to handle user metadata (I.E. name, dob, profile_image, etc)

// Connect to MongoDB Stitch app
stitching.connect(APP_ID, ENDPOINT, CLUSTER, DB, METADATA);
```

After you connect your `Stitching`, you can access auth (`Stitching Authentication`), client (`MongoDB Stitch Client`), db (`MongoDB Stitch DB`) and providers (enum).


### Provider authentication

You can use providers to authorize users to use your app. To enable a provider, go to Authentication -> Providers and follow the instructions for [Facebook](https://docs.mongodb.com/stitch/auth/facebook-auth/)/[Google](https://docs.mongodb.com/stitch/auth/google-auth/)/[Custom](https://docs.mongodb.com/stitch/auth/custom-auth/). After you setup a provider, you can use it as follows:

```js
const stitching = require("stitching");

// Authenticate using Facebook
stitching.auth
    .authenticate(stitching.providers.Facebook)
    .catch(console.error);
```

**Note:** After invoking `authentication`, you'll be redirected to Facebook where the user needs to grant permissions.

After you are authenticated, you'll be redireted back to your app. Credentials will be available through stitching.auth.getCredentials:

```js
const stitching = require("stitching");

// Get current credentials
stitching.auth
    .getCredentials()
    .then(console.log) // Log credentials to console
    .catch(console.error);
```

### Register a user

To register a new user (email/password):

```js
const stitching = require("stitching");

// User email/password
const email = "email@email.com";
const password = "Password1!";

// Register a user with the given email/password
stitching.auth
    .registerUser(email, password)
    .then(() => {
        console.log(`An email was sent to ${email}. Please confirm the email by accessing the link provided.`);
    })
    .catch(console.error);
```

#### Confirm an email

To confirm an email you need to setup `Stitching` on the `Email Confirm URL` to receive a Token/Token ID pair.

```js
const stitching = require("stitching");

// Implement your own logic to retrieve the Token/Token ID params from the Email Confirm URL
const token = "<TOKEN>";
const tokenId = "<TOKEN_ID>";

// Confirm the email providing the Token/Token ID
stitching.auth
    .emailConfirm(tokenId, token)
    .then(console.log)
    .catch(console.error);
```

#### Reset a password

In order to reset a password, first we need to sent a `Reset Password Email`:

```js
const stitching = require("stitching");

// User email
const email = "email@email.com";

// Send a password reset email
stitching.auth
    .sendPasswordReset(email)
    .then(console.log)
    .catch(console.error);
```

After a `Reset Password Email URL` is accessed through the link provided on the `Reset Password Email`, we need to set the new password:

```js
const stitching = require("stitching");

// Implement your own logic to retrieve the Token/Token ID params from the Email Confirm URL
const token = "<TOKEN>";
const tokenId = "<TOKEN_ID>";

// Set the new password
const newPassword = "AnotherPassword1!";

// Rest the password to the new one
stitching.auth
    .passwordReset(tokenId, token, newPassword)
    .then(console.log)
    .catch(console.error);
```

#### Login

After a registered email is confirmed, we can login:

```js
const stitching = require("stitching");

// User email/password
const email = "email@email.com";
const password = "Password1!";

// Login using the given email/password
stitching.auth
    .login(email, password)
    .then((credentials) => {
        // If we setup metadata collection, we log it to console
        console.log(credentials.metadata);
    })
    .catch(console.error);
```

#### Logout

Whenever we want to logout:

```js
const stitching = require("stitching");

// Logout from the current session
stitching.auth
    .logout()
    .catch(console.error);
```

### Update user metadata

Whenever we want to update the current user metadata:

```js
const stitching = require("stitching");

// Set the metadata for the current user
const metadata = {
    name: "John Doe",
    address: "123 Abc Street"
};

// Save metadata to database
stitching.auth
    .updateMetadata(metadata)
    .then(console.log)
    .catch(console.error);
```