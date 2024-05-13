# Simple Archive Tool

## Description

This is a simple module that allows you to play with archives (zip/tar) files in Node.js. To do so, it uses the `tar` command on both Windows and Linux (not tested on MacOS).

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
npm install simple-archive-tool
```

## Usage

```js
const zip = require("simple-archive-tool");

// list files in archive
zip.list("archive.zip");

// list files in archive with stats
zip.listStats("archive.zip");

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

#### Create and extract have also a test option that can be used to test either if the archive creation or extraction is successful.

:warning: The test is a simple output read to check if all files are there. (When creating an archive, the test option will list the files in the archive and compare them with the files that were supposed to be archived. When extracting an archive, the test option will list the files in the output directory and compare them with the files that were supposed to be extracted.)

```js
const success = await zip.create("archive.zip", "toZip", {
    test: true,
});
console.log(success); // true or false
```
