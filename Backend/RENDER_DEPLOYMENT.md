# Deploying the Node.js Backend to Render

This guide explains how to deploy your Express.js/MongoDB backend to [Render.com](https://render.com).

## 1. Prepare Your GitHub Repository
1. Make sure all your backend code is pushed to your GitHub repository.
2. Ensure your `.env` file is NOT pushed (it is correctly ignored in `.gitignore`).
3. Ensure your `package.json` has a start script. It should look like this:
   ```json
   "scripts": {
     "start": "node index.js",
     "dev": "nodemon index.js"
   }
   ```

## 2. Create a Web Service on Render
1. Log in to [Render](https://dashboard.render.com/).
2. Click **New +** and select **Web Service**.
3. Connect your GitHub account and select your repository.
4. If your backend is in a subfolder (e.g., `Backend`), set the **Root Directory** to `Backend`.

## 3. Configure the Deployment
Fill out the configuration page with these exact settings:
- **Environment**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`

## 4. Add Environment Variables
Scroll down to the **Environment Variables** section. You must manually add all the variables from your local `.env` file here. Click "Add Environment Variable" for each one:

- `MONGO_URI`: `mongodb://...`
- `PORT`: `5000` (Optional, Render usually assigns this automatically, but safe to set)
- `JWT_SECRET`: `your-secret-key`
- `REFRESH_SECRET`: `your-refresh-key`
- `CLOUDINARY_CLOUD_NAME`: `your-cloud-name`
- `CLOUDINARY_API_KEY`: `your-api-key`
- `CLOUDINARY_API_SECRET`: `your-api-secret`

## 5. Deploy!
1. Click **Create Web Service**.
2. Render will automatically run `npm install` and `npm start`.
3. Once the deployment finishes, you will see a green "Live" badge.
4. **Important**: Copy your live Render URL (e.g., `https://ecommerce-backend-xyz.onrender.com`). You will need this to configure the Angular frontend!
