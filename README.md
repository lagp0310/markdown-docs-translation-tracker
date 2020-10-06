# Markdown Docs Translation Tracker.

## About.

A simple tool to keep tracking of translation of documentation written in Markdown. It uses [franc](https://github.com/wooorm/franc) as a library to detect languages on files and [iso-639-3](https://github.com/wooorm/iso-639-3) to get each language in a human-readable format.

## Why?

The idea behind this project is to have an automated tool that can keep track of which files are translated or not in a repository that contains documentation written in Markdown. This way, translation becomes a little bit easier. From the main Readme, the team can see file list and probable language of each file. The table also provides direct access to each file by creating a link to it and placing it into the table.

## Features.

- Recursively explore directories to detect the language for each file.
- File Inclusion and Exclusion.
- Directory Inclusion and Exclusion.
- File Format (Extension) Inclusion and Exclusion.
- Exclude languages from being detected.
- Markdown Table generation with links to files in the repository.

## Planned Features.

- Sorting languages in table. For example, place all English files at the top.
- Show words percentage on each detected language.
- Text exclusion. For example, exclude English content that should not be translated (as some code).

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

    - `docsRootPath (string)`: The root path of your documentation project in your local environment.
    - `repositoryRootPath (string)`: The root path of the documentation in the repository.
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

    It should generate a Markdown file with a table. For example, the following is an example table generated using part of the [Vue Docs Next](https://github.com/vuejs/docs-next) documentation:

    | Filename | Language
    |---|---|
    |[README.md](src/.vuepress/theme/README.md)|English|
    |[README.md](src/README.md)|Spanish|
    |[application-api.md](src/api/application-api.md)|English|
    |[application-config.md](src/api/application-config.md)|English|
    |[basic-reactivity.md](src/api/basic-reactivity.md)|English|
    |[built-in-components.md](src/api/built-in-components.md)|English|
    |[composition-api.md](src/api/composition-api.md)|English|
    |[computed-watch-api.md](src/api/computed-watch-api.md)|English|

    This table provides direct access to each file in the repository and shows the most probable language for the contents of each file, according to [franc](https://github.com/wooorm/franc) library results. 

## Contributing.

See [CONTRIBUTING](CONTRIBUTING.md).

## License.

[MIT](LICENSE) © Luis Alberto.