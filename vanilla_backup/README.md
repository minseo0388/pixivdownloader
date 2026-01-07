# Pixiv Image Downloader

[![Standard README](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

> A cross-browser extension to download Pixiv illustrations in original quality with one click.

This extension injects a convenient download button onto Pixiv artwork pages, allowing you to save images directly with customizable filenames. It supports both Chrome and Firefox (Manifest V3).

## Table of Contents

- [Features](#features)
- [Background](#background)
- [Install](#install)
- [Usage](#usage)
- [Configuration](#configuration)
- [Development](#development)
- [Maintainers](#maintainers)
- [License](#license)

## Features

- **One-Click Download**: Saves the original quality image.
- **Multi-Page Support**: Automatically downloads all pages for manga/comics.
- **Smart Metadata**: Extracts accurate author and title info from Pixiv's internal data.
- **Keyboard Shortcut**: Press `Shift + D` to download instantly.
- **Cross-Browser**: Compatible with Chrome, Edge, and Firefox.
- **Custom Filenames**: Define your own folder structure and filename format (e.g., `Pixiv/{author}/{id}.jpg`).
- **SPA Support**: Automatically detects page navigation without refreshing.

## Background

Pixiv's interface requires multiple clicks to access the original image file. This extension simplifies the process by overlaying a direct download button. It handles the retrieval of the highest resolution image URL and manages the download through the browser's native API.

## Install

### Chrome / Edge
1. Clone or download this repository.
2. Go to `chrome://extensions`.
3. Enable **Developer mode** in the top right.
4. Click **Load unpacked** and select the extension directory.

### Firefox
1. Clone or download this repository.
2. Go to `about:debugging#/runtime/this-firefox`.
3. Click **Load Temporary Add-on...**.
4. Select the `manifest.json` file.

## Usage

1. Navigate to any Pixiv illustration page (e.g., `https://www.pixiv.net/en/artworks/12345678`).
2. A semi-transparent **Download Button** will appear in the bottom-right corner of the window.
3. Click the button to download the image.

## Configuration

You can customize the download path and filename format.

1. Click the extension icon in your browser toolbar.
2. Select **Options**.
3. Edit the **Filename Template**.
   - **Default**: `Pixiv/{author}/{id}_{title}.{ext}`
   - **Supported Tags**:
     - `{id}`: Artwork ID
     - `{author}`: Artist Name
     - `{title}`: Artwork Title
     - `{ext}`: File Extension
     - `{year}`, `{month}`, `{day}`: Date headers

## Development

### Project Structure

```
├── manifest.json      # Extension configuration (MV3)
├── content.js         # Content script (UI injection, DOM scraping)
├── background.js      # Service worker (Download handling)
├── options.html       # Options page UI
├── options.js         # Options logic
└── style.css          # Button styles
```

### Building

No build step is required. The project uses vanilla JavaScript, HTML, and CSS.

## Maintainers

- [@minseo0388](https://github.com/minseo0388)

## License

[MIT](LICENSE) © 2026 Choi Minseo
