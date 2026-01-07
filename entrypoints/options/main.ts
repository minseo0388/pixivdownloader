// Default settings
const DEFAULT_TEMPLATE = 'Pixiv/{author}/{id}_{title}.{ext}';

// Saves options to storage
const saveOptions = () => {
    const filenameTemplate = (document.getElementById('filenameTemplate') as HTMLInputElement).value;

    browser.storage.sync.set({ filenameTemplate: filenameTemplate }).then(() => {
        // Update status to let user know options were saved.
        const status = document.getElementById('status');
        if (status) {
            status.textContent = 'Options saved.';
            status.className = 'success';
            status.style.display = 'block';

            setTimeout(() => {
                status.textContent = '';
                status.style.display = 'none';
            }, 2000);
        }
    });
};

// Restores select box and checkbox state using the preferences
const restoreOptions = () => {
    browser.storage.sync.get({ filenameTemplate: DEFAULT_TEMPLATE }).then((items: any) => {
        const input = document.getElementById('filenameTemplate') as HTMLInputElement;
        if (input) {
            input.value = items.filenameTemplate;
        }
    });
};

document.addEventListener('DOMContentLoaded', restoreOptions);
const saveBtn = document.getElementById('save');
if (saveBtn) {
    saveBtn.addEventListener('click', saveOptions);
}
