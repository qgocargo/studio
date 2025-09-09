'use server'

import { z } from 'zod'
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from 'firebase/auth'
import { auth as adminAuth } from '@/lib/firebase/admin'

import { createSession, getSession, deleteSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import { db } from '@/lib/firebase/config'
import { doc, setDoc, serverTimestamp, getDoc, addDoc, updateDoc, writeBatch, deleteDoc, collection, query, where, getDocs, deleteField } from 'firebase/firestore'
import { generateQrCodeForFeedback } from '@/ai/flows/generate-qr-code-for-feedback'
import { revalidatePath } from 'next/cache'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
})

export async function login(prevState: any, formData: FormData) {
  const validatedFields = loginSchema.safeParse(Object.fromEntries(formData.entries()))
  if (!validatedFields.success) {
    return {
      type: 'error',
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }
  const { email, password } = validatedFields.data

  try {
    const auth = getAuth()
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    
    const userDocRef = doc(db, 'users', userCredential.user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists() && userDoc.data().status === 'active') {
        const userData = {
            userId: userCredential.user.uid,
            ...userDoc.data()
        }
        await createSession(userData)
    } else {
        const auth = getAuth();
        await signOut(auth);
        return { type: 'error', message: 'Account is inactive or pending approval.' }
    }
  } catch (error: any) {
    console.error('Login error:', error.code)
    let message = 'An unknown error occurred.'
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        message = 'Invalid email or password.'
    }
    return { type: 'error', message }
  }
  redirect('/')
}

const signupSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export async function signup(prevState: any, formData: FormData) {
  const validatedFields = signupSchema.safeParse(Object.fromEntries(formData.entries()))
  if (!validatedFields.success) {
    return {
      type: 'error',
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { name, email, password } = validatedFields.data

  try {
    const auth = getAuth()
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    
    await setDoc(doc(db, "users", userCredential.user.uid), {
        displayName: name,
        email: email,
        role: 'driver',
        status: 'inactive',
        createdAt: serverTimestamp()
    });

    await signOut(auth);
    return { type: 'success', message: 'Account created! Please wait for admin approval.' }

  } catch (error: any) {
    console.error('Signup error:', error.code)
    if (error.code === 'auth/email-already-in-use') {
        return { type: 'error', message: 'This email is already in use.'}
    }
    return { type: 'error', message: 'Could not create account.' }
  }
}

const forgotPasswordSchema = z.object({
  email: z.string().email()
});

export async function forgotPassword(prevState: any, formData: FormData) {
    const validatedFields = forgotPasswordSchema.safeParse(Object.fromEntries(formData.entries()));
    if (!validatedFields.success) {
        return {
            type: 'error',
            errors: validatedFields.error.flatten().fieldErrors
        }
    }
    const { email } = validatedFields.data;

    try {
        const auth = getAuth();
        await sendPasswordResetEmail(auth, email);
        return { type: 'success', message: 'Password reset link sent to your email.' };
    } catch (error) {
        console.error("Password reset error:", error);
        return { type: 'error', message: 'Could not send reset link. Please check the email address.' };
    }
}


export async function logout() {
  await deleteSession()
  redirect('/login')
}

export async function assignDelivery(data: any) {
    try {
        const session = await getSession();
        if (!session || !session.user) {
            throw new Error("Unauthorized");
        }
        
        await addDoc(collection(db, 'deliveries'), {
            ...data,
            createdAt: serverTimestamp(),
            status: 'Pending',
        });

        revalidatePath('/');
        return { success: true, message: 'Delivery assigned successfully.' };

    } catch (error: any) {
        console.error("Error assigning delivery:", error);
        return { success: false, message: error.message || "Could not assign delivery." };
    }
}

export async function completeDelivery(formData: FormData) {
    const session = await getSession();
    if (!session || !session.user) {
        return { success: false, message: "Unauthorized" };
    }
    
    const deliveryId = formData.get('deliveryId') as string;
    const receiverName = formData.get('receiverName') as string;
    const receiverMobile = formData.get('receiverMobile') as string;
    const signatureDataUrl = formData.get('signatureDataUrl') as string;
    const geolocation = formData.get('geolocation') as string;
    const deliveryDataStr = formData.get('deliveryData') as string;

    if (!deliveryId || !receiverName || !receiverMobile || !signatureDataUrl || !deliveryDataStr) {
        return { success: false, message: "Missing required fields." };
    }
    
    try {
        const deliveryData = JSON.parse(deliveryDataStr);
        const geo = geolocation ? JSON.parse(geolocation) : null;

        const podData = {
            deliveryId: deliveryId,
            jobFileId: deliveryData.jobFileId,
            jobFileData: deliveryData.jobFileData,
            deliveryLocation: deliveryData.deliveryLocation,
            receiverName: receiverName,
            receiverMobile: receiverMobile,
            signatureDataUrl: signatureDataUrl,
            completedAt: serverTimestamp(),
            driverUid: deliveryData.driverUid, // Using driver from original delivery data
            driverName: deliveryData.driverName,
            ...(geo && { geolocation: geo.coords, geolocationName: geo.displayName })
        };
        
        const batch = writeBatch(db);

        const podDocRef = doc(db, 'pods', deliveryId);
        batch.set(podDocRef, podData);

        const deliveryRef = doc(db, 'deliveries', deliveryId);
        batch.update(deliveryRef, {
            status: 'Delivered',
            completedAt: serverTimestamp(),
            podId: deliveryId,
            receiverName: receiverName
        });
        
        await batch.commit();
        
        const baseUrl = process.env.BASE_URL || "http://localhost:9002";
        const qrCodeResult = await generateQrCodeForFeedback({ deliveryId, baseUrl });
        
        revalidatePath('/');
        return { success: true, message: 'Delivery completed!', qrCodeDataUri: qrCodeResult.qrCodeDataUri };

    } catch (error: any) {
        console.error("Error completing delivery:", error);
        return { success: false, message: error.message || "Failed to complete delivery." };
    }
}

export async function submitFeedback(formData: FormData) {
    const deliveryId = formData.get('deliveryId') as string;
    const rating = formData.get('rating') as string;
    const comment = formData.get('comment') as string;

    if (!deliveryId || !rating) {
        return { success: false, message: 'Rating is required.' };
    }

    try {
        const deliveryRef = doc(db, 'deliveries', deliveryId);
        const deliverySnap = await getDoc(deliveryRef);

        if (!deliverySnap.exists()) {
            throw new Error("Original delivery not found.");
        }
        const deliveryData = deliverySnap.data();

        const feedbackData = {
            deliveryId,
            driverUid: deliveryData.driverUid,
            driverName: deliveryData.driverName,
            rating: parseInt(rating, 10),
            comment,
            createdAt: serverTimestamp(),
        };

        const batch = writeBatch(db);
        batch.set(doc(db, 'feedback', deliveryId), feedbackData);
        batch.update(deliveryRef, { feedbackStatus: 'rated' });
        await batch.commit();

        return { success: true, message: 'Thank you for your feedback!' };
    } catch (error: any) {
        console.error("Error submitting feedback:", error);
        return { success: false, message: error.message || 'Could not submit feedback.' };
    }
}

export async function updateUserStatuses(statuses: { uid: string, status: string }[]) {
    const session = await getSession();
    if (!session || session.user.role !== 'admin') {
        return { success: false, message: "Unauthorized" };
    }

    const batch = writeBatch(db);
    statuses.forEach(({ uid, status }) => {
        const userRef = doc(db, 'users', uid);
        batch.update(userRef, { status });
    });

    try {
        await batch.commit();
        revalidatePath('/');
        return { success: true, message: "User statuses updated." };
    } catch (error: any) {
        return { success: false, message: error.message || "Failed to update statuses." };
    }
}

export async function cancelPod(deliveryId: string) {
    const session = await getSession();
    if (!session || session.user.role !== 'admin') {
        return { success: false, message: "Unauthorized" };
    }

    try {
        const batch = writeBatch(db);

        const podRef = doc(db, 'pods', deliveryId);
        batch.delete(podRef);

        const deliveryRef = doc(db, 'deliveries', deliveryId);
        batch.update(deliveryRef, {
            status: 'Pending',
            podId: deleteField(),
            completedAt: deleteField(),
            receiverName: deleteField(),
        });
        
        await batch.commit();
        revalidatePath('/');
        return { success: true, message: "POD cancelled and delivery reset to Pending." };

    } catch (error: any) {
        return { success: false, message: error.message || "Failed to cancel POD." };
    }
}
