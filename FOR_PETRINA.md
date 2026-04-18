# Setup guide — Rescue Pup Passport

This is a one-time setup (about 60–90 minutes including the Supabase database). After that, your daily workflow is: open Claude Code, describe a change, review the diff, commit. No terminal gymnastics.

By the end of Part 1 you will have:

- Your own copy of the project on GitHub (private to you)
- The project files on your laptop
- Node.js, GitHub Desktop, and Claude Code installed
- A free Supabase database running with three demo dogs loaded
- The app running locally at `http://localhost:3000`

Part 2 covers deploying it to the internet so you can use it from your phone.

---

## Part 1 — Local setup

### 1. Create your own copy of the project on GitHub (5 min)

The public project uses GitHub's **template repository** feature. This creates your copy as a brand-new repo with no upstream link — you can change anything in it without it affecting the original.

1. Go to: `https://github.com/jaredpeters/rescue-pup-passport`
2. If you don't have a GitHub account yet, sign up first (top right → Sign up). Free. Any email works.
3. On the project page, click the green **"Use this template"** button near the top right → **"Create a new repository"**.
4. On the "Create a new repository from rescue-pup-passport" screen:
   - **Owner**: your username.
   - **Repository name**: anything you want. Examples: `petrinas-pups`, `hill-rescues`. Lowercase, no spaces.
   - **Description**: optional.
   - **Visibility**: select **Private**. (You can flip it to public later if you want; starting private is safer while you're learning.)
   - Leave "Include all branches" unchecked.
5. Click **"Create repository"**.

You'll land on your new repo's page. The URL is `https://github.com/YOUR_USERNAME/YOUR_REPO_NAME`. Bookmark it.

### 2. Install GitHub Desktop (5 min)

GitHub Desktop is a visual app for saving and syncing your changes. It replaces the git command line entirely.

1. Go to: `https://desktop.github.com`
2. Click **Download for macOS** (or Windows, whichever you're on).
3. Open the downloaded file, drag GitHub Desktop into Applications, open it.
4. On first launch, click **"Sign in to GitHub.com"**. Sign in with the account you just made — a browser window will pop up, you approve, it comes back to the app.
5. When it asks how to configure git — accept the defaults. Your name and email are used to label your commits.

### 3. Clone your repo to your laptop (2 min)

"Cloning" means downloading your repo's files to your computer, with GitHub Desktop keeping track so sync works later.

1. In GitHub Desktop: **File → Clone repository...**
2. A dialog opens with a list of your repos. Select the one you just created.
3. **Local path**: the default (`~/Documents/GitHub/your-repo-name`) is fine. Note this path — you'll use it in step 6.
4. Click **Clone**.

A few seconds later, the files are on your laptop. Open Finder and navigate to that folder to confirm.

### 4. Install Node.js (3 min)

Node is the runtime that serves the app locally in your browser.

1. Go to: `https://nodejs.org`
2. Download the **LTS** version (left-side button — stands for "Long Term Support"; the stable release).
3. Open the installer. Click through with defaults.
4. Verify it installed: open **Terminal** (Cmd+Space, type "Terminal", Enter), paste this and hit Enter:
   ```
   node --version
   ```
   You should see something like `v20.11.0`. If it prints a version, you're good. If you get "command not found," restart Terminal and try again.

### 5. Install Claude Code (5 min)

Claude Code is the AI coding assistant that will do the actual work on your project. Two ways to install; pick one.

**Option A — Terminal (recommended, simpler)**

1. In Terminal, paste this and hit Enter:
   ```
   npm install -g @anthropic-ai/claude-code
   ```
   If prompted for your Mac password, enter it. The install takes ~30 seconds.

2. Start it for the first time:
   ```
   claude
   ```
   It will walk you through authenticating — a browser window will open, sign in with your Anthropic account (same one you use at claude.ai), approve, and come back to the terminal.

3. Quit out for now (type `/exit` or press Ctrl+D). You'll re-open it inside the project folder in step 7.

**Option B — VS Code extension (if you prefer a visual editor)**

1. Install VS Code: `https://code.visualstudio.com` → download → open the .dmg → drag to Applications.
2. Open VS Code. Click the Extensions icon in the left sidebar (four squares, one flying off).
3. Search "Claude Code". Install the official one from Anthropic.
4. After install, a "Sign in" prompt appears in the sidebar. Click through to authenticate.

### 6. Set up the Supabase database (15–30 min)

This is the database that will hold your dogs' records. It's free. The project repo includes a detailed guide — follow it, don't improvise.

1. Open the project folder in Finder.
2. Find the file called `SETUP.md` and open it (double-click, it opens in a text viewer or browser depending on your Mac).
3. Work through all 5 steps in order. It covers:
   - Creating a Supabase account
   - Creating a project (give it any name; the region closest to you is best)
   - Running the `schema.sql` script in Supabase's SQL editor
   - Copying your **Project URL** and **anon public key** from Supabase into a new file called `.env.local` in the project folder
   - (Step 5 in SETUP.md is about deploying online — skip it for now; we'll come back to it in Part 2.)

When you get to creating `.env.local`: the file lives at the root of your project folder (same level as `package.json`). The filename starts with a dot — on macOS, dotfiles are hidden by default. To see them in Finder, press **Cmd+Shift+.** (period). Press again to hide.

You'll know Supabase is set up correctly when SETUP.md says you can see the three tables (`puppy_profile`, `weight_entries`, etc.) in your Supabase dashboard's "Table Editor" tab.

### 7. Run the app locally (3 min)

1. In Terminal:
   ```
   cd ~/Documents/GitHub/YOUR_REPO_NAME
   ```
   Replace with your actual path. If you're not sure, in GitHub Desktop go to **Repository → Show in Finder**, then drag the folder icon from the Finder title bar into Terminal — it pastes the path.

2. Install the project's dependencies (one time, ~1 min):
   ```
   npm install
   ```

3. Start Claude Code in the project folder:
   ```
   claude
   ```

4. Once Claude is ready (you'll see a prompt), type this:
   ```
   Run npm run dev and tell me when the app is ready to view in a browser.
   ```
   Claude will execute the command and tell you when it's up. When it says ready, open `http://localhost:3000` in your browser.

5. You should see the Rescue Pup Passport app with three dogs: Willa, Biscuit, Moose. Click through the tabs. This is the running app.

Leave Terminal running. Closing Terminal will stop the dev server. (You can stop it manually later with **Ctrl+C** in the same Terminal window.)

---

## Part 2 — Deploy it online (optional, ~15 min)

Local is fine for development, but if you want to use the app from your phone during foster work, deploy it to a free host. Two options; either works. **Netlify** is slightly easier.

### Option A — Netlify

1. Go to `https://netlify.com` → Sign up with GitHub (one click).
2. After signing up: **Add new site → Import an existing project → GitHub**. Authorize Netlify to see your repos (you can scope it to just the one repo if you want).
3. Pick your repo from the list.
4. Build settings: Netlify usually detects Next.js automatically. If it asks, use:
   - **Build command**: `npm run build`
   - **Publish directory**: `out`
5. Click **"Add environment variables"** (or "Site settings → Environment variables" after deploy). Add two:
   - `NEXT_PUBLIC_SUPABASE_URL` → your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` → your Supabase anon key
   (Same values from your local `.env.local` file.)
6. **Deploy site**. First deploy takes 2–3 minutes.
7. You'll get a URL like `https://random-name-12345.netlify.app`. Open on your phone. Bookmark it.

### Option B — Vercel

Same flow: `https://vercel.com` → Sign up with GitHub → Import repo → add the two env vars → Deploy.

Both will auto-redeploy every time you push a change from GitHub Desktop. You don't need to do anything to update the live site — it's automatic.

---

## Daily workflow

Once set up, your loop is:

1. **Open the project in Claude Code.**
   ```
   cd ~/Documents/GitHub/your-repo-name
   claude
   ```

2. **Describe what you want.** For anything beyond trivial changes, ask for a plan first:
   > Don't write code yet. Walk me through what you'd change, in order, and which files. I want to approve the plan first.

3. **Review the plan.** Push back on anything that sounds like scope creep.

4. **Let Claude implement.** Ask it to run the tests when done:
   > Now implement it. Then run `npm test` and confirm everything passes.

5. **Check the result in your browser.** Dev server auto-reloads.

6. **Save your work in GitHub Desktop.**
   - Open GitHub Desktop. You'll see the list of changed files.
   - Write a short summary in the bottom-left box ("add vet bills tab").
   - Click **Commit to main**.
   - Click **Push origin** at the top.

7. If deployed on Netlify/Vercel: 2–3 minutes after pushing, your live site auto-updates.

Read `WORKING_WITH_CLAUDE.md` in the project root before you start making changes — it covers briefing technique, what to watch for in the diff, and when to restart a conversation. It's short.

---

## Troubleshooting

**"command not found: claude"** after install
Close and reopen Terminal. If it still fails, the npm global install path isn't on your PATH. Run `echo $PATH` and verify it includes something like `/usr/local/bin` or `/opt/homebrew/bin`. Worst case, use Option B (VS Code extension) instead.

**The app loads but I see a "Set up your database" screen**
Your `.env.local` isn't being read, or the values are still the placeholder strings from `.env.local.example`. Confirm the file is at the project root (same level as `package.json`), open it, and check the values aren't `your-project-id.supabase.co` etc.

**I committed something and regret it**
In GitHub Desktop: **History** tab → right-click the commit → **Revert this commit**. This creates a new commit that undoes the previous one. Safer than rewriting history.

**I changed something locally and want to throw it all away**
GitHub Desktop → **Branch → Discard all changes**. You're back to the state of your last commit.

**The dev server is showing errors I don't understand**
Paste the error into Claude with: "This appeared in my terminal. What does it mean, and what should I do?" Don't guess at fixes.

**I ran out of Claude credits mid-task**
Your work up to that point is fine. Start a fresh conversation next time and paste in what you were doing. The `CLAUDE.md` file at the project root means Claude doesn't need the codebase re-explained.

---

## A few things worth knowing

- **This is your repo.** You can't break mine. You can't even break yours beyond recovery — every commit is a restore point.
- **Commit often.** After anything that works, commit. Five one-change commits are much easier to untangle than one ten-change commit.
- **Plan mode in Claude Code**: press **Shift+Tab** to enter Plan Mode. Claude will describe what it intends to do before touching any files and wait for your approval. Use this for anything non-trivial.
- **Sonnet vs Opus**: Claude Code defaults to Sonnet, which is right for almost everything. Switch to Opus with `/model` only for genuinely confusing problems. Opus uses more of your budget.
- **If you get stuck, open an issue on the public repo** (`https://github.com/jaredpeters/rescue-pup-passport/issues`). Describe what you were trying to do and what happened. Other people hit the same things.
