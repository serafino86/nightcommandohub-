# Installation Guide - NGC Alliance Hub

Complete setup guide for alliance leaders who want to deploy their own instance.

---

## 📋 Prerequisites

- Google Account (for Google Sheets & Apps Script)
- GitHub Account (for hosting frontend)
- Basic understanding of copy/paste 😊

**Time required:** 20-30 minutes

---

## 🚀 Step-by-Step Installation

### Step 1: Create Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it: `Alliance Hub - [Your Alliance Name]`

### Step 2: Setup Google Apps Script

1. In your Google Sheet, click **Extensions** → **Apps Script**
2. Delete the default code
3. Copy all content from `alliance-hub-script-fixed.gs`
4. Paste into Apps Script editor
5. Click **Save** (💾 icon)
6. Name the project: `Alliance Hub Backend`

### Step 3: Configure Sheet Names

In the Apps Script, update these constants (lines 15-20):

```javascript
var DATA_SHEET_NAME = 'Data';           // Your main data sheet
var CANYON_HISTORY_SHEET = 'Canyon History';
var STORM_HISTORY_SHEET = 'Storm History';
```

Make sure these sheet names exist in your Google Sheet!

### Step 4: Set Alliance Code

1. In your Google Sheet, go to cell **B2**
2. Enter your secret alliance code (e.g., "NGC2025")
3. This code protects data submission

### Step 5: Deploy Apps Script

1. In Apps Script, click **Deploy** → **New deployment**
2. Click ⚙️ (settings icon) → Select **Web app**
3. Settings:
   - **Execute as:** Me
   - **Who has access:** Anyone
4. Click **Deploy**
5. **Authorize** the app (click through Google warnings)
6. **Copy the deployment URL** (looks like: `https://script.google.com/macros/s/AKfycby.../exec`)

### Step 6: Update Frontend Files

1. Download all HTML files from this repository
2. Open each file in a text editor
3. Find the line with `GOOGLE_SCRIPT_URL` or `API_URL` or `SCRIPT_URL`
4. Replace with your deployment URL:

**index.html** (line ~578):
```javascript
const API_URL = 'YOUR_DEPLOYMENT_URL_HERE';
```

**war-room-defense-tracker.html** (line ~698):
```javascript
const NGC_SCRIPT_URL = 'YOUR_DEPLOYMENT_URL_HERE';
```

**alliance-strategy-ENHANCED.html** (line ~1369):
```javascript
const GOOGLE_SCRIPT_URL = "YOUR_DEPLOYMENT_URL_HERE";
```

**ngc-personal-stats.html** (line ~636):
```javascript
const SCRIPT_URL = 'YOUR_DEPLOYMENT_URL_HERE';
```

### Step 7: Customize Branding (Optional)

In `index.html`, update alliance info (lines ~550-570):

```javascript
alliance_name: "Your Alliance Name",
alliance_logo: "🎯",
server: "#1234",
tagline: "Your Alliance Tagline"
```

### Step 8: Deploy to GitHub Pages

1. Go to your GitHub repository
2. Upload all HTML files:
   - `index.html`
   - `war-room-defense-tracker.html`
   - `alliance-strategy-ENHANCED.html`
   - `ngc-personal-stats.html`
3. Go to **Settings** → **Pages**
4. Source: **Deploy from a branch**
5. Branch: **main** (or master)
6. Folder: **/ (root)**
7. Click **Save**

Wait 2-3 minutes for deployment.

Your site will be live at: `https://[your-username].github.io/[repo-name]/`

---

## ✅ Verification

### Test Backend Connection

1. Open browser console (F12)
2. Visit your deployed site
3. Look for logs like:
   ```
   ✅ Config loaded successfully
   ✅ Loaded 50 players from cache
   ```

### Test Data Submission

1. Go to **War Room** page
2. Enter player name + alliance code
3. Submit power data
4. Check Google Sheet → Should see new entry!

### Test Strategy Manager

1. Go to **Strategy Manager**
2. Click "📊 Load from Sheets"
3. Should see player list populate
4. Try assigning players to buildings

---

## 🔧 Troubleshooting

### "Failed to load config"
- ✅ Check Apps Script deployment URL is correct
- ✅ Verify Apps Script is deployed as "Web app"
- ✅ Check "Who has access" is set to "Anyone"

### "Invalid alliance code"
- ✅ Check cell B2 in Google Sheet has the code
- ✅ Make sure code matches exactly (case-sensitive)

### "Players not loading"
- ✅ Open Apps Script → View → Execution log
- ✅ Look for errors
- ✅ Make sure sheet names match constants in script

### CORS Errors
- ✅ Apps Script must be deployed, not just saved
- ✅ Re-deploy if you made changes

---

## 📞 Support

For issues or questions:
- 📧 Email: serafino.ngc@gmail.com
- 🐛 GitHub Issues: [Open an issue](https://github.com/serafino86/serafino86.github.io/issues)

---

## 🔒 Security Notes

- **Alliance Code:** Keep it secret! Only share with trusted R4/R5
- **Apps Script:** Only you can modify the backend
- **Data:** Stored in YOUR Google Sheet (complete control)
- **Privacy:** No third-party tracking or analytics

---

## 📜 License

This software is licensed under CC BY-NC-ND 4.0.  
For commercial use, contact: serafino.ngc@gmail.com

---

**Made with ❤️ by Serafino**  
*Revolutionizing Alliance Coordination, One Sheet at a Time*
