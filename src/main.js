var fs = require("fs");
var path = require("path");
var franc = require("franc");
var iso6393 = require('iso-639-3');

// TODO: Write tests (another branch).
// TODO: Percentage coverage in each file for each detected language.
// TODO: Additionally to percentage in coverage, we should show how many words there are for each detected language (configurable how many languages are shown).
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
 * The root path for the repository in which the documentation is stored.
 * This is to properly create links to each file.
 */
var repositoryRootPath = null;

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
 * Sort by language. Place this at the top of the table.
 * 
 * **Note**: This language is given in ISO-639-3 format (three letters).
 */
var sortFirstLanguage = null;

/**
 * Desired language on each file.
 * This is to place an emoji to identify faster all translated files.
 */
var desiredLanguage = null;

/**
 * Which words to exclude from text analysis.
 */
var excludeWords = [];

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
 * @param {*} filename 
 */
function setup(filename = configFilename) {
    var jsonConfig = readJSONConfigFile(filename);

    // Check arguments provided in configuration file.
    if(!fs.existsSync(jsonConfig.docsRootPath)) {
        console.error("docsRootPath does not exist.");
        return false;
    }

    if(typeof jsonConfig.repositoryRootPath != "string") {
        console.error("repositoryRootPath must be a string.");
        return false;
    }    

    if(typeof jsonConfig.recursive != "boolean") {
        console.error("recursive must be a boolean.");
        return false;
    }

    if(!Array.isArray(jsonConfig.directoriesToExclude)) {
        console.error("directoriesToExclude must be an array.");
        return false;
    }

    if(!Array.isArray(jsonConfig.filesToExclude)) {
        console.error("filesToExclude must be an array.");
        return false;
    }

    if(!Array.isArray(jsonConfig.fileFormatsToExclude)) {
        console.error("fileFormatsToExclude must be an array.");
        return false;
    }

    if(!Array.isArray(jsonConfig.onlyFileFormats)) {
        console.error("onlyFileFormats must be an array.");
        return false;
    }

    if(!Array.isArray(jsonConfig.onlyLanguages)) {
        console.error("onlyLanguages must be an array.");
        return false;
    }

    if(!Array.isArray(jsonConfig.languagesToExclude)) {
        console.error("languagesToExclude must be an array.");
        return false;
    }

    if(typeof jsonConfig.limitResultsTo != "number") {
        console.error("limitResultsTo must be a number.");
        return false;
    }

    if(typeof jsonConfig.defaultTableHeader != "string") {
        console.error("defaultTableHeader must be a string.");
        return false;
    }

    if(typeof jsonConfig.tableFilenameDirectory != "string") {
        console.error("tableFilenameDirectory must be a string.");
        return false;
    }

    if(typeof jsonConfig.tableFilename != "string") {
        console.error("tableFilename must be a string.");
        return false;
    }

    if(typeof jsonConfig.sortFirstLanguage != "string" && jsonConfig.sortFirstLanguage != null) {
        console.error("sortFirstLanguage must be a string or be null.");
        return false;
    }

    if(typeof jsonConfig.desiredLanguage != "string" && jsonConfig.desiredLanguage != null) {
        console.error("desiredLanguage must be a string or null.");
        return false;
    }

    if(!Array.isArray(jsonConfig.excludeWords)) {
        console.error("excludeWords must be an array.");
        return false;
    }

    // Check configuration and set default values or show errors where required.
    if(jsonConfig.onlyFileFormats.length > 0) {
        fileFormatsToExclude = [];
    }

    if(jsonConfig.onlyLanguages.length > 0) {
        languagesToExclude = [];
    }

    if(typeof jsonConfig.sortFirstLanguage == "string" && jsonConfig.sortFirstLanguage.length != 3) {
        console.error("sortFirstLanguage config parameter must be in ISO-639-3 format (three letters) or be null.");
        return false;
    }

    if(typeof jsonConfig.desiredLanguage == "string" && jsonConfig.desiredLanguage.length != 3) {
        console.error("desiredLanguage config parameter must be in ISO-639-3 format (three letters) or be null.");
        return false;
    }

    // Set configuration parameters.
    docsRootPath = jsonConfig.docsRootPath;
    repositoryRootPath = jsonConfig.repositoryRootPath;
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
    sortFirstLanguage = jsonConfig.sortFirstLanguage;
    desiredLanguage = jsonConfig.desiredLanguage;
    excludeWords = jsonConfig.excludeWords;

    return true;
}

/**
 * Check whether or not this file will be excluded from fileList
 * (by filename).
 * 
 * @param {*} filename 
 */
function isFileToBeExcludedByFilename(filename) {
    return !(filesToExclude.find((value) => {
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
    return !(fileFormatsToExclude.find((value) => {
        return value === format;
    }) === undefined);
}

/**
 * Check whether or not this file format will be included.
 * 
 * @param {*} format 
 */
function isFileFormatToBeIncluded(format) {
    return !(onlyFileFormats.find((value) => {
        return value === format;
    }) === undefined);
}

/**
 * Check whether or not this directory will be excluded.
 * 
 * @param {*} dirname 
 */
function isDirectoryToBeExcluded(dirname) {
    return !(directoriesToExclude.find((value) => {
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
    if(Array.isArray(joinPath) && joinPath.length > 0) {
        joinPath.forEach((element) => {
            completePath = path.join(completePath, element);
        });
    }

    // Read the root directory.
    dirsAndFiles = fs.readdirSync(completePath, { encoding: "utf8", withFileTypes: true }) || [];

    dirsAndFiles.forEach((element) => {
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
 * Get long name language. By default, franc returns ISO-639-3 (language represented by
 * three letter code), so we need to get something like "English" or "Spanish" which is 
 * more human-readable in tables.
 * 
 * @param {*} language 
 */
function getLongNameLanguage(language) {
    if(typeof language != "string") {
        console.error("You must provide a string with the ISO-639-3 language code.");
        return undefined;
    }

    var longNameLanguage = iso6393.find((value) => {
        return value.iso6393 === language;
    });

    if(typeof longNameLanguage == "object") {
        return longNameLanguage.name;
    } else {
        console.warn("Language not found. Returning \'undefined\' for it.");
        return undefined;
    }
}

/**
 * Get long name languages. By default, franc returns ISO-639-3 (language represented by
 * three letter code), so we need to get something like "English" or "Spanish" which is 
 * more human-readable in tables.
 * 
 * @param {*} languagesArray 
 */
function getLongNameLanguages(languagesArray) {
    if(!Array.isArray(languagesArray) || languagesArray.length === 0) {
        console.error("You must provide an array with languages.");
        return [];
    }

    var longNameLanguage = null;

    languagesArray.forEach((element) => {
        longNameLanguage = iso6393.find((value) => {
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
 * Sort this files list by language, placing first the language defined by sortLanguage argument.
 * 
 * @param {*} fileList 
 * @param {*} sortLanguage 
 */
function sortFilesByLanguage(fileList, sortLanguage = sortFirstLanguage) {
    if(!Array.isArray(fileList) || fileList.length === 0) {
        console.error("You must provide a fileList as array. Returning unchanged provided fileList.");
        return fileList;
    }

    var longLanguageName = null;
    longLanguageName = getLongNameLanguage(sortLanguage);

    return fileList.sort((a, b) => {
        if(a[1][0][0].indexOf(longLanguageName) != -1 && b[1][0][0].indexOf(longLanguageName) == -1) {
            return -1;
        } else if(a[1][0][0].indexOf(longLanguageName) == -1 && b[1][0][0].indexOf(longLanguageName) != -1) {
            return 1;
        }
        
        return 0;
    });
}

/**
 * Produce a Markdown table with the rows returned by the produceMarkdownRow function.
 * 
 * @param {*} filesArray 
 * @param {*} tableHeader 
 */
function produceMarkdownTable(filesArray, tableHeader = defaultTableHeader) {
    if(!Array.isArray(filesArray) || filesArray.length === 0) {
        console.error("You must provide a filesArray as array. Returning null.");
        return null;
    }

    var table = null, emoji = null, longLanguage = getLongNameLanguage(desiredLanguage);

    // Set table header.
    table = tableHeader;

    // Get each file to build the table.
    filesArray.forEach((element) => {
        if(desiredLanguage != null) {
            emoji = " " + (element[1][0][0] == longLanguage ? ":heavy_check_mark:" : ":x:");
        } else {
            emoji = "";
        }

        table += "|[" + path.basename(element[0]) + "](" + element[0].replace(docsRootPath, repositoryRootPath) + ")|" + 
        element[1][0][0] + emoji +
        "|\n"
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
 * Extract words from text, so it won't be analyzed.
 * Use cases: Extracting English only text such as framework dependent code.
 * 
 * @param {*} words 
 * @param {*} text 
 */
function extractWordsFromAnalysis(words, text) {
    if(!Array.isArray(words) || words.length === 0) {
        console.error("words must be a non-empty array. Returning text without changes.");
        return text;
    }

    var wordsRegexp = "(";
    
    words.forEach((element, index, array) => {
        wordsRegexp += element;

        if(index !== (array.length - 1)) {
            wordsRegexp +=  "|";
        }
    });

    wordsRegexp += ")";

    const WORDS_REGEXP = new RegExp(wordsRegexp, "g");

    return text.replace(WORDS_REGEXP, "");
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
    list.forEach((element) => {
        content = getFileContent(element);

        if(excludeWords.length > 0) {
            content = extractWordsFromAnalysis(excludeWords, content);
        }

        languages = getLanguages(content);
        longNameLanguages = getLongNameLanguages(languages);
        fileList.push([element, languages]);
    });

    if(sortFirstLanguage != null) {
        table = sortFilesByLanguage(fileList, sortFirstLanguage);
    }

    table = produceMarkdownTable(fileList);

    writeMarkdownToFile(tableFilenameDirectory, tableFilename, table);
    
    return true;
}

setup(configFilename);
findAndDetect();