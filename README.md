# Markdown Docs Translation Tracker.

## About.

A simple tool to keep tracking of translation of documentation written in Markdown. It uses [franc](https://github.com/wooorm/franc) as a library to detect languages on files and [iso-639-3](https://github.com/wooorm/iso-639-3) to get each language in a human-readable format.

## Getting Started.

1. Install dependencies.

    ```bash
    npm install
    ```

2. Copy configuration file from `config.json.example`.

    On Linux/OSX:
    ```bash
    cp config.json.example config.json
    ```

    On Windows:
    ```bash
    copy config.json.example config.json
    ```

3. Adapt the `config.json` file to your project.

    The configuration for this tool is made in `config.json`. Here's a list of the current parameters that can be used:

    - `docsRootPath (string)`: The root path of your documentation project.
    - `recursive (boolean)`: Whether or not to search files in directories recursively.
    - `directoriesToExclude (Array)`: Which directories to exclude when searching files.
    - `filesToExclude (Array)`: Which files to exclude from the search. **Note**: These must have the dot before the file extension, for example `.css`.
    - `fileFormatsToExclude (Array)`: Which file formats to exclude when searching files. **Note**: These must have the dot before the file extension, for example `.json`.
    - `onlyFileFormats (Array)`: Only include these file formats when searching files. **Note**: These must have the dot before the file extension, for example `.md`.
    - `onlyLanguages (Array)`: Only include these languages when making prediction of the language on files. **Note**: These must be in [ISO-639-3](https://github.com/wooorm/iso-639-3/blob/main/to-1.json) format (three letter code).
    - `languagesToExclude (Array)`: Which languages to exclude when making prediction of the language on files. **Note**: These must be in [ISO-639-3](https://github.com/wooorm/iso-639-3/blob/main/to-1.json) format (three letter code).
    - `limitResultsTo (Number)`: Limit languages results.
    - `defaultTableHeader (string)`: Table header to use in the resulting table.
    - `tableFilenameDirectory (string)`: Directory to place the resulting Markdown file.
    - `tableFilename (string)`: Filename of the resulting Markdown file.
    - `sortFirstLanguage (string | null)`: Which language to place at the top of the table. **Note**: This must be in [ISO-639-3](https://github.com/wooorm/iso-639-3/blob/main/to-1.json) format (three letter code).

    For default values, please check `config.json.example` file.

4. Run.

    After configuring the tool, you can run it using the following command:

    ```bash
    node src/main.js
    ```

    It should generate a Markdown file in the specified directory with a table.

## License.

[MIT](LICENSE) © Luis Alberto.