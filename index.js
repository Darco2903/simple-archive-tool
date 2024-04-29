const { promises: fs } = require("fs");
const path = require("path");
const { exec } = require("child_process");

const ZIP_CMD = "tar";

const isWin = process.platform === "win32";
const linLineEnd = "\n";
const winLineEnd = "\r\n";
const lineEnd = isWin ? winLineEnd : linLineEnd;
const std = isWin ? "stderr" : "stdout";

const parseName = isWin ? (line) => line.substring(2) : (line) => line;

function parseOutput(data) {
    return data
        .split("\n")
        .filter((d) => d.trim())
        .map(parseName);
}

function test(files, toTest) {
    const setToTest = new Set(toTest);
    const diff = files.filter((f) => !setToTest.has(f));
    return diff.length === 0;
}

async function testArchive(name, files) {
    const archiveFiles = (await list(name)).map((f) => (f.endsWith("/") ? f.substring(0, f.length - 1) : f));
    files = files.map((f) => f.replaceAll(/\\/g, "/"));
    return test(files, archiveFiles);
}

async function testExtract(archiveFiles, dest) {
    let files = await walk(dest, dest);
    files = files.map((f) => f.replaceAll(/\\/g, "/"));
    archiveFiles = archiveFiles.map((f) => (f.endsWith("/") ? f.substring(0, f.length - 1) : f));
    return test(archiveFiles, files);
}

function parseStatLin(line) {
    let [permissions, ownerGroup, size, date, time, name] = line.split(/\s+/);
    return parseStat(permissions, ...ownerGroup.split("/"), size, date, time, name);
}

function parseStat(permissions, owner, group, size, date, time, name) {
    return { permissions, owner, group, size, date, time, name };
}

/**
 * @param {String} cmd
 * @param {import("child_process").ExecOptions} options
 * @returns {Promise<String>}
 */
async function execPromise(cmd, options) {
    return new Promise((resolve, reject) => {
        exec(cmd, options, (err, stdout, stderr) => {
            if (err) reject(err);
            else resolve(stdout);
        });
    });
}

async function walk(dir, root = "") {
    let results = [];
    const curr = path.relative(root, dir);
    if (curr) results.push(curr);
    const list = await fs.readdir(dir);
    for (const file of list) {
        const filePath = path.join(dir, file);
        const stat = await fs.stat(filePath);
        // remove root from path
        if (stat.isDirectory()) results = results.concat(await walk(filePath, root));
        else results.push(path.relative(root, filePath));
    }
    return results;
}

async function create(name, sources, { progressCb, root = process.cwd(), test = false } = {}) {
    return new Promise(async (resolve, reject) => {
        if (!Array.isArray(sources)) sources = [sources];
        sources = sources.map((s) => `"${s}"`).join(" ");
        const cmd = `${ZIP_CMD} -cvf "${path.relative(root, name)}" ${sources}`;
        const promises = sources.map(async (s) => {
            const p = path.join(root, s);
            const stat = await fs.stat(p);
            return stat.isDirectory() ? await walk(p, root) : path.relative(root, p);
        });

        const files = (await Promise.all(promises)).flat();
        const total = files.length;

        const child = exec(cmd, { cwd: root }, async (err, stdout, stderr) => {
            if (err) reject(err);
            else resolve(test ? await testArchive(name, files) : true);
        });

        if (!progressCb) return;
        let i = 0;
        child[std].on("data", (data) => {
            parseOutput(data).forEach((d) => {
                progressCb({ total, current: ++i, name: d });
            });
        });
    });
}

async function extract(archiveName, dest, { progressCb, test = false } = {}) {
    return new Promise(async (resolve, reject) => {
        const cmd = `${ZIP_CMD} -xvf "${archiveName}" -C "${dest}"`;
        const archiveFiles = await list(archiveName);
        const total = archiveFiles.length;

        const child = exec(cmd, { shell: true }, async (err, stdout, stderr) => {
            if (err) reject(err);
            else resolve(test ? await testExtract(archiveFiles, dest) : true);
        });

        if (!progressCb) return;
        let i = 0;
        child[std].on("data", (data) => {
            parseOutput(data).forEach((d) => {
                progressCb({ total, current: ++i, name: d });
            });
        });
    });
}

async function list(archiveName) {
    const cmd = `${ZIP_CMD} -tf "${archiveName}"`;
    return execPromise(cmd).then((stdout) => stdout.split(lineEnd).slice(0, -1));
}

async function listStats(archiveName) {
    const cmd = `${ZIP_CMD} -tvf "${archiveName}"`;
    return execPromise(cmd, { shell: "bash" }).then((stdout) => stdout.split(linLineEnd).slice(0, -1).map(parseStatLin));
}

module.exports = {
    create,
    extract,
    list,
    listStats,
};
