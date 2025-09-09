# Q'go Cargo - Static Proof of Delivery PWA

This is a pure static Progressive Web App for managing Proof of Deliveries, built with HTML, Tailwind CSS, and vanilla JavaScript. It uses Firebase on the client-side for all data storage and authentication.

## 🚀 Getting Started

### 1. Add Your Firebase Configuration

Before you can run the app, you need to add your Firebase project configuration.

Open both `index.html` and `track.html` files. Find the following placeholder script tag near the top of the `<body>`:

```html
<!-- 
  TODO: PASTE YOUR FIREBASE CONFIG HERE 
  This object is found in your Firebase project settings.
-->
<script>
  const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
  };
</script>
```

Replace the placeholder values in **both files** with the actual configuration object from your Firebase project.

### 2. Enable Firebase Services

In your Firebase Console:

1.  **Authentication**: Go to the "Authentication" section, click on the "Sign-in method" tab, and enable the **Email/Password** provider.
2.  **Firestore**: Go to the "Firestore Database" section and create a database. Start in **production mode**. You will add security rules later.
3.  **Storage**: Go to the "Storage" section and create a storage bucket.

### 3. Run Locally

You cannot open `index.html` directly in the browser due to CORS security policies with JavaScript modules. You need to serve the files using a local web server.

1.  **Install a local server (if you don't have one):**
    A popular and easy choice is `http-server` via npm.
    ```bash
    npm install -g http-server
    ```

2.  **Start the server:**
    Navigate to the project's root directory in your terminal and run:
    ```bash
    http-server
    ```

3.  **Open the app:**
    Open your browser and go to the local address provided by the server (usually `http://localhost:8080`).

### 4. Deploy to GitHub Pages

1.  **Create a GitHub Repository:**
    Create a new repository on GitHub and push the project files to it.

2.  **Enable GitHub Pages:**
    - In your repository, go to **Settings > Pages**.
    - Under "Build and deployment", select the source as **Deploy from a branch**.
    - Choose the branch you pushed your code to (e.g., `main`) and the folder as `/(root)`.
    - Click **Save**.

3.  **Authorize Domain in Firebase:**
    - Go back to your Firebase Console -> Authentication -> Sign-in method.
    - Under "Authorized domains", click **Add domain**.
    - Add your GitHub Pages domain (e.g., `your-username.github.io`). **Do not include `https://` or the repository name.**

It may take a few minutes for the site to become live.
