
      
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js";
import { showToast, showPage } from './ui.js';
import { db, auth } from './firebase.js'; // Import initialized db and auth

let currentUser = null;

export function initAuth() {
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
                await signInWithEmailAndPassword(auth, email, password);
                // Auth state change will handle the rest
            } catch (error) {
                console.error("Login failed:", error);
                let errorMessage;
                switch (error.code) {
                    case 'auth/invalid-credential':
                    case 'auth/user-not-found':
                    case 'auth/wrong-password':
                        errorMessage = 'Invalid email or password.';
                        break;
                    case 'auth/user-disabled':
                        errorMessage = 'This user account has been disabled.';
                        break;
                    case 'auth/invalid-email':
                        errorMessage = 'The email address is not valid.';
                        break;
                    case 'auth/network-request-failed':
                        errorMessage = 'Network error. Please check your connection.';
                        break;
                    default:
                        errorMessage = 'An unexpected error occurred. Please try again.';
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
        try {
            const userDoc = await getUserProfile(user.uid);
            if (userDoc && userDoc.status === 'active') {
                currentUser = {
                    uid: user.uid,
                    email: user.email,
                    ...userDoc
                };
                loginPage.style.display = 'none';
                appShell.style.display = 'flex';
                
                if(currentUser.role === 'admin' || currentUser.role === 'ops') {
                    document.querySelector('[data-tab="analytics"]').classList.remove('hidden');
                } else {
                     document.querySelector('[data-tab="analytics"]').classList.add('hidden');
                }
                showPage('jobs');
            } else {
                await signOut(auth);
                showToast('Your account is inactive or not found.', 'error');
                currentUser = null;
                loginPage.style.display = 'flex';
                appShell.style.display = 'none';
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
            await signOut(auth);
            showToast('Could not verify your account.', 'error');
        }
    } else {
        currentUser = null;
        loginPage.style.display = 'flex';
        appShell.style.display = 'none';
    }
}

async function getUserProfile(uid) {
    const userRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
        return docSnap.data();
    } else {
        console.warn(`No user profile found for UID: ${uid}`);
        return null;
    }
}

export function getCurrentUser() {
    return currentUser;
}

export async function logout() {
    try {
        await signOut(auth);
        showToast('You have been logged out.');
    } catch (error) {
        console.error("Logout failed:", error);
        showToast('Logout failed. Please try again.', 'error');
    }
}

    