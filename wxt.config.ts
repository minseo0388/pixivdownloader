import { defineConfig } from 'wxt';

export default defineConfig({
    manifest: {
        name: 'Pixiv Image Downloader',
        description: 'Download Pixiv images with one click (WXT V2).',
        version: '2.0.0',
        permissions: [
            'downloads',
            'storage',
            'declarativeNetRequest'
        ],
        host_permissions: [
            '*://*.pixiv.net/*'
        ]
    }
});
