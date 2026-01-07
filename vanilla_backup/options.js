// Cross-browser compatibility
const api = typeof browser !== "undefined" ? browser : chrome;

// Default settings
const DEFAULT_TEMPLATE = 'Pixiv/{author}/{id}_{title}.{ext}';

// Saves options to storage
const saveOptions = () => {
    const filenameTemplate = document.getElementById('filenameTemplate').value;

    api.storage.sync.set(
        { filenameTemplate: filenameTemplate },
        () => {
            // Update status to let user know options were saved.
            const status = document.getElementById('status');
            status.textContent = 'Options saved.';
            status.className = 'success';
            status.style.display = 'block';

            setTimeout(() => {
                status.textContent = '';
                status.style.display = 'none';
            }, 2000);
        }
    );
};

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
const restoreOptions = () => {
    api.storage.sync.get(
        { filenameTemplate: DEFAULT_TEMPLATE },
        (items) => {
            document.getElementById('filenameTemplate').value = items.filenameTemplate;
        }
    );
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
