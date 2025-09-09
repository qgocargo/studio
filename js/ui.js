import { renderJobsPage, renderCreatePodPage } from './deliveries.js';
import { renderAnalyticsPage } from './analytics.js';
import { getCurrentUser } from './auth.js';

const pages = {
    jobs: renderJobsPage,
    create: renderCreatePodPage,
    scan: renderScanPage,
    search: renderSearchPage,
    analytics: renderAnalyticsPage
};

export function initUI() {
    const tabs = document.querySelectorAll('.bottom-nav-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            showPage(tabName);
        });
    });
}

export function showPage(pageName) {
    const user = getCurrentUser();

    // Permissions
    if (pageName === 'create' || pageName === 'analytics') {
        if (user.role !== 'admin' && user.role !== 'ops') {
            showToast("You don't have permission to access this page.", "error");
            return;
        }
    }


    document.querySelectorAll('[data-page]').forEach(page => {
        page.classList.remove('active');
    });
    document.querySelectorAll('.bottom-nav-tab').forEach(tab => {
        tab.classList.remove('tab-active');
    });

    const pageElement = document.getElementById(`page-${pageName}`);
    const tabElement = document.querySelector(`[data-tab="${pageName}"]`);

    if (pageElement) {
        pageElement.classList.add('active');
        if (pages[pageName]) {
            pages[pageName]();
        }
    }

    if (tabElement) {
        tabElement.classList.add('tab-active');
    }

    const headerTitle = document.getElementById('header-title');
    if (headerTitle) {
        headerTitle.textContent = pageName.charAt(0).toUpperCase() + pageName.slice(1);
    }
}

// Stubs for pages not fully implemented
function renderScanPage() {
    document.getElementById('page-scan').innerHTML = `<p class="text-center text-gray-500 py-8">Scanner feature coming soon.</p>`;
}
function renderSearchPage() {
    document.getElementById('page-search').innerHTML = `<p class="text-center text-gray-500 py-8">Search feature coming soon.</p>`;
}


// --- TOAST NOTIFICATIONS ---
export function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    const colorClasses = {
        info: 'bg-blue-500',
        success: 'bg-green-500',
        error: 'bg-red-500',
    };
    toast.className = `fixed top-5 right-5 p-4 rounded-md text-white text-sm shadow-lg transform translate-x-full animate-slide-in z-50`;
    toast.textContent = message;

    // Add animation style
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes slide-in {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
        }
        .animate-slide-in { animation: slide-in 0.5s forwards; }
    `;
    document.head.appendChild(style);

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
        style.remove();
    }, 4000);
}


// --- MODAL ---
export function showModal(content) {
    const modalContainer = document.getElementById('modal-container');
    const modal = document.createElement('div');
    modal.id = 'app-modal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
            <div class="flex-1 overflow-y-auto">
                ${content}
            </div>
        </div>
    `;
    modalContainer.appendChild(modal);

    const modalDialog = modal.querySelector(':first-child');
    modal.addEventListener('click', (e) => {
        if (!modalDialog.contains(e.target)) {
            hideModal();
        }
    });
}

export function hideModal() {
    const modal = document.getElementById('app-modal');
    if (modal) {
        modal.remove();
    }
}
