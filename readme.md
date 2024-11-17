# FavorDeploy

## What is FavorDeploy

FavorDeploy is a deployment utility for managing WordPress theme deployments. It simplifies the process of building assets and deploying them to a remote server using rsync.

Minimum node version is Dubnium v10.24.1.

**NOTE: Still in beta.**

## Configuration

Put file etc. .production.env, .staging.env files in the root of the theme
with the following variables:

- USERNAME
- HOST
- WP_ROOT_DIR
- WP_THEME_DIR

Use favordeploy/.example.env as a starter.

**Make sure npm package contains npm run build script to build production ready assets**

## Usage

To run favordeploy, run `node node_modules/favordeploy {environment-name}` - but I recommend adding following npm scripts

```
"deploy": "npm run deploy:prod",
"deploy:prod": "node node_modules/favordeploy production",
"deploy:staging": "node node_modules/favordeploy staging",
```

To override deploy function, add favordeploy.deploy.js -file in the root of project.

See example.favordeploy.deploy.js for an example.

See .deployignore for files excluded from deployment. Add .deployignore into root to override it.
