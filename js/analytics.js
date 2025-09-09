import { getFirestore, collection, getDocs, query, where, Timestamp } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { getCurrentUser } from './auth.js';
import { showToast } from "./ui.js";

// Chart.js is large, so we'll dynamically import it when needed.
let Chart;

const db = getFirestore();

function getStartOfMonth() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
}

export async function renderAnalyticsPage() {
    const user = getCurrentUser();
    if (user.role !== 'admin' && user.role !== 'ops') {
        document.getElementById('page-analytics').innerHTML = `<p class="text-red-500">You do not have permission to view analytics.</p>`;
        return;
    }

    const container = document.getElementById('page-analytics');
    container.innerHTML = `
        <div class="space-y-6">
            <div>
                <h1 class="text-2xl font-bold text-gray-800">Performance Analytics</h1>
                <p class="text-gray-500">Showing data for the current month.</p>
            </div>
            <div id="analytics-loader" class="text-center p-8">
                <p class="text-gray-500">Loading analytics data...</p>
            </div>
            <div id="analytics-content" class="hidden space-y-8">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="bg-white p-4 rounded-lg shadow text-center">
                        <p class="text-sm text-gray-500">Total Deliveries</p>
                        <p id="total-deliveries" class="text-3xl font-bold text-slate-800"></p>
                    </div>
                    <div class="bg-white p-4 rounded-lg shadow text-center">
                        <p class="text-sm text-gray-500">Deliveries Completed</p>
                        <p id="completed-deliveries" class="text-3xl font-bold text-green-600"></p>
                    </div>
                    <div class="bg-white p-4 rounded-lg shadow text-center">
                        <p class="text-sm text-gray-500">Pending Deliveries</p>
                        <p id="pending-deliveries" class="text-3xl font-bold text-amber-600"></p>
                    </div>
                </div>
                <div>
                    <h2 class="text-xl font-bold mb-4">Driver Performance</h2>
                    <div class="bg-white p-4 rounded-lg shadow">
                        <canvas id="driver-chart"></canvas>
                    </div>
                </div>
            </div>
        </div>
    `;

    try {
        if (!Chart) {
            const chartModule = await import('https://cdn.jsdelivr.net/npm/chart.js/dist/chart.js');
            Chart = chartModule.default;
        }
        await loadAnalyticsData();
        document.getElementById('analytics-loader').classList.add('hidden');
        document.getElementById('analytics-content').classList.remove('hidden');
    } catch (error) {
        console.error("Error loading analytics:", error);
        showToast("Failed to load analytics data.", "error");
        document.getElementById('analytics-loader').innerHTML = `<p class="text-red-500">Could not load analytics.</p>`;
    }
}

async function loadAnalyticsData() {
    const deliveriesQuery = query(
        collection(db, 'deliveries'),
        where('createdAt', '>=', Timestamp.fromDate(getStartOfMonth()))
    );
    
    const usersQuery = query(collection(db, 'users'), where('role', '==', 'driver'));

    const [deliveriesSnapshot, usersSnapshot] = await Promise.all([
        getDocs(deliveriesQuery),
        getDocs(usersQuery)
    ]);

    const deliveries = deliveriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const drivers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // --- STAT CARDS ---
    const totalCount = deliveries.length;
    const completedCount = deliveries.filter(d => d.status === 'Delivered').length;
    const pendingCount = totalCount - completedCount;

    document.getElementById('total-deliveries').textContent = totalCount;
    document.getElementById('completed-deliveries').textContent = completedCount;
    document.getElementById('pending-deliveries').textContent = pendingCount;

    // --- DRIVER CHART ---
    const driverStats = drivers.map(driver => {
        const driverDeliveries = deliveries.filter(d => d.driverUid === driver.id);
        return {
            name: driver.displayName,
            completed: driverDeliveries.filter(d => d.status === 'Delivered').length,
            pending: driverDeliveries.filter(d => d.status !== 'Delivered').length,
        };
    }).sort((a, b) => b.completed - a.completed);

    const ctx = document.getElementById('driver-chart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: driverStats.map(d => d.name),
            datasets: [{
                label: 'Completed Deliveries',
                data: driverStats.map(d => d.completed),
                backgroundColor: 'rgba(34, 197, 94, 0.6)',
                borderColor: 'rgba(22, 163, 74, 1)',
                borderWidth: 1
            },
            {
                label: 'Pending Deliveries',
                data: driverStats.map(d => d.pending),
                backgroundColor: 'rgba(245, 158, 11, 0.6)',
                borderColor: 'rgba(217, 119, 6, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}
