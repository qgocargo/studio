import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { showModal, hideModal, showToast } from "./ui.js";
import { generatePdf } from "./utils.js";

const db = getFirestore();

export async function showPodReceipt(podId) {
    const modalContent = `
        <div id="receipt-loader" class="p-8 text-center">Loading receipt...</div>
        <div id="receipt-content-wrapper" class="hidden"></div>
    `;
    showModal(modalContent);

    try {
        const podRef = doc(db, 'pods', podId);
        const podSnap = await getDoc(podRef);

        if (podSnap.exists()) {
            renderReceipt(podSnap.data());
            document.getElementById('receipt-loader').classList.add('hidden');
            document.getElementById('receipt-content-wrapper').classList.remove('hidden');
        } else {
            throw new Error("POD not found");
        }
    } catch (error) {
        console.error("Error fetching receipt:", error);
        document.getElementById('receipt-loader').textContent = 'Error: Could not load receipt.';
        showToast("Failed to load receipt.", "error");
    }
}

async function renderReceipt(data) {
    const wrapper = document.getElementById('receipt-content-wrapper');
    const { jobFileData, receiverName, completedAt, deliveryLocation, signatureDataUrl, photoUrls, jobFileId } = data;
    const kuwaitTime = new Date(completedAt.seconds * 1000).toLocaleString('en-US', { timeZone: 'Asia/Kuwait' });
    
    // Dynamically import QRCode library
    const { default: QRCode } = await import('https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js');
    const trackingUrl = window.location.href.replace('index.html', '').replace(/#.*$/, '') + 'track.html?id=' + jobFileId;
    const qrCodeDataUrl = await QRCode.toDataURL(trackingUrl, { width: 80 });

    wrapper.innerHTML = `
        <div id="receipt-printable-area" class="p-6 bg-white text-black">
            <div class="space-y-4">
                <div class="flex justify-between items-start pb-4 border-b-2">
                    <div>
                        <h1 class="font-extrabold text-3xl" style="color: #243c5a;">Q'go<span style="color: #52a39a;">Cargo</span></h1>
                        <p class="text-xs text-gray-500">www.qgocargo.com</p>
                    </div>
                    <div class="text-right text-xs">
                        <p class="font-bold">PROOF OF DELIVERY</p>
                        <p>CARGO DIVISION, KUWAIT</p>
                    </div>
                </div>
                <div class="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    ${Object.entries({
                        "Job File No": jobFileData.jfn, "AWB / MAWB": jobFileData.mawb,
                        "Shipper": jobFileData.sh, "Consignee": jobFileData.co
                    }).map(([label, value]) => `<div><strong class="text-gray-500 block">${label}:</strong> <span class="font-mono">${value || 'N/A'}</span></div>`).join('')}
                </div>
                <div class="bg-gray-50 p-4 rounded-lg border">
                    <h4 class="font-bold text-base mb-3">Delivery Confirmation</h4>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        <div><strong class="text-gray-500 block">Delivered To:</strong> ${receiverName}</div>
                        <div><strong class="text-gray-500 block">Date & Time:</strong> ${kuwaitTime}</div>
                        <div class="col-span-2"><strong class="text-gray-500 block">Delivery Address:</strong> ${deliveryLocation}</div>
                    </div>
                    <div class="mt-4 pt-4 border-t">
                        <p class="text-gray-500 text-sm font-bold mb-1">Receiver's Signature:</p>
                        <img src="${signatureDataUrl}" alt="Signature" class="bg-white border p-1 rounded-md shadow-inner"/>
                    </div>
                </div>
                ${(photoUrls && photoUrls.length > 0) ? `
                <div class="pt-4 border-t">
                    <h4 class="font-bold text-base mb-2">Delivery Photos</h4>
                    <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        ${photoUrls.map(url => `<a href="${url}" target="_blank"><img src="${url}" class="w-full h-auto object-cover rounded-md aspect-square"/></a>`).join('')}
                    </div>
                </div>` : ''}
                <div class="pt-4 border-t-2 flex justify-between items-center">
                    <p class="text-xs text-gray-500">Thank you for your business.</p>
                    <img src="${qrCodeDataUrl}" alt="Tracking QR Code"/>
                </div>
            </div>
        </div>
        <div class="p-4 bg-gray-100 flex justify-end gap-2">
            <button id="close-receipt" class="px-4 py-2 text-sm font-medium bg-gray-200 rounded-md">Close</button>
            <button id="download-pdf" class="px-4 py-2 text-sm font-medium text-white bg-slate-800 rounded-md">Download PDF</button>
        </div>
    `;

    document.getElementById('close-receipt').addEventListener('click', hideModal);
    document.getElementById('download-pdf').addEventListener('click', async (e) => {
        const btn = e.currentTarget;
        btn.disabled = true;
        btn.textContent = 'Generating...';
        try {
            const printableArea = document.getElementById('receipt-printable-area');
            const pdf = await generatePdf(printableArea);
            pdf.save(`POD-${jobFileData.jfn}.pdf`);
        } catch (error) {
            console.error("PDF Generation failed:", error);
            showToast("Could not generate PDF.", "error");
        } finally {
            btn.disabled = false;
            btn.textContent = 'Download PDF';
        }
    });
}
