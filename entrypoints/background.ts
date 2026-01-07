
export default defineBackground(() => {
    // Cross-browser compatibility is handled by WXT implicitly via webextension-polyfill usually,
    // but standard browser API is globally available in MV3 WXT environments.

    const DEFAULT_TEMPLATE = 'Pixiv/{author}/{id}_{title}.{ext}';

    const sanitize = (str: string) => {
        return str ? str.replace(/[<>:"/\\|?*]/g, '_') : 'Unknown';
    };

    const getFilename = (template: string, data: any, pageIndex: number, totalPages: number) => {
        let filename = template;
        const now = new Date();

        let suffix = '';
        if (totalPages > 1) {
            suffix = `_p${pageIndex}`;
        }

        const replacements: Record<string, string> = {
            '{id}': data.id + suffix,
            '{author}': sanitize(data.author),
            '{title}': sanitize(data.title),
            '{ext}': data.ext,
            '{year}': String(now.getFullYear()),
            '{month}': String(now.getMonth() + 1).padStart(2, '0'),
            '{day}': String(now.getDate()).padStart(2, '0'),
        };

        for (const [key, value] of Object.entries(replacements)) {
            filename = filename.split(key).join(value);
        }

        return filename;
    };

    browser.runtime.onMessage.addListener((message: any) => {
        if (message.action === 'download_items') {
            const { metadata, targets } = message;

            browser.storage.sync.get({ filenameTemplate: DEFAULT_TEMPLATE }).then((items: any) => {
                targets.forEach((target: any) => {
                    const fileData = {
                        ...metadata,
                        ext: target.ext
                    };

                    const filename = getFilename(
                        items.filenameTemplate || DEFAULT_TEMPLATE,
                        fileData,
                        target.page,
                        metadata.pageCount
                    );

                    browser.downloads.download({
                        url: target.url,
                        filename: filename,
                        saveAs: false
                    });
                });
            });
        }
    });

    // Load DNR rules
    browser.declarativeNetRequest.updateDynamicRules({
        addRules: [
            {
                "id": 1,
                "priority": 1,
                "action": {
                    "type": "modifyHeaders",
                    "requestHeaders": [
                        { "header": "Referer", "operation": "set", "value": "https://www.pixiv.net/" }
                    ]
                },
                "condition": {
                    "urlFilter": "i.pximg.net",
                    "resourceTypes": ["xmlhttprequest", "image", "other"] // "main_frame" usually excluded to avoid redirect loops if any
                }
            }
        ],
        removeRuleIds: [1]
    });
});
