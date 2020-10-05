var franc = require("franc");
var fs = require("fs");
var path = require("path");

/**
 * Global Configuration.
 */

/**
 * Root path for documentation.
 * 
 * **Note**: This is seen from the project's root path.
 */
var docsRootPath = null;

/**
 * Whether or not to find files recursively.
 */
var recursive = true;

/**
 * Which folders to exclude from analysis.
 */
var foldersToExclude = [];

/**
 * Which files to exclude from analysis.
 */
var filesToExclude = [];

/**
 * Which file formats to exclude from analysis.
 */
var fileFormatsToExclude = [];

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
var defaultTableHeader = "| Location | Filename | Languages\n|---|---|---|\n";

/**
 * Global Constants.
 */

/**
 * TODO: Check this in Node.js docs.
 */
const FILE_TYPE_ID = 1;

/**
 * TODO: Check this in Node.js docs.
 */
const DIR_TYPE_ID = 2;

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
 * @param {*} foldersToExclude 
 * @param {*} filesToExclude 
 * @param {*} fileFormatsToExclude 
 * @param {*} languages 
 */
function setup(root = "./", recursive = true, foldersToExclude = [], filesToExclude = [], fileFormatsToExclude = [], onlyLanguages = [], 
                languagesToExclude = [], limitResultsTo = -1) {
    // TODO: Check conditions here.
    docsRootPath = root;
    recursive = recursive;
    foldersToExclude = foldersToExclude;
    filesToExclude = filesToExclude;
    fileFormatsToExclude = fileFormatsToExclude;
    onlyLanguages = onlyLanguages;
    languagesToExclude = languagesToExclude;
    limitResultsTo = limitResultsTo;

    // TODO: Return object with configuration?
    return true;
}

/**
 * Get the file list for docsRootPath.
 */
function getFileList() {
    // var fileList = fs.readdirSync(docsRootPath, { encoding: "utf8", withFileTypes: true }, (err, files) => {
    //     if(err) {
    //         return console.error("Couldn't read files from: " + docsRootPath + ".");
    //     }

    //     fileList = files;
    // });
    // TODO: Add recursivity.
    return fs.readdirSync(docsRootPath, { encoding: "utf8", withFileTypes: true });
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
 */
function produceMarkdownTable(filesArray, tableHeader = defaultTableHeader) {
    var table = null;

    // Set table header.
    table = tableHeader;

    // Get each file to build the table.
    filesArray.forEach((element, index, array) => {
        table += "|" + element[0] + "|" + element[1] + "|" + element[2][0] + "|\n"
    });

    return table;
}

/**
 * Write the generated table to a Markdown file.
 * 
 * @param {*} dir - The directory to write the file to.
 * @param {*} filename - The file name to be written.
 */
function writeMarkdownToFile(dir = "./", filename = "Table.md", data = "No data provided.") {
    return fs.writeFileSync(path.join(dir, filename), data, { encoding: "utf8", mode: 0o666, flag: "w" });
}

// Testing.
setup("../docs/src", limitResultsTo = 5, onlyLanguages = ["eng", "spa"]);
test();
var table = produceMarkdownTable([
    ["src", "README.md", [["spa", 1],["eng",0.9799729580755949]]],
    ["src", "TEST.md", [["spa", 1],["eng",0.9799729580755949]]],
    ["src", "CONTRIBUTING.md", [["spa", 1],["eng",0.9799729580755949]]]
]);
//console.log(table);
writeMarkdownToFile("./", "Table.md", table);

async function test() {
    var fileLocation = getFileList()[1].name;
    var content = getFileContent(docsRootPath + "/" + fileLocation);
    var languages = getLanguages(content);
}