# Deploying the Angular Frontend to Vercel

This guide explains how to deploy your Angular application to [Vercel](https://vercel.com).

## 1. Update your Environment API URL
Before deploying, you must point your frontend to your live Render backend instead of `localhost`.
Open `src/app/environments/environments.ts` and change it:

```typescript
export const environment = {
    production: true, // Set this to true for live
    
    // COMMENT OUT the localhost URL:
    // apiUrl : 'http://localhost:5000/api',
    
    // UNCOMMENT and UPDATE this to your new live Render URL:
    apiUrl: 'https://your-live-backend.onrender.com/api',
    
    encryptionKey:""
};
```
*Commit and push this change to GitHub.*

## 2. Vercel Configuration Check
Your project already contains a `vercel.json` file. Ensure it contains the routing rewrite rule so Angular routing works properly when the page is refreshed:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

## 3. Deploying on Vercel
1. Log in to [Vercel](https://vercel.com/dashboard).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository.
4. If your frontend is inside a subfolder (e.g., `Quickmart_frontend`), set the **Root Directory** to `Quickmart_frontend` by clicking "Edit" next to the root directory option.

## 4. Build Settings
Vercel should automatically detect that this is an Angular project, but verify these settings:
- **Framework Preset**: `Angular`
- **Build Command**: `ng build --configuration production`
- **Output Directory**: `dist/quickmart_frontend` (Make sure this matches the output path defined in your `angular.json` file!)

## 5. Deploy!
Click the **Deploy** button. Vercel will build the Angular app and put it live on a global CDN. Once it's done, they will give you a live URL (e.g., `https://quickmart.vercel.app`).

**That's it! Your Quickmart platform is now fully live!**
