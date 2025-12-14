# Google Authentication Setup Guide

## 🔐 Setting Up Google OAuth

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **"Create Project"** or select an existing project
3. Give it a name (e.g., "AutoOps Mini")
4. Click **"Create"**

### Step 2: Enable Google+ API

1. In your project, go to **"APIs & Services"** → **"Library"**
2. Search for **"Google+ API"**
3. Click on it and press **"Enable"**

### Step 3: Create OAuth 2.0 Credentials

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"OAuth client ID"**
3. If prompted, configure the **OAuth consent screen**:
   - User Type: **External**
   - App name: **AutoOps Mini**
   - User support email: Your email
   - Developer contact: Your email
   - Click **"Save and Continue"**
   - Scopes: Skip for now
   - Test users: Add your email
   - Click **"Save and Continue"**

4. Back to **Create OAuth client ID**:
   - Application type: **Web application**
   - Name: **AutoOps Mini Web Client**
   - Authorized JavaScript origins:
     ```
     http://localhost:3000
     ```
   - Authorized redirect URIs:
     ```
     http://localhost:3000/api/auth/callback/google
     ```
   - Click **"Create"**

5. **Copy** your:
   - Client ID
   - Client Secret

### Step 4: Configure Environment Variables

Create a `.env.local` file in your project root:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_here

# Optional: LLM Keys
OPENAI_API_KEY=your_openai_key
TOGETHER_API_KEY=your_together_key
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### Step 5: Restart the Server

```bash
# Stop the current server (Ctrl+C)
npm run dev
```

---

## 🧪 Testing Authentication

### 1. Visit Homepage
```
http://localhost:3000
```

### 2. Click "Sign In to Continue"
- You'll be redirected to Google sign-in
- Choose your Google account
- Grant permissions
- You'll be redirected back to the homepage

### 3. You Should See:
- Your profile picture in the top-right
- Your name
- A logout button
- Button now says "Run AutoOps"

### 4. Click "Run AutoOps"
- Now you can access the dashboard
- Only authenticated users can run AutoOps

---

## 🚀 Production Deployment

### For Vercel:

1. Add environment variables in Vercel dashboard:
   ```
   GOOGLE_CLIENT_ID=...
   GOOGLE_CLIENT_SECRET=...
   NEXTAUTH_URL=https://your-domain.vercel.app
   NEXTAUTH_SECRET=...
   ```

2. Update Google Cloud Console:
   - Add production URL to **Authorized JavaScript origins**:
     ```
     https://your-domain.vercel.app
     ```
   - Add production callback to **Authorized redirect URIs**:
     ```
     https://your-domain.vercel.app/api/auth/callback/google
     ```

---

## 🔒 Security Best Practices

1. **Never commit `.env.local`** to Git (already in `.gitignore`)
2. **Use different credentials** for development and production
3. **Rotate secrets** regularly
4. **Limit OAuth scopes** to only what you need
5. **Add your domain** to authorized origins only

---

## 🐛 Troubleshooting

### Error: "redirect_uri_mismatch"
**Solution:** Make sure the redirect URI in Google Cloud Console exactly matches:
```
http://localhost:3000/api/auth/callback/google
```

### Error: "invalid_client"
**Solution:** Double-check your `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

### Error: "Access blocked: This app's request is invalid"
**Solution:** 
1. Configure OAuth consent screen
2. Add your email as a test user
3. Make sure Google+ API is enabled

### Session not persisting
**Solution:** Make sure `NEXTAUTH_SECRET` is set in `.env.local`

---

## 📱 Features Implemented

✅ **Google OAuth 2.0** - Secure authentication
✅ **Session Management** - Persistent login
✅ **Protected Routes** - Only authenticated users can access dashboard
✅ **User Profile Display** - Shows name and picture
✅ **Sign Out** - Clean logout functionality
✅ **Beautiful Sign-In Page** - Custom branded experience

---

## 🎨 Customization

### Change Sign-In Page Design
Edit: `pages/auth/signin.js`

### Add More OAuth Providers
Edit: `pages/api/auth/[...nextauth].js`

Example - Add GitHub:
```javascript
import GitHubProvider from "next-auth/providers/github";

providers: [
  GoogleProvider({...}),
  GitHubProvider({
    clientId: process.env.GITHUB_ID,
    clientSecret: process.env.GITHUB_SECRET,
  }),
]
```

### Protect API Routes
```javascript
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);
  
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  // Your protected API logic
}
```

---

## 🔗 Useful Links

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google Cloud Console](https://console.cloud.google.com/)
- [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)

---

## ✅ Quick Checklist

- [ ] Created Google Cloud Project
- [ ] Enabled Google+ API
- [ ] Created OAuth 2.0 credentials
- [ ] Configured OAuth consent screen
- [ ] Added authorized redirect URIs
- [ ] Created `.env.local` file
- [ ] Added `GOOGLE_CLIENT_ID`
- [ ] Added `GOOGLE_CLIENT_SECRET`
- [ ] Added `NEXTAUTH_URL`
- [ ] Generated and added `NEXTAUTH_SECRET`
- [ ] Restarted dev server
- [ ] Tested sign in
- [ ] Tested sign out
- [ ] Verified protected routes work

---

**You're all set!** 🎉 Users can now sign in with Google to access AutoOps Mini.
