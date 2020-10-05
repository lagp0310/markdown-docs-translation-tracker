var franc = require("franc");
var fs = require("fs");
var path = require("path");
var os = require("os");

// TODO: Configuration in JSON file with default adaptable config.
// TODO: Percentage coverage in each file for each detected language.

/**
 * Global Configuration.
 */

/**
 * Root path for documentation.
 * 
 * **Note**: This is taken from the project's root path.
 */
var docsRootPath = null;

/**
 * Whether or not to find files recursively.
 */
var recursive = true;

/**
 * Which directories to exclude from analysis.
 */
var directoriesToExclude = [];

/**
 * Which files to exclude from analysis.
 */
var filesToExclude = [];

/**
 * Which file formats to exclude from analysis.
 */
var fileFormatsToExclude = [];

/**
 * Only work with files with these file formats.
 */
var onlyFileFormats = [];

/**
 * Which languages to use for franc.
 * 
 * **Note**: If this is specified, languagesToExclude will be pased as [].
 */
var onlyLanguages = [];

/**
 * Which languages to exclude from analysis.
 * 
 * **Note**: If onlyLanguages is specified, this is ignored (pased as []).
 */
var languagesToExclude = [];

/**
 * Limit results. Only take the first _n_ languages. -1 means no limit.
 * 
 * **Note**: They're in descending order: from the most probable to the least probable.
 */
var limitResultsTo = -1;

/**
 * Default table header to produce a Markdown table.
 */
var defaultTableHeader = "| Filename | Languages\n|---|---|\n";

/**
 * Default directory in which to save the generated Markdown file.
 */
var tableFilenameDirectory = "./";

/**
 * Default filename to write the Markdown table.
 */
var tableFilename = "Table.md";

/**
 * Global Variables.
 */

/**
 * File List from docsRootPath.
 */
var fileList = [];

/**
 * This will setup the application with provided arguments.
 * 
 * @param {*} root 
 * @param {*} recursive 
 * @param {*} directoriesToExclude 
 * @param {*} filesToExclude 
 * @param {*} fileFormatsToExclude 
 * @param {*} onlyFileFormats 
 * @param {*} onlyLanguages 
 * @param {*} languagesToExclude 
 * @param {*} limitResultsTo 
 * @param {*} tableFilename 
 * @param {*} defaultTableHeader 
 */
function setup(root = "./", recursive = true, directoriesToExclude = [], filesToExclude = [], fileFormatsToExclude = [], onlyFileFormats = [], onlyLanguages = [], 
                languagesToExclude = [], limitResultsTo = -1, tableFilenameDirectory = "./", tableFilename = "Table.md", 
                defaultTableHeader = "| Filename | Languages\n|---|---|\n") {
    // TODO: Check conditions here.
    docsRootPath = root;
    recursive = recursive;
    directoriesToExclude = directoriesToExclude;
    filesToExclude = filesToExclude;
    fileFormatsToExclude = fileFormatsToExclude;
    onlyFileFormats = onlyFileFormats;
    onlyLanguages = onlyLanguages;
    languagesToExclude = languagesToExclude;
    limitResultsTo = limitResultsTo;
    tableFilename = tableFilename;
    defaultTableHeader = defaultTableHeader;
    tableFilenameDirectory = tableFilenameDirectory;

    return true;
}

/**
 * Check whether or not this file will be excluded from fileList
 * (by filename).
 * 
 * @param {*} filename 
 */
function isFileToBeExcludedByFilename(filename) {
    return !(filesToExclude.find((value, index, array) => {
        return value === filename;
    }) === undefined);
}

/**
 * Check whether or not this file will be excluded from fileList 
 * (by format or extension).
 * 
 * @param {*} format 
 */
function isFileToBeExcludedByFormat(format) {
    return !(fileFormatsToExclude.find((value, index, array) => {
        return value === format;
    }) === undefined);
}

/**
 * Get the file list for root directory and subdirectories (if any).
 * 
 * @param {*} relativeRootPath 
 * @param  {...any} joinPath 
 */
function getFileList(relativeRootPath = docsRootPath, ...joinPath) {
    var completePath = relativeRootPath, dirsAndFiles = null;

    // Check if joinPath argument was provided.
    if(typeof joinPath == "object" && joinPath.length > 0) {
        joinPath.forEach((element, index, array) => {
            completePath = path.join(completePath, element);
        });
    }

    // Read the root directory.
    dirsAndFiles = fs.readdirSync(completePath, { encoding: "utf8", withFileTypes: true }) || [];

    dirsAndFiles.forEach((element, index, array) => {
        if(element.isDirectory()) {
            getFileList(completePath, element.name);
        } else if(element.isFile()) {
            if(!isFileToBeExcludedByFilename(path.basename(element.name)) && 
                !isFileToBeExcludedByFormat(path.extname(element.name))) {
                fileList.push(path.join(completePath, element.name));
            } else {
                console.log("Ignoring: " + element.name + " (excluded).")
            }
        } else {
            console.warn("Ignoring: " + element.name + " (not a directory or file).");
        }
    });
}

/**
 * Get File Content for the specified file.
 * 
 * @param {*} file - The file to read the content from.
 */
function getFileContent(file) {
    /*fs.readFile(file, { encoding: "utf8", flag: "r" }, (err, data) => {
        if(err) {
            return console.error(err);
        }
        
        return data;
    });*/
    return fs.readFileSync(file, { encoding: "utf8", flag: "r" });
}

/**
 * Returns the language/languages that franc got from the content of the file.
 * 
 * @param {*} content 
 */
function getLanguages(content) {
    var identifiedLanguages = [];

    if(!content) {
        console.error("There's no content to determine language.");
        return {};
    }

    // Check config arguments provided to setup.
    if(onlyLanguages.length != 0) {
        // Here we call franc to make the analysis.
        return franc.all(content, { only: onlyLanguages }) || [];
    } else if(languagesToExclude.length != 0) {
        // Here we call franc to make the analysis.
        return franc.all(content, { ignore: languagesToExclude }) || [];
    }

    // All languages.
    identifiedLanguages = franc.all(content) || [];

    // Check limits config argument.
    if(limitResultsTo == -1) {
        // No limits.
        return identifiedLanguages;
    } else {
        // Slice this Array according to specified limits and return it.
        return identifiedLanguages.slice(0, limitResultsTo);
    }
}

/**
 * Produce a Markdown table with the rows returned by the produceMarkdownRow function.
 * 
 * @param {*} filesArray 
 * @param {*} tableHeader 
 */
function produceMarkdownTable(filesArray, tableHeader = defaultTableHeader) {
    var table = null;

    // Set table header.
    table = tableHeader;

    // Get each file to build the table.
    filesArray.forEach((element, index, array) => {
        table += "|[" + path.basename(element[0]) + "](" + element[0] + ")|" + element[1][0] + "|\n"
    });

    return table;
}

/**
 * Write the generated table to a Markdown file.
 * 
 * @param {*} dir - The directory to write the file to.
 * @param {*} filename - The file name to be written.
 */
function writeMarkdownToFile(dir = "./", filename = tableFilename, data = "No data provided.") {
    return fs.writeFileSync(path.join(dir, filename), data, { encoding: "utf8", mode: 0o666, flag: "w" });
}

// Testing.
setup("../docs/src", limitResultsTo = 5, onlyLanguages = ["eng", "spa"], filesToExclude = [".gitkeep", ".gitignore"], 
fileFormatsToExclude = [".mp4", ".ico", ".svg", ".js", ".jpg", ".png", ".vue", ".gif", ".styl", ".json", ".scss"]);

/**
 * Make the whole process of analyzing files, detecting languages, 
 * building the Markdown table and writing it to a file.
 */
function findAndDetect() {
    var list, content, languages, table = null;

    getFileList();
    list = fileList;
    fileList = [];
    list.forEach((element, index, array) => {
        content = getFileContent(element);
        languages = getLanguages(content);
        fileList.push([element, languages]);
    });

    table = produceMarkdownTable(fileList);

    writeMarkdownToFile(tableFilenameDirectory, tableFilename, table);
    
    return true;
}

findAndDetect();