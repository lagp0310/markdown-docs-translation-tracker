var fs = require("fs");
var path = require("path");
var franc = require("franc");
var iso6393 = require('iso-639-3');

// TODO: Order languages, for example, first English and then others.
// TODO: Percentage coverage in each file for each detected language.
// TODO: Additionally to percentage in coverage, we should show how many words there are for each detected language (configurable how many languages are shown).
// TODO: Implement function to exclude some text from the file (i.e. comments which needs to remain in English, or fragments with badges which are also English only).
// TODO: Regexp matching for file names.

/**
 * Global Configuration.
 */

/**
 * Default filename for configuration file.
 */
var configFilename = "config.json";

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
 * 
 * **Note**: When onlyFileFormats is set, this parameter will be [].
 */
var fileFormatsToExclude = [];

/**
 * Only work with files with these file formats.
 * 
 * **Note**: This parameter will have higher priority when setting both, 
 * fileFormatsToExclude and onlyFileFormats, so setting this parameter 
 * will make fileFormatsToExclude equal to [].
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
 * Read the config file.
 * 
 * @param {*} filename 
 */
function readJSONConfigFile(filename = configFilename) {
    var config = fs.readFileSync(filename, { encoding: "utf8", flag: "r" });
    return JSON.parse(config);
}

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
function setup(filename = configFilename) {
    var jsonConfig = readJSONConfigFile(filename);

    // Check arguments provided in configuration file.
    if(!fs.existsSync(jsonConfig.docsRootPath)) {
        console.error(jsonConfig.docsRootPath + " does not exist.");
        return false;
    }

    if(typeof recursive != "boolean") {
        console.error(jsonConfig.recursive + " must be a boolean.");
        return false;
    }

    if(typeof directoriesToExclude != "object") {
        console.error(jsonConfig.recursive + " must be an object.");
        return false;
    }

    if(typeof filesToExclude != "object") {
        console.error(jsonConfig.recursive + " must be an object.");
        return false;
    }

    if(typeof fileFormatsToExclude != "object") {
        console.error(jsonConfig.recursive + " must be an object.");
        return false;
    }

    if(typeof onlyFileFormats != "object") {
        console.error(jsonConfig.recursive + " must be an object.");
        return false;
    }

    if(typeof onlyLanguages != "object") {
        console.error(jsonConfig.recursive + " must be an object.");
        return false;
    }

    if(typeof languagesToExclude != "object") {
        console.error(jsonConfig.recursive + " must be an object.");
        return false;
    }

    if(typeof limitResultsTo != "number") {
        console.error(jsonConfig.recursive + " must be an object.");
        return false;
    }

    if(typeof defaultTableHeader != "string") {
        console.error(jsonConfig.recursive + " must be an object.");
        return false;
    }

    if(typeof tableFilenameDirectory != "string") {
        console.error(jsonConfig.recursive + " must be an object.");
        return false;
    }

    if(typeof tableFilename != "string") {
        console.error(jsonConfig.recursive + " must be an object.");
        return false;
    }

    // Check configuration and set default values where required.
    if(onlyFileFormats.length > 0) {
        fileFormatsToExclude = [];
    }

    if(onlyLanguages.length > 0) {
        languagesToExclude = [];
    }

    // Set configuration parameters.
    docsRootPath = jsonConfig.docsRootPath;
    recursive = jsonConfig.recursive;
    directoriesToExclude = jsonConfig.directoriesToExclude;
    filesToExclude = jsonConfig.filesToExclude;
    fileFormatsToExclude = jsonConfig.fileFormatsToExclude;
    onlyFileFormats = jsonConfig.onlyFileFormats;
    onlyLanguages = jsonConfig.onlyLanguages;
    languagesToExclude = jsonConfig.languagesToExclude;
    limitResultsTo = jsonConfig.limitResultsTo;
    defaultTableHeader = jsonConfig.defaultTableHeader;
    tableFilenameDirectory = jsonConfig.tableFilenameDirectory;
    tableFilename = jsonConfig.tableFilename;

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
 * Check whether or not this file format will be included.
 * 
 * @param {*} format 
 */
function isFileFormatToBeIncluded(format) {
    return !(onlyFileFormats.find((value, index, array) => {
        return value === format;
    }) === undefined);
}

/**
 * Check whether or not this directory will be excluded.
 * 
 * @param {*} dirname 
 */
function isDirectoryToBeExcluded(dirname) {
    return !(directoriesToExclude.find((value, index, array) => {
        return value === dirname;
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
        if(element.isDirectory() && 
            recursive === true && 
            !isDirectoryToBeExcluded(element.name)) {
            getFileList(completePath, element.name);
        } else if(element.isFile()) {
            // Check for file formats to be included first.
            if(isFileFormatToBeIncluded(path.extname(element.name))) {
                fileList.push(path.join(completePath, element.name));
            } else {
                // Check for filenames and file formats to be excluded.
                if(onlyFileFormats.length == 0 &&
                    !isFileToBeExcludedByFilename(path.basename(element.name)) && 
                    !isFileToBeExcludedByFormat(path.extname(element.name))) {
                    fileList.push(path.join(completePath, element.name));
                } else {
                    console.log("Ignoring: " + element.name + " (excluded).")
                }
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
    return fs.readFileSync(file, { encoding: "utf8", flag: "r" });
}

/**
 * Get long name languages. By default, franc returns ISO-639-3 (language represented by
 * three letter code), so we need to get something like "English" or "Spanish" which is 
 * more human-readable in tables.
 * 
 * @param {*} languagesArray 
 */
function getLongNameLanguages(languagesArray) {
    if(typeof languagesArray != "object" || languagesArray.length === 0) {
        console.error("You must provide an array with languages.");
        return [];
    }

    var longNameLanguage = null;

    languagesArray.forEach((element, index, array) => {
        longNameLanguage = iso6393.find((value, index, array) => {
            return value.iso6393 === element[0];
        });

        if(typeof longNameLanguage == "object") {
            element[0] = longNameLanguage.name;
        } else {
            console.warn("Language: " + element[0] + " not found. Returning \'undefined\' for it.");
        }
    });
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
        table += "|[" + path.basename(element[0]) + "](" + element[0] + ")|" + element[1][0][0] + "|\n"
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
        longNameLanguages = getLongNameLanguages(languages);
        fileList.push([element, languages]);
    });

    table = produceMarkdownTable(fileList);

    writeMarkdownToFile(tableFilenameDirectory, tableFilename, table);
    
    return true;
}

setup(configFilename);
findAndDetect();