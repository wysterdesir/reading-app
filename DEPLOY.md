# Deploying Story Reader

This walks you through getting the app live on your own domain so your
daughter can use it on her iPad and phone.

**What you'll end up with:**
- A live web address like `read.yourdomain.com`
- Automatic HTTPS (required for the app to work properly in production)
- Auto-deploys whenever you push a change to GitHub
- A home-screen icon on her iPad and phone that opens the app fullscreen,
  no browser chrome

**Time estimate:** 30–45 minutes, mostly waiting for DNS to propagate.

**Recommended path:** Cloudflare Pages + GitHub. It's free, fast, gives
you automatic HTTPS, deploys on every push, and the custom-domain setup
is the simplest of any host I've used.

---

## Step 1 — Put the code on GitHub (~10 min)

If you've never pushed a project to GitHub before, this is the harder
half. Once it's done, you never have to do it again.

### 1a. Make sure git is installed

Open a terminal (PowerShell on Windows, Terminal on Mac) and run:

```bash
git --version
```

If you see a version number, you're set. If not, install from
[git-scm.com/downloads](https://git-scm.com/downloads).

### 1b. Initialize the repo

From inside the `reading-app/` folder:

```bash
git init
git add .
git commit -m "Initial commit"
```

### 1c. Create the repo on GitHub

1. Go to <https://github.com/new>
2. Repository name: `reading-app` (or whatever you like)
3. Set it to **Private** (it's your daughter's app — no need to make it public)
4. **Do NOT** check "Add a README" or "Add .gitignore" — we already have those
5. Click **Create repository**

### 1d. Push your code

GitHub will show you commands on the next page. They look like this:

```bash
git remote add origin https://github.com/YOUR-USERNAME/reading-app.git
git branch -M main
git push -u origin main
```

Copy and run them. You may be prompted to authenticate — the easiest way
is to install [GitHub CLI](https://cli.github.com/) and run `gh auth login`
once, which sets everything up.

After this completes, refresh the GitHub repo page in your browser. You
should see all your files.

---

## Step 2 — Deploy with Cloudflare Pages (~10 min)

### 2a. Sign up / log in

Go to <https://dash.cloudflare.com/sign-up> and create a free account.
Cloudflare Pages is on the free plan — no credit card needed.

### 2b. Create a new Pages project

1. In the Cloudflare dashboard, click **Workers & Pages** in the left
   sidebar
2. Click **Create application** → **Pages** tab → **Connect to Git**
3. Authorize Cloudflare to access your GitHub account
4. Select the `reading-app` repository
5. Click **Begin setup**

### 2c. Configure the build

This is the critical step. Fill in:

- **Project name:** `reading-app` (this becomes part of the temporary URL,
  like `reading-app.pages.dev`)
- **Production branch:** `main`
- **Framework preset:** `Vite`
- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Root directory:** leave blank
- **Environment variables:** none needed

Click **Save and Deploy**.

The first build takes 1–2 minutes. When it's done, you'll see a URL like
`https://reading-app-abc.pages.dev`. Open it — the app should work.

### 2d. Verify it works on the temporary URL

Open the `.pages.dev` URL on your computer, on your daughter's iPad, and
on your phone. Try a story end-to-end on each device. If the scroll runs
smoothly and the highlights advance, you're done with the hard part.

---

## Step 3 — Point your custom domain at it (~15 min, mostly waiting)

There are two scenarios. **3a** is easier; **3b** works for any domain.

### 3a. If your domain is already on Cloudflare

1. In your Pages project, go to **Custom domains**
2. Click **Set up a custom domain**
3. Type `read.yourdomain.com` (or whatever subdomain you want)
4. Cloudflare detects the domain is theirs and configures the DNS
   automatically — confirm and you're done
5. HTTPS is automatic. Within a couple of minutes, your URL works.

### 3b. If your domain is at another registrar (Namecheap, GoDaddy, etc.)

You have two options:

**Option A — transfer DNS to Cloudflare (recommended, free):**

1. In Cloudflare, click **Websites** → **Add a site**
2. Enter `yourdomain.com`
3. Cloudflare scans your existing DNS records and copies them over
4. Cloudflare gives you two nameservers like `ada.ns.cloudflare.com` and
   `kurt.ns.cloudflare.com`
5. Log into your registrar (Namecheap/GoDaddy/etc.), find the
   "nameservers" setting for your domain, and replace them with the
   Cloudflare ones
6. Wait for propagation (10 min – 24 hours, usually under 1 hour)
7. Once Cloudflare confirms the domain is active, follow steps 3a above

**Option B — just add a CNAME record at your registrar:**

1. In your Pages project, go to **Custom domains** → **Set up a custom
   domain**
2. Type `read.yourdomain.com`
3. Cloudflare will give you a target like
   `reading-app-abc.pages.dev`
4. Log into your registrar's DNS settings and add a CNAME record:
   - **Type:** CNAME
   - **Name/Host:** `read` (just the subdomain part)
   - **Value/Target:** the `.pages.dev` URL Cloudflare gave you
   - **TTL:** automatic / 5 minutes
5. Wait 5–30 minutes for DNS to propagate. Cloudflare Pages will
   auto-provision an HTTPS certificate.

When the domain shows up as "Active" in your Pages project, browse to
`https://read.yourdomain.com` — it should be your app.

---

## Step 4 — Add to home screen on iPad / iPhone (~2 min)

This gives her an app icon that opens fullscreen — no Safari address bar,
no tabs, no distractions.

### On the iPad / iPhone:

1. Open Safari (not Chrome — Chrome on iOS doesn't support add-to-home-
   screen the same way)
2. Go to `https://read.yourdomain.com`
3. Tap the **Share** button (the square with the up-arrow, bottom center
   of Safari)
4. Scroll down and tap **Add to Home Screen**
5. Name it "Story Reader" (or whatever you like)
6. Tap **Add**

The icon appears on her home screen. Tapping it opens the app
fullscreen, like a native app. Progress (her streak, completed stories,
personal bests) persists between launches via localStorage.

### Optional — give it a proper app icon

The default icon will be a screenshot of the page. If you want a real
icon:

1. Create a 512×512 PNG of the book/reader icon
2. Save it as `reading-app/public/apple-touch-icon.png`
3. Add this line to `<head>` in `reading-app/index.html`:
   ```html
   <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
   ```
4. Commit and push — Cloudflare Pages auto-redeploys in ~1 min
5. Remove the old home-screen icon on the iPad and re-add it

---

## Updating the app later

The whole "edit → push → deploy" cycle is now one command:

```bash
git add .
git commit -m "Add new story / fix bug / whatever"
git push
```

Cloudflare Pages picks up the push, runs `npm run build`, and the new
version is live in 1–2 minutes. Her iPad will pick up the new version
the next time she opens the app.

If you want to test a change before pushing it live, Cloudflare Pages
auto-deploys preview URLs for any branch other than `main`. So:

```bash
git checkout -b try-something
# ...make changes...
git push -u origin try-something
```

You'll get a preview URL like `try-something.reading-app-abc.pages.dev`.
Try it on your devices. When you're happy, merge into `main`.

---

## Troubleshooting

**The build fails on Cloudflare Pages**
- Check the build log. Most likely the Node version is wrong. Add an
  environment variable in the Pages project settings:
  `NODE_VERSION = 20`
- Push another commit to retrigger the build.

**The site loads but the page is blank**
- Open browser DevTools → Console. Most likely a missing dependency
  or a runtime error.
- Check the Pages build log — if the build succeeded, the issue is
  client-side.

**Custom domain says "not active" for more than an hour**
- DNS propagation is occasionally slow but usually under an hour.
- Verify your CNAME record points to the right target.
- Use <https://www.whatsmydns.net/> to see if the DNS has propagated
  globally.

**iPad doesn't show "Add to Home Screen"**
- This only works in Safari, not Chrome. Make sure she's using Safari.
- Reload the page once after the domain switches from `.pages.dev` to
  your custom domain.

**Progress isn't syncing between her iPad and phone**
- This is by design — there's no account system. To move progress,
  open the app on the source device, tap ⚙ → Parent area, generate the
  QR/JSON export, then import it on the other device.

---

## One-time cost summary

- **Domain:** whatever you paid for it (typically $10–20/year)
- **Cloudflare Pages:** free, no card needed
- **GitHub:** free for private repos
- **Hosting traffic:** Cloudflare's free tier covers ~unlimited for a
  reading app of this size

Total ongoing cost: **the domain renewal, nothing else.**
