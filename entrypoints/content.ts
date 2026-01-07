import './style.css';

export default defineContentScript({
    matches: ['*://*.pixiv.net/*'],
    runAt: 'document_end',
    main() {
        let observer: MutationObserver | null = null;
        let currentUrl = location.href;

        function createDownloadButton() {
            if (!location.href.includes('/artworks/')) {
                return;
            }

            if (document.getElementById('pixiv-downloader-btn')) {
                return;
            }

            const lookForTarget = setInterval(() => {
                const metadata = getPixivMetadata();

                if (metadata) {
                    clearInterval(lookForTarget);
                    injectButton(metadata);
                }
            }, 500);

            setTimeout(() => clearInterval(lookForTarget), 10000);
        }

        function getPixivMetadata() {
            try {
                const globalDataMeta = document.querySelector('meta[name="global-data"]');
                if (!globalDataMeta || !globalDataMeta.getAttribute('content')) return null;

                const globalData = JSON.parse(globalDataMeta.getAttribute('content')!);
                const illustId = location.pathname.split('/').pop()!;

                if (globalData.preload && globalData.preload.illust && globalData.preload.illust[illustId]) {
                    const illustData = globalData.preload.illust[illustId];
                    return {
                        id: illustData.illustId,
                        title: illustData.illustTitle,
                        author: illustData.userName,
                        authorId: illustData.userId,
                        pageCount: illustData.pageCount,
                        originalUrl: illustData.urls.original,
                        isManga: illustData.pageCount > 1
                    };
                }
            } catch (e) {
                console.error("Pixiv Downloader: Failed to parse metadata", e);
            }
            return null;
        }

        function injectButton(metadata: any) {
            const btn = document.createElement('button');
            btn.id = 'pixiv-downloader-btn';

            // Use simpler string concatenation to avoid template literal escaping issues in tool calls
            const svg = '<svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>';
            const count = metadata.isManga ? metadata.pageCount : '';
            btn.innerHTML = svg + '<span id="page-count">' + count + '</span>';

            btn.onclick = (e) => {
                handleDownload(e, metadata, btn);
            };

            document.body.appendChild(btn);
        }

        function handleDownload(e: MouseEvent, metadata: any, btn: HTMLButtonElement) {
            e.preventDefault();
            e.stopPropagation();

            let downloadTargets = [];

            if (metadata.isManga) {
                const baseUrl = metadata.originalUrl.replace(/_p0\.(jpg|jpeg|png|gif)/, '_p{i}.$1');
                const ext = metadata.originalUrl.split('.').pop();

                for (let i = 0; i < metadata.pageCount; i++) {
                    downloadTargets.push({
                        url: baseUrl.replace('{i}', i),
                        page: i,
                        ext: ext
                    });
                }
            } else {
                downloadTargets.push({
                    url: metadata.originalUrl,
                    page: 0,
                    ext: metadata.originalUrl.split('.').pop()
                });
            }

            browser.runtime.sendMessage({
                action: 'download_items',
                metadata: {
                    id: metadata.id,
                    author: metadata.author,
                    title: metadata.title,
                    pageCount: metadata.pageCount
                },
                targets: downloadTargets
            });

            btn.style.backgroundColor = 'rgba(0, 200, 0, 0.8)';
            setTimeout(() => {
                btn.style.backgroundColor = '';
            }, 1500);
        }

        document.addEventListener('keydown', (e) => {
            if (e.shiftKey && (e.key === 'D' || e.key === 'd')) {
                if (location.href.includes('/artworks/') &&
                    !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName || '')) {

                    const btn = document.getElementById('pixiv-downloader-btn');
                    if (btn) btn.click();
                }
            }
        });

        const observeUrlChange = () => {
            if (currentUrl !== location.href) {
                currentUrl = location.href;
                const oldBtn = document.getElementById('pixiv-downloader-btn');
                if (oldBtn) oldBtn.remove();
                createDownloadButton();
            }
        };

        observer = new MutationObserver(() => {
            observeUrlChange();
            if (location.href.includes('/artworks/') && !document.getElementById('pixiv-downloader-btn')) {
                createDownloadButton();
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });

        createDownloadButton();
    }
});
