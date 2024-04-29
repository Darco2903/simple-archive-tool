# Zip Module

## Description

This is a simple module that allows you to play with zip files in Node.js. To do so, it uses the `tar` command on both Windows and Linux (not tested on MacOS).

## Features

-   Zip single or multiple paths (directories or files)
-   Zip with root option
-   Unzip
-   List files in archive
-   List files in archive with stats
-   Progress callback
-   Test option

## Installation

```bash
npm install zip-module
```

## Usage

```js
const zip = require("zip-module");

// list files in archive
const files = zip.list("archive.zip");

// list files in archive with stats
const stats = zip.listStats("archive.zip");

// Zip single or multiple paths (directories or files)
zip.create("archive.zip", "toZip");
zip.create("archive.zip", "file.txt");
zip.create("archive.zip", ["toZip", "file.txt"]);

// Unzip
zip.extract("archive.zip", "./destination/");
```

#### Create and extract have a callback function that can be used to track progress

```js
zip.create("archive.zip", "toZip", {
    progressCb: (progress) => {
        console.log(progress); // { total, current, name }
    },
});
```

#### Create and extract have also a test option that can be used to test either if the archive creation or extraction is successful

```js
const success = await zip.create("archive.zip", "toZip", {
    test: true,
});
console.log(success); // true or false
```
