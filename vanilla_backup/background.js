// Cross-browser compatibility
const api = typeof browser !== "undefined" ? browser : chrome;

const DEFAULT_TEMPLATE = 'Pixiv/{author}/{id}_{title}.{ext}';

// Sanitize filename helper
const sanitize = (str) => {
    return str ? str.replace(/[<>:"/\\|?*]/g, '_') : 'Unknown';
};

// Format filename based on template
const getFilename = (template, data, pageIndex, totalPages) => {
    let filename = template;
    const now = new Date();

    let suffix = '';
    if (totalPages > 1) {
        suffix = `_p${pageIndex}`;
    }

    const replacements = {
        '{id}': data.id + suffix,
        '{author}': sanitize(data.author),
        '{title}': sanitize(data.title),
        '{ext}': data.ext,
        '{year}': now.getFullYear(),
        '{month}': String(now.getMonth() + 1).padStart(2, '0'),
        '{day}': String(now.getDate()).padStart(2, '0'),
    };

    // Replace keys
    for (const [key, value] of Object.entries(replacements)) {
        filename = filename.split(key).join(value);
    }

    return filename;
};

// Listen for messages from content script
api.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Legacy support or fallback (though we overwrote content.js, keeping consistent)
    if (message.action === 'download_image') {
        // ... (legacy logic omitted for cleaner V2 codebase)
    }

    if (message.action === 'download_items') {
        const { metadata, targets } = message;

        api.storage.sync.get({ filenameTemplate: DEFAULT_TEMPLATE }, (items) => {
            targets.forEach((target) => { // target has { url, page, ext }

                const fileData = {
                    ...metadata,
                    ext: target.ext
                };

                const filename = getFilename(
                    items.filenameTemplate,
                    fileData,
                    target.page,
                    metadata.pageCount
                );

                api.downloads.download({
                    url: target.url,
                    filename: filename,
                    saveAs: false
                });
            });
        });
    }
});
