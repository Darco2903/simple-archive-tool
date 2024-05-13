type ProgressCallback = ({ total: number, current: number, name: string }) => void;

type FileStat = {
    permissions: string;
    owner: string;
    group: string;
    size: string;
    date: string;
    time: string;
    name: string;
};

/**
 * Create a zip archive
 *
 * @param name The name of the archive
 * @param sources The files to add to the archive
 * @param options Options
 * @param options.progressCb A callback that will be called with the progress of the operation
 * @param options.root The root directory to use when creating the archive
 * @param options.test If true, the archive will be tested after creation
 */
export async function create(
    name: string,
    sources: string | string[],
    options?: {
        progressCb: ProgressCallback;
        root: string;
        test?: boolean;
    }
): Promise<boolean>;

/**
 * Extract a zip archive
 *
 * @param archivePath The name of the archive
 * @param dest The destination directory
 * @param options Options
 * @param options.progressCb A callback that will be called with the progress of the operation
 * @param options.test If true, the extracted files will be tested after extraction
 */
export async function extract(
    archivePath: string,
    dest: string,
    options?: {
        progressCb: ProgressCallback;
        test?: boolean;
    }
): Promise<boolean>;

/**
 * Return the file list of an archive
 *
 * @param archivePath The name of the archive
 */
export async function list(archivePath: string): Promise<string[]>;

/**
 * Return the file list of an archive with stats
 *
 * @param archivePath The name of the archive
 */
export async function listStats(archivePath: string): Promise<FileStat[]>;
