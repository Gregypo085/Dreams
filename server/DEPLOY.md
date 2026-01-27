# Deploying Dreams Streaming Server to Railway

## Quick Deploy Steps

### 1. Sign Up for Railway
Go to https://railway.app and sign up with your GitHub account (free).

### 2. Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose `Gregypo085/Dreams`
4. Railway will detect the Node.js app

### 3. Configure Root Directory
Since the server is in a subdirectory:
1. Go to project Settings
2. Find "Root Directory"
3. Set it to: `server`
4. Save changes

### 4. Add Build Pack (if needed)
Railway should auto-detect Node.js, but if not:
1. Go to Settings → Environment
2. Add: `NIXPACKS_BUILD_CMD=npm install`
3. Add: `NIXPACKS_START_CMD=node server.js`

### 5. Deploy
1. Click "Deploy"
2. Wait for build to complete (2-3 minutes)
3. Railway will provide a URL like: `https://dreams-server-production.up.railway.app`

### 6. Verify Deployment
Visit your Railway URL - you should see the Dreams Streaming Server info page.

Test the stream:
```bash
curl -I https://your-railway-url.up.railway.app/stream
```

Should return `HTTP/2 200` with `content-type: audio/opus`

### 7. Update Discord Bot
Edit `/Users/greg/code/DiscordBot/.env`:
```
DREAMS_STREAM_URL=https://your-railway-url.up.railway.app/stream
```

Restart your Discord bot and test with `!play`!

## Troubleshooting

**"Application failed to respond":**
- Check Railway logs for errors
- Verify ffmpeg is installed (Railway should auto-install)
- Check that Root Directory is set to `server`

**"Audio files not found":**
- Ensure `audio/ogg/` directory is in git repo
- Check file permissions
- Verify paths in server.js

**Stream disconnects:**
- Normal if no clients connected
- Railway free tier may sleep after inactivity
- Upgrade to hobby plan ($5/mo) for always-on

## Monitoring

Railway Dashboard shows:
- Deployment logs
- Resource usage
- Request metrics
- Error tracking

## Cost

**Free Tier:**
- $5 credit per month
- Good for light usage
- May sleep after inactivity

**Hobby Plan ($5/month):**
- Always-on service
- Better for 24/7 Discord bot

## Environment Variables

Railway automatically sets:
- `PORT` - Railway assigns this dynamically

No additional env vars needed for basic operation.

## Custom Domain (Optional)

To use `stream.dreams.gostnode.com`:
1. Go to Settings → Domains
2. Add custom domain
3. Add CNAME record in your DNS:
   ```
   stream.dreams.gostnode.com → your-railway-url.up.railway.app
   ```

Then update Discord bot:
```
DREAMS_STREAM_URL=https://stream.dreams.gostnode.com/stream
```
