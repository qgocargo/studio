import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { showToast, showPage } from './ui.js';
import { renderJobsPage } from './deliveries.js';
import { renderAnalyticsPage } from './analytics.js';

let authInstance;
let currentUser = null;

export function initAuth(auth) {
    authInstance = auth;

    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const loginButton = document.getElementById('login-button');
            const loginError = document.getElementById('login-error');

            loginButton.disabled = true;
            loginButton.textContent = 'Signing in...';
            loginError.textContent = '';

            try {
                await signInWithEmailAndPassword(authInstance, email, password);
                // Auth state change will handle the rest
            } catch (error) {
                console.error("Login failed:", error.code, error.message);
                let errorMessage = 'An unknown error occurred. Please try again.';
                switch (error.code) {
                    case 'auth/invalid-credential':
                    case 'auth/user-not-found':
                    case 'auth/wrong-password':
                        errorMessage = 'Invalid email or password. Please check your credentials.';
                        break;
                    case 'auth/user-disabled':
                        errorMessage = 'This user account has been disabled.';
                        break;
                    case 'auth/invalid-email':
                        errorMessage = 'The email address is not valid.';
                        break;
                    case 'auth/network-request-failed':
                        errorMessage = 'Network error. Please check your internet connection.';
                        break;
                }
                loginError.textContent = errorMessage;
                showToast(errorMessage, 'error');
                loginButton.disabled = false;
                loginButton.textContent = 'Sign in';
            }
        });
    }
}

export async function handleAuthFlow(user) {
    const loginPage = document.getElementById('login-page');
    const appShell = document.getElementById('app-shell');

    if (user) {
        // User is signed in. Fetch their user document.
        try {
            const userDoc = await getUserProfile(user.uid);
            if (userDoc && userDoc.status === 'active') {
                currentUser = {
                    uid: user.uid,
                    email: user.email,
                    ...userDoc
                };
                loginPage.classList.add('hidden');
                appShell.classList.remove('hidden');
                document.body.classList.remove('bg-gray-100');
                
                // Show analytics tab for admins
                if(currentUser.role === 'admin' || currentUser.role === 'ops') {
                    document.querySelector('[data-tab="analytics"]').classList.remove('hidden');
                } else {
                     document.querySelector('[data-tab="analytics"]').classList.add('hidden');
                }

                // Initial page load
                showPage('jobs');

            } else {
                // Account is inactive or doesn't exist
                await signOut(authInstance);
                showToast('Your account is not active or does not exist. Please contact an admin.', 'error');
                currentUser = null;
                loginPage.classList.remove('hidden');
                appShell.classList.add('hidden');
                document.body.classList.add('bg-gray-100');
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
            await signOut(authInstance);
            showToast('Could not verify your account. Please try again.', 'error');
        }
    } else {
        // User is signed out.
        currentUser = null;
        loginPage.classList.remove('hidden');
        appShell.classList.add('hidden');
        document.body.classList.add('bg-gray-100');
    }
}

async function getUserProfile(uid) {
    const db = getFirestore();
    const userRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
        return docSnap.data();
    } else {
        return null;
    }
}

export function getCurrentUser() {
    return currentUser;
}

export async function logout() {
    try {
        await signOut(authInstance);
        showToast('You have been logged out.');
        // The onAuthStateChanged listener will handle UI changes.
    } catch (error) {
        console.error("Logout failed:", error);
        showToast('Logout failed. Please try again.', 'error');
    }
}
