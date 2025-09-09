import { getFirestore, collection, query, where, onSnapshot, orderBy, addDoc, serverTimestamp, getDocs } from "https://www_gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { getCurrentUser } from './auth.js';
import { showToast, showModal, hideModal } from './ui.js';
import { generateTrackingLink, uploadFile } from './utils.js';

const db = getFirestore();
let deliveriesUnsubscribe = null;

// RENDER PAGES ------------------------------------------

export function renderJobsPage() {
    const container = document.getElementById('page-jobs');
    container.innerHTML = `
        <div>
            <div class="flex justify-between items-center mb-4">
                <h1 class="text-2xl font-bold text-gray-800">My Deliveries</h1>
                <button id="logout-button" class="text-sm text-red-600 font-medium">Logout</button>
            </div>
            <div id="jobs-loader" class="text-center p-8"><p class="text-gray-500">Loading jobs...</p></div>
            <div id="jobs-list" class="space-y-3"></div>
        </div>
    `;

    document.getElementById('logout-button').addEventListener('click', async () => {
        const { logout } = await import('./auth.js');
        logout();
    });

    listenForDeliveries();
}

export async function renderCreatePodPage() {
    const user = getCurrentUser();
    const container = document.getElementById('page-create');

    if (user.role !== 'admin' && user.role !== 'ops') {
        container.innerHTML = `<p class="text-red-500">You do not have permission to create PODs.</p>`;
        return;
    }

    container.innerHTML = `
        <div class="max-w-lg mx-auto">
            <h1 class="text-2xl font-bold text-gray-800 mb-4">Create New Delivery</h1>
            <form id="create-pod-form" class="space-y-4">
                <div>
                    <label for="job-file-search" class="block text-sm font-medium text-gray-700">Search Job File</label>
                    <input type="text" id="job-file-search" placeholder="Job No, Shipper, Consignee..." class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm">
                    <div id="job-file-results" class="relative"></div>
                    <input type="hidden" id="job-file-id" required>
                </div>
                <div id="job-details-preview" class="p-3 bg-gray-100 rounded-md text-sm border min-h-[50px] hidden"></div>
                <div>
                    <label for="delivery-location" class="block text-sm font-medium text-gray-700">Delivery Location</label>
                    <textarea id="delivery-location" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"></textarea>
                </div>
                <div>
                    <label for="driver-select" class="block text-sm font-medium text-gray-700">Assign Driver</label>
                    <select id="driver-select" required class="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm"></select>
                </div>
                <button type="submit" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-800 hover:bg-slate-900">
                    Assign Delivery
                </button>
            </form>
        </div>
    `;

    await populateDrivers();
    setupJobFileSearch();

    document.getElementById('create-pod-form').addEventListener('submit', handleCreatePod);
}

// DATA LISTENERS & HANDLERS ------------------------------

function listenForDeliveries() {
    if (deliveriesUnsubscribe) {
        deliveriesUnsubscribe();
    }

    const user = getCurrentUser();
    if (!user) return;

    const deliveriesRef = collection(db, "deliveries");
    const q = query(deliveriesRef, where("driverUid", "==", user.uid), orderBy("createdAt", "desc"));

    deliveriesUnsubscribe = onSnapshot(q, (snapshot) => {
        const jobsList = document.getElementById('jobs-list');
        const loader = document.getElementById('jobs-loader');
        
        loader.classList.add('hidden');
        if (snapshot.empty) {
            jobsList.innerHTML = `<p class="text-center text-gray-500 py-8">You have no assigned deliveries.</p>`;
            return;
        }

        jobsList.innerHTML = ''; // Clear previous list
        snapshot.forEach(doc => {
            jobsList.appendChild(createJobCard(doc.id, doc.data()));
        });
    }, (error) => {
        console.error("Error fetching deliveries: ", error);
        showToast("Could not load deliveries.", "error");
        document.getElementById('jobs-loader').innerHTML = `<p class="text-red-500">Error loading data.</p>`;
    });
}

function createJobCard(id, data) {
    const card = document.createElement('div');
    card.className = `p-4 rounded-lg shadow-sm transition-all border ${data.status === 'Pending' ? 'bg-white' : 'bg-gray-100'}`;
    const isPending = data.status === 'Pending';
    const deliveryTime = data.completedAt ? new Date(data.completedAt.seconds * 1000).toLocaleString('en-US', { timeZone: 'Asia/Kuwait' }) : 'N/A';

    card.innerHTML = `
        <div class="flex justify-between items-start">
            <div>
                <p class="font-bold text-lg">${data.jobFileData.jfn}</p>
                <p class="text-sm text-gray-600">${data.deliveryLocation}</p>
                <p class="text-xs text-gray-400 mt-1">Assigned: ${new Date(data.createdAt.seconds * 1000).toLocaleDateString()}</p>
            </div>
            <span class="px-2 py-1 text-xs font-medium rounded-full ${isPending ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}">
                ${data.status}
            </span>
        </div>
        ${!isPending ? `
        <div class="mt-3 pt-3 border-t text-xs text-gray-500">
            <p><strong>Completed:</strong> ${deliveryTime}</p>
            <p><strong>Receiver:</strong> ${data.receiverName || 'N/A'}</p>
        </div>` : ''}
        <div class="mt-3 text-right">
            ${isPending 
                ? `<button data-action="complete" class="px-4 py-1.5 text-sm font-medium text-white bg-slate-700 rounded-md shadow-sm hover:bg-slate-800">Complete Delivery</button>`
                : `<button data-action="view-receipt" class="px-4 py-1.5 text-sm font-medium text-slate-700 bg-gray-200 rounded-md hover:bg-gray-300">View Receipt</button>`
            }
        </div>
    `;

    card.querySelector('[data-action="complete"]')?.addEventListener('click', () => {
        openCompletionModal(id, data);
    });
    // card.querySelector('[data-action="view-receipt"]')?.addEventListener('click', () => showReceipt(id));
    return card;
}

async function handleCreatePod(e) {
    e.preventDefault();
    const form = e.target;
    const user = getCurrentUser();

    const jobFileId = form.querySelector('#job-file-id').value;
    const driverUid = form.querySelector('#driver-select').value;
    const deliveryLocation = form.querySelector('#delivery-location').value;

    if (!jobFileId || !driverUid || !deliveryLocation) {
        showToast("Please fill all required fields.", "error");
        return;
    }

    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    button.textContent = 'Assigning...';

    try {
        const { getDoc, doc } = await import("https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js");
        const jobFileDoc = await getDoc(doc(db, 'jobfiles', jobFileId));
        const driverDoc = await getDoc(doc(db, 'users', driverUid));

        if (!jobFileDoc.exists() || !driverDoc.exists()) {
            throw new Error("Invalid job file or driver.");
        }
        
        const jobFileData = jobFileDoc.data();
        const driverData = driverDoc.data();

        const deliveryData = {
            jobFileId,
            jobFileData: {
                jfn: jobFileData.jfn || 'N/A',
                sh: jobFileData.sh || 'N/A',
                co: jobFileData.co || 'N/A',
                dsc: jobFileData.dsc || 'N/A',
                mawb: jobFileData.mawb || 'N/A',
            },
            deliveryLocation,
            driverUid,
            driverName: driverData.displayName,
            status: 'Pending',
            createdBy: user.uid,
            createdAt: serverTimestamp(),
        };

        await addDoc(collection(db, 'deliveries'), deliveryData);
        showToast("Delivery assigned successfully!", "success");
        form.reset();
        document.getElementById('job-details-preview').classList.add('hidden');

    } catch (error) {
        console.error("Error creating POD:", error);
        showToast("Failed to assign delivery.", "error");
    } finally {
        button.disabled = false;
        button.textContent = 'Assign Delivery';
    }
}


// MODAL & COMPLETION FLOW ------------------------------

async function openCompletionModal(deliveryId, deliveryData) {
    const { default: SignaturePad } = await import("https://cdn.jsdelivr.net/npm/signature_pad@4.0.0/dist/signature_pad.umd.min.js");

    const modalContent = `
        <div class="p-6 space-y-4">
            <h2 class="text-xl font-bold">Complete Delivery</h2>
            <div class="p-3 bg-gray-50 rounded-md border text-sm">
                <p><strong>Job:</strong> ${deliveryData.jobFileData.jfn}</p>
                <p><strong>To:</strong> ${deliveryData.deliveryLocation}</p>
            </div>
            <form id="completion-form">
                <div>
                    <label for="receiver-name" class="block text-sm font-medium">Receiver's Name</label>
                    <input type="text" id="receiver-name" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md">
                </div>
                <div>
                    <label class="block text-sm font-medium">Receiver's Signature</label>
                    <div class="mt-1 relative w-full h-48 bg-white border-2 border-dashed border-gray-300 rounded-md">
                        <canvas id="signature-pad" class="absolute top-0 left-0 w-full h-full"></canvas>
                    </div>
                    <div class="text-right mt-1">
                        <button type="button" id="clear-signature" class="text-xs text-gray-600 hover:text-gray-900">Clear</button>
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium">Delivery Photos (optional)</label>
                    <input type="file" id="delivery-photos" multiple accept="image/*" class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100">
                    <div id="photo-previews" class="mt-2 flex gap-2 flex-wrap"></div>
                </div>
                <div class="flex justify-end gap-2 pt-4 border-t">
                    <button type="button" id="cancel-completion" class="px-4 py-2 text-sm font-medium bg-gray-200 rounded-md">Cancel</button>
                    <button type="submit" id="submit-completion" class="px-4 py-2 text-sm font-medium text-white bg-slate-800 rounded-md">Mark as Delivered</button>
                </div>
            </form>
        </div>
    `;

    showModal(modalContent);

    const canvas = document.getElementById('signature-pad');
    const signaturePad = new SignaturePad(canvas, { backgroundColor: 'rgb(255, 255, 255)' });

    function resizeCanvas() {
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        canvas.getContext("2d").scale(ratio, ratio);
        signaturePad.clear(); // otherwise contents will be scaled
    }
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    document.getElementById('clear-signature').addEventListener('click', () => signaturePad.clear());
    document.getElementById('cancel-completion').addEventListener('click', hideModal);
    
    document.getElementById('delivery-photos').addEventListener('change', (e) => {
        const files = e.target.files;
        const previewsContainer = document.getElementById('photo-previews');
        previewsContainer.innerHTML = '';
        if (files.length > 5) {
            showToast("You can upload a maximum of 5 photos.", "error");
            e.target.value = ''; // Reset file input
            return;
        }
        for (const file of files) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = document.createElement('img');
                img.src = event.target.result;
                img.className = "w-16 h-16 object-cover rounded-md";
                previewsContainer.appendChild(img);
            };
            reader.readAsDataURL(file);
        }
    });

    document.getElementById('completion-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const receiverName = document.getElementById('receiver-name').value;
        if (!receiverName.trim()) {
            showToast("Receiver's name is required.", "error");
            return;
        }
        if (signaturePad.isEmpty()) {
            showToast("Signature is required.", "error");
            return;
        }

        const submitBtn = document.getElementById('submit-completion');
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block"></span>&nbsp;Submitting...`;
        
        try {
            const signatureDataUrl = signaturePad.toDataURL('image/png');
            const photoFiles = document.getElementById('delivery-photos').files;
            
            let photoUrls = [];
            if (photoFiles.length > 0) {
                const uploadPromises = Array.from(photoFiles).map(file => {
                    const filePath = `pods/${deliveryId}/${file.name}`;
                    return uploadFile(filePath, file);
                });
                photoUrls = await Promise.all(uploadPromises);
            }

            const { doc, setDoc, updateDoc, writeBatch } = await import("https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js");
            
            const podData = {
                ...deliveryData,
                receiverName,
                signatureDataUrl,
                photoUrls,
                status: 'Delivered',
                completedAt: serverTimestamp()
            };
            delete podData.createdAt; // Don't need this in the pod doc

            const batch = writeBatch(db);
            const podRef = doc(db, 'pods', deliveryId);
            batch.set(podRef, podData);

            const deliveryRef = doc(db, 'deliveries', deliveryId);
            batch.update(deliveryRef, {
                status: 'Delivered',
                completedAt: serverTimestamp(),
                receiverName: receiverName
            });

            await batch.commit();

            showToast("Delivery completed successfully!", "success");
            hideModal();
            window.removeEventListener("resize", resizeCanvas);

        } catch (error) {
            console.error("Error completing delivery:", error);
            showToast("Failed to complete delivery.", "error");
            submitBtn.disabled = false;
            submitBtn.textContent = 'Mark as Delivered';
        }
    });
}

// HELPERS ------------------------------------------------

async function populateDrivers() {
    const select = document.getElementById('driver-select');
    select.innerHTML = '<option value="">Loading drivers...</option>';
    try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('role', '==', 'driver'), where('status', '==', 'active'));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            select.innerHTML = '<option value="">No active drivers found</option>';
            return;
        }

        select.innerHTML = '<option value="">-- Select a Driver --</option>';
        snapshot.forEach(doc => {
            const driver = doc.data();
            const option = document.createElement('option');
            option.value = doc.id;
            option.textContent = driver.displayName;
            select.appendChild(option);
        });
    } catch (e) {
        console.error("Error fetching drivers:", e);
        select.innerHTML = '<option value="">Error loading drivers</option>';
    }
}

function setupJobFileSearch() {
    const searchInput = document.getElementById('job-file-search');
    const resultsContainer = document.getElementById('job-file-results');
    const jobFileIdInput = document.getElementById('job-file-id');
    const previewContainer = document.getElementById('job-details-preview');

    let searchTimeout;

    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        const searchTerm = searchInput.value.trim().toLowerCase();
        if (searchTerm.length < 2) {
            resultsContainer.innerHTML = '';
            return;
        }
        searchTimeout = setTimeout(async () => {
            resultsContainer.innerHTML = `<div class="p-2 text-sm text-gray-500">Searching...</div>`;
            try {
                // Firestore doesn't support full-text search natively. This is a basic implementation.
                // For a real app, a search service like Algolia or a more complex query structure is needed.
                const jobFilesRef = collection(db, 'jobfiles');
                const snapshot = await getDocs(jobFilesRef);
                const results = [];
                snapshot.forEach(doc => {
                    const data = doc.data();
                    const jfn = (data.jfn || '').toLowerCase();
                    const sh = (data.sh || '').toLowerCase();
                    const co = (data.co || '').toLowerCase();
                    if (jfn.includes(searchTerm) || sh.includes(searchTerm) || co.includes(searchTerm)) {
                        results.push({ id: doc.id, ...data });
                    }
                });

                if (results.length === 0) {
                    resultsContainer.innerHTML = `<div class="p-2 text-sm text-gray-500">No results found.</div>`;
                    return;
                }
                
                resultsContainer.innerHTML = `
                    <div class="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-y-auto">
                        ${results.map(job => `
                            <div class="p-2 hover:bg-gray-100 cursor-pointer" data-id="${job.id}" data-jfn="${job.jfn}" data-sh="${job.sh}" data-co="${job.co}">
                                <p class="font-medium">${job.jfn}</p>
                                <p class="text-xs text-gray-500">${job.sh} / ${job.co}</p>
                            </div>
                        `).join('')}
                    </div>
                `;

            } catch (e) {
                console.error("Error searching job files:", e);
                resultsContainer.innerHTML = `<div class="p-2 text-sm text-red-500">Search failed.</div>`;
            }
        }, 500);
    });

    resultsContainer.addEventListener('click', (e) => {
        const item = e.target.closest('[data-id]');
        if (item) {
            jobFileIdInput.value = item.dataset.id;
            searchInput.value = `${item.dataset.jfn} - ${item.dataset.sh}`;
            previewContainer.innerHTML = `<p><strong>Job No:</strong> ${item.dataset.jfn}</p><p><strong>Details:</strong> ${item.dataset.sh} / ${item.dataset.co}</p>`;
            previewContainer.classList.remove('hidden');
            resultsContainer.innerHTML = '';
        }
    });

    // Hide results when clicking outside
    document.addEventListener('click', (e) => {
        if (!resultsContainer.contains(e.target) && e.target !== searchInput) {
            resultsContainer.innerHTML = '';
        }
    });
}
