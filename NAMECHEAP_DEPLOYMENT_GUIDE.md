# Tickerline — Namecheap Shared Hosting (cPanel) Complete Deployment Guide

This step-by-step guide walks you through deploying **Tickerline** to **Namecheap Shared Hosting** (Stellar, Stellar Plus, or Stellar Business) using cPanel.

---

## 1. Hosting Compatibility & Architecture Report

### Existing Project Stack:
- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Motion, Lucide Icons, Vite 8.
- **Client Storage & State Engine:** Persistent in-browser LocalStorage/IndexedDB state engine (`src/services/store.ts`) containing simulated underwriting, TILA calculations, promissory note e-signatures, multi-chain USDT validation, audit logs, and compliance records.
- **Backend Options Included:**
  1. **Option A (Static + Apache .htaccess + PHP Bridge):** Fully static compiled production build (`dist/`) with `.htaccess` for URL rewriting, HTTPS redirection, compression, and optional PHP 8.x health/config endpoints. Runs on **100% of all Namecheap plans** with zero server-side setup.
  2. **Option B (cPanel "Setup Node.js App"):** Node.js Express server (`app.js`) designed for CloudLinux Phusion Passenger in cPanel.
- **Database:**
  - **MySQL / MariaDB (`server/db/schema_mysql.sql`):** Native schema with 12 relational tables, foreign keys, and synthetic test seed data for **cPanel phpMyAdmin**. (Note: Namecheap Shared Hosting does *not* support PostgreSQL; use the provided MySQL schema).

---

## 2. Choosing & Purchasing Your Namecheap Hosting Plan

1. Go to [Namecheap Shared Hosting](https://www.namecheap.com/hosting/shared/).
2. Select any plan:
   - **Stellar:** Supports up to 3 websites and 20 GB SSD storage. (Sufficient for Tickerline).
   - **Stellar Plus (Recommended):** Unmetered SSD storage and unlimited websites.
3. Choose a domain name during checkout or connect an existing domain you already own.
4. Complete your purchase. Namecheap will email you your **cPanel Login Details** (cPanel URL, username, and password).

---

## 3. Connecting Your Domain & DNS Setup

If you registered your domain with Namecheap:
- In your Namecheap Dashboard, go to **Domain List** -> click **Manage** next to your domain.
- Under **Nameservers**, select **Namecheap Web Hosting DNS**.
- This automatically points your domain's A records to your shared hosting server.

If your domain is registered elsewhere (e.g., GoDaddy, Cloudflare):
- Look up your Namecheap server IP address in your cPanel dashboard (under **General Information** on the right sidebar: *Shared IP Address*).
- Create an **A Record** pointing `@` to your Namecheap Shared IP.
- Create a **CNAME Record** pointing `www` to your root domain.
- Allow 15–60 minutes for worldwide DNS propagation.

---

## 4. Preparing the MySQL Database in cPanel

1. Log into your **cPanel** dashboard (usually `https://yourdomain.com:2083` or through your Namecheap account).
2. Under the **Databases** section, click **MySQL® Database Wizard**.
   - **Step 1:** Enter a database name (e.g., `tickerline`). Your full database name will look like `cpaneluser_tickerline`. Click **Next Step**.
   - **Step 2:** Create a database user (e.g., `tl_admin`) and generate a strong password. Click **Create User**.
   - **Step 3:** Check the box **ALL PRIVILEGES** and click **Make Changes**.
3. Import the database schema:
   - Return to the cPanel home screen and click **phpMyAdmin**.
   - In the left sidebar, click on your newly created database (`cpaneluser_tickerline`).
   - Click the **Import** tab at the top.
   - Click **Choose File** and select `server/db/schema_mysql.sql` from your project folder.
   - Click **Import** at the bottom.
   - All 12 tables and seed data will be created with zero syntax errors.

---

## 5. Deployment Method A: Static Production Build (Recommended & Easiest)

This method provides the fastest loading speed, lowest resource consumption, and works on every single Namecheap hosting plan without needing Node.js or SSH access.

### Step 1: Locate Your Document Root
1. In cPanel, open **File Manager**.
2. For your primary domain, open the **`public_html`** directory. (If using an Addon Domain or Subdomain, navigate to that domain's specific folder).
3. If there is a default `index.html` or `default.html` placeholder file from Namecheap, delete it.

### Step 2: Upload Files
You have two options:
- **Option 1 (Using the pre-built `dist/` folder):**
  1. Open the `dist/` directory on your computer.
  2. Select all files inside `dist/` (`index.html`, `.htaccess`, the `assets/` folder, and `api/`).
  3. Create a ZIP of these contents: `tickerline-dist.zip`.
  4. In cPanel File Manager, click **Upload** and upload `tickerline-dist.zip` into `public_html`.
  5. Right-click `tickerline-dist.zip` inside `public_html` and click **Extract**.
  6. Ensure that `index.html` and `.htaccess` sit directly inside `public_html/`.

- **Option 2 (Using cPanel File Manager with the complete ZIP package):**
  1. Upload `tickerline-production-deploy.zip` to `public_html`.
  2. Extract it.
  3. Move the contents of `dist/` into `public_html/`.

### Step 3: Verify `.htaccess` Visibility
In cPanel File Manager, click **Settings** (top-right gear icon) -> check **Show Hidden Files (dotfiles)** -> click **Save**. Ensure `.htaccess` is present in `public_html`.

---

## 6. Deployment Method B: Full-Stack Node.js via cPanel "Setup Node.js App"

If your Namecheap plan includes the CloudLinux **Setup Node.js App** module and you want to run the Express API server:

1. In cPanel, scroll down to the **Software** section and click **Setup Node.js App**.
2. Click **Create Application**.
   - **Node.js version:** Select `20.x` or `18.x`.
   - **Application mode:** Select `Production`.
   - **Application root:** Enter `tickerline` (this creates a folder outside `public_html` for your server files).
   - **Application URL:** Select your domain (e.g. `yourdomain.com`).
   - **Application startup file:** Enter `app.js`.
3. Click **Create**.
4. In cPanel File Manager, upload your project files (including `app.js`, `package.json`, and the `dist/` folder) into the `/home/cpaneluser/tickerline/` directory.
5. In the **Setup Node.js App** interface, click **Run NPM Install** to install dependencies (`express`, `dotenv`, etc.).
6. Click **Restart** to launch the Node.js application.

---

## 7. Enabling Free SSL / HTTPS

Namecheap provides free cPanel SSL (Sectigo / AutoSSL):
1. In cPanel, search for **SSL/TLS Status** in the search bar.
2. Select your domain name and click **Run AutoSSL**.
3. Wait 2–5 minutes. A green lock icon will appear indicating that the SSL certificate is active.
4. Your `.htaccess` file automatically forces all HTTP requests to redirect to secure HTTPS (`https://yourdomain.com`).

---

## 8. Post-Deployment Verification Checklist

Open your browser and navigate to `https://yourdomain.com`:

| Checkpoint | Action | Expected Result |
| :--- | :--- | :--- |
| **Homepage Load** | Visit `https://yourdomain.com` | Tickerline homepage renders with dark fintech styling and hero imagery. |
| **SPA Route Refresh** | Visit `https://yourdomain.com/calculator` and press `F5` / Refresh | Page reloads the calculator without returning an Apache 404 error (handled by `.htaccess`). |
| **Interactive Loan Calculator** | Drag amount and term sliders | Real-time recalculation of monthly payment, fixed APR, origination fee, and amortization table. |
| **Loan Application Wizard** | Click "Apply for Loan" | 5-step wizard guides through personal info, income capacity, consents, and automated underwriting. |
| **Borrower Dashboard** | Switch to persona "Sarah Chen" | Displays active loan balance ($6,712.44 USDT), monthly installment, and repayment options. |
| **Promissory Note E-Signing** | Switch to persona "Marcus Vance" | Shows approved offer; allows entering non-custodial wallet address and e-signing the TILA Note. |
| **USDT Repayments** | Open "Make Repayment" on an active loan | Processes test repayment and logs a verified receipt number. |
| **Compliance Admin Console** | Click "Admin Portal" or visit `/admin` | Displays operations overview, applications queue, state usury matrix, and immutable audit trail. |
| **Support Ticket Desk** | Submit an inquiry via Contact section | Ticket is indexed and visible in both user dashboard and admin support queue. |

---

## 9. Troubleshooting & Common Issues

### Issue 1: HTTP 404 Not Found When Refreshing Subpages
- **Cause:** Apache does not know how to handle React client-side routes without rewrite rules.
- **Solution:** Verify that `.htaccess` is present in `public_html`. Enable "Show Hidden Files" in cPanel File Manager Settings. Ensure `mod_rewrite` is active.

### Issue 2: HTTP 403 Forbidden
- **Cause:** File or folder permission issue.
- **Solution:**
  - Folders in `public_html` must be set to permission **`755`**.
  - Files (`index.html`, `.htaccess`, `.js`, `.css`) must be set to permission **`644`**.
  - In File Manager, right-click the file/folder -> click **Change Permissions**.

### Issue 3: Images or Assets Fail to Load (HTTP 404)
- **Cause:** Missing `assets/` subfolder in `public_html`.
- **Solution:** Ensure the `assets/` directory from `dist/` is uploaded directly inside `public_html/assets/`.

### Issue 4: Database Connection Refused in Node/PHP
- **Cause:** Incorrect database user privileges or host.
- **Solution:**
  - Database Host on Namecheap is always **`localhost`**.
  - Ensure the database user has been granted **ALL PRIVILEGES** in cPanel -> MySQL Databases -> Add User to Database.
  - Verify that the database name and user include the cPanel username prefix (e.g. `cpaneluser_tickerline`).

---

## 10. Backups & Rollback

- **To back up your website:** In cPanel, go to **Backup Wizard** -> click **Backup** -> download a copy of **Home Directory** and **MySQL Databases**.
- **To roll back:** Use **Backup Wizard** -> click **Restore** -> upload your previously downloaded backup archive.
