[English Version](./README.en.md) | [繁體中文版](./README.md)

# 🍄 Pikmin Shared Mushroom Timer

Welcome to **Pikmin Shared Mushroom Timer**! This is a **multiplayer real-time synchronized mushroom battle and respawn tracking tool** designed specifically for *Pikmin Bloom* players.

With this tool, you can create real-time synchronized shared rooms with your expedition squad, LINE groups, or Discord teammates to track remaining mushroom battle time and synchronize respawn countdowns together.

---

## ✨ Core Features & Highlights

### 👥 Real-Time Multiplayer Synchronized Rooms
- **6-Digit Room Codes**: Instantly create or enter a code to join a dedicated squad room (e.g., `X9W3R2`).
- **One-Click Invite Links**: Automatically generates a dedicated HTTPS link containing the room code (e.g., `?room=X9W3R2`). Tapping the "Copy Invite Link" button copies it to your clipboard for instant sharing in LINE groups. Teammates can tap the link to join directly.
- **Bidirectional Zero-Latency Updates**: Powered by Google Cloud Firestore real-time data streams. Any member adding an area, updating participant counts, or creating/deleting mushroom timers will trigger instant, zero-latency updates on everyone's screens!

### 🔔 Real-Time & Native Notifications
- **Dual-Platform Support**: Web version supports standard browser push notifications; Native App version supports iOS system-level local notifications.
- **Triple Timed Alerts**: Includes "Battle Ended (5m before respawn)", "Respawn Soon (1m before respawn)", and "Respawned Complete", ensuring you and your squad never miss a mushroom!

### ⏱️ Smart Recent Rooms & Tab State Recovery
- **Auto-Save Active Room & Tab**: Automatically restores the active room and area tab you were visiting. Even if the browser/app is closed or refreshed, you will **automatically reconnect and return to the same room and area page** upon reopening, without having to manually select or enter again!
- **Smart Recent Rooms History**: The homepage automatically remembers up to 5 rooms that you have recently successfully created or joined. A glassmorphic "⏱️ Recent Rooms" list will appear on the homepage; **simply tap a room to connect and enter instantly**, without having to copy and paste codes.

### 📱 Premium Mobile Optimization (iOS Auto-Zoom Fix)
- **Viewport Lock**: Locks the viewport scale so that the page width never wobbles or shakes when pinch-zooming or tapping inputs.
- **iOS Focus Zoom Preventative Style**: Upgraded the font size of all text input boxes (room names, area names, modifying mushroom names) to `16px (text-base)`. **Completely eliminates the classic iOS Safari / Chrome bug where tapping an input automatically zooms in on the webpage, forcing you to manually zoom out after the keyboard collapses!**
- **One-Click Transformative Clipboard Capsule**: The room code and link copy buttons in the information bar are built with a **dual-safety clipboard compatibility mechanism** (guaranteeing 100% copy success even when testing on non-secure HTTP local networks or inside the LINE in-app browser). When tapping the copy button, the capsule dynamically transforms inline, fading into a beautiful green `✓ Copied!` confirmation, completely immune to being clipped by card boundaries!

### 🎨 Stunning Premium Pikmin Aesthetics
- **Sunset Golden Pink Gradient**: The 5-minute respawn state after a battle ends features a warm and bright sunset gradient (`from-[#f8a532] to-[#e75a24]`).
- **Gentle Sprout Sage Green**: The active battle state uses a soft sage green (`from-[#809b7b] to-[#5d7c58]`), which is eye-friendly and matches the nature-inspired atmosphere of Pikmin Bloom.
- **Elegant Glassmorphism Cards**: Completed mushroom cards that have finished respawning transition into a sophisticated, semi-transparent white glassmorphism design (`bg-white/70 backdrop-blur-md`), removing any distracting breathing animations for a calm visual experience.

### 👤 Offline Local Mode Fallback
- When you are playing solo or have no internet connection, select "Single Player Mode" to gracefully downgrade the app to use browser `localStorage` for offline tracking, independent of any cloud databases.
- The top navigation bar provides a "Switch Mode" button, allowing you to elegantly toggle between "Local" and "Shared" modes at any time.

---

## 🛠️ Firebase Cloud Configuration Guide

To get your multiplayer shared version running smoothly, you only need to perform the following two minor configurations in your **[Firebase Console](https://console.firebase.google.com/)**:

### 1. Enable Anonymous Authentication
To allow teammates to use the app instantly without having to enter passwords or sign up for accounts, we utilize anonymous authentication:
1. Enter your Firebase project and select **Authentication** from the left-side menu.
2. Switch to the **Sign-in method** tab and click **Add new provider**.
3. Select **Anonymous** at the bottom of the list ➔ click **Enable** and save.

### 2. Create Firestore Database & Security Rules
1. Click **Firestore Database** in the left-side menu ➔ click **Create database**.
2. Select the database server location nearest to your region (e.g., Taiwan `asia-east1` or Hong Kong `asia-east2`).
3. Once created, switch to the **Rules** tab, replace the existing contents with the security rules below, and click **Publish**:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allows authenticated (including anonymous) members to securely read and write room logs
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

---

## 🚀 Deploying to Vercel (100% Free)

This project is completely compatible with Vercel's free Next.js static deployment service. You can easily deploy it using either of the following methods:

### Method 1: Deploy in One Minute via Vercel CLI (No GitHub required)
1. Run the following command in the project directory:
   ```bash
   npx vercel
   ```
2. Follow the on-screen prompts and press **Enter** to accept all default values to complete the deployment!

### Method 2: Deploy automatically via GitHub (Recommended, CI/CD)
1. Push this project to your personal GitHub repository.
2. Go to the [Vercel Website](https://vercel.com/) and import your GitHub repository.
3. Click **Deploy** to finish! From now on, whenever you `git push` updates, your website will automatically update in the background.

---

## 💻 Local Development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the local development server:
   ```bash
   npm run dev
   ```
3. Open your browser and navigate to [http://localhost:3000](http://localhost:3000) to start testing.

<details>
<summary>📱 Native iOS App Compiling & Packaging (Capacitor)</summary>

This project has integrated **CapacitorJS**, supporting direct packaging and compiling into a native iOS App with system-level native local notifications (including battle ended, 1-minute before respawn, and respawned complete triple alerts).

### Compiling & Packaging Steps:
1. **Install Dependencies & Build Web Assets**:
   ```bash
   npm install
   npm run build
   ```
2. **Sync Assets to iOS Project**:
   ```bash
   npx cap sync ios
   ```
3. **Open Project in Xcode** (Requires a Mac with Xcode installed):
   ```bash
   npx cap open ios
   ```
4. **Run in Xcode**:
   - Click `App` on the left file navigator. Under the `Signing & Capabilities` tab, check `Automatically manage signing` and select your Apple ID (Team).
   - Select your iPhone as the destination at the top and click the **▶️ (Run)** button on the top left.
</details>

Happy mushroom hunting with your adventure squad! 🍄⚔️
