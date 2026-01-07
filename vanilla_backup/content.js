// Cross-browser compatibility
const api = typeof browser !== "undefined" ? browser : chrome;

let observer = null;
let currentUrl = location.href;

function createDownloadButton() {
    if (!location.href.includes('/artworks/')) {
        return;
    }

    if (document.getElementById('pixiv-downloader-btn')) {
        return;
    }

    // Wait for the page to be sufficiently loaded to find the anchor or data
    const lookForTarget = setInterval(() => {
        const metadata = getPixivMetadata();

        if (metadata) {
            clearInterval(lookForTarget);
            injectButton(metadata);
        }
    }, 500);

    setTimeout(() => clearInterval(lookForTarget), 10000);
}

// Robust metadata parsing using global-data
function getPixivMetadata() {
    try {
        const globalDataMeta = document.querySelector('meta[name="global-data"]');
        if (!globalDataMeta || !globalDataMeta.content) return null;

        const globalData = JSON.parse(globalDataMeta.content);
        const illustId = location.pathname.split('/').pop();

        // globalData usually has 'preload' -> 'illust' -> [id]
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

function injectButton(metadata) {
    const btn = document.createElement('button');
    btn.id = 'pixiv-downloader-btn';
    btn.innerHTML = `
        <svg viewBox="0 0 24 24">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
        </svg>
        <span id="page-count">
            ${metadata.isManga ? metadata.pageCount : ''}
        </span>
    `;

    btn.onclick = (e) => {
        handleDownload(e, metadata, btn);
    };

    document.body.appendChild(btn);
}

function handleDownload(e, metadata, btn) {
    e.preventDefault();
    e.stopPropagation();

    // Prepare URLs
    let downloadTargets = [];

    if (metadata.isManga) {
        // Construct URLs for all pages
        // Format usually: .../123456_p0.jpg, .../123456_p1.jpg
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

    api.runtime.sendMessage({
        action: 'download_items',
        metadata: {
            id: metadata.id,
            author: metadata.author,
            title: metadata.title,
            pageCount: metadata.pageCount
        },
        targets: downloadTargets
    });

    // Animate button
    btn.style.backgroundColor = 'rgba(0, 200, 0, 0.8)';
    setTimeout(() => {
        btn.style.backgroundColor = '';
    }, 1500);
}

// Keyboard shortcut listener
document.addEventListener('keydown', (e) => {
    // Check for Shift + D
    if (e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        // Only trigger if we are on an artwork page and not typing in an input
        if (location.href.includes('/artworks/') &&
            !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {

            const btn = document.getElementById('pixiv-downloader-btn');
            if (btn) {
                btn.click();
            }
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
