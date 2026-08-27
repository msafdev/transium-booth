# Google Drive Auto-Sync Setup Guide for Transium Photobooth 📸

Follow these simple steps (takes only 1 minute) to allow Transium Photobooth to **automatically upload every photo strip directly into your Google Drive folder** (`1OV1osHIXrRjtaaIt7hX90AkY1AXGdZr6`):

---

### Step 1: Open Google Apps Script
1. Go to **[https://script.google.com/home/start](https://script.google.com/home/start)**.
2. Click **+ New project** (top left).
3. Name the project: `Transium Booth Drive Uploader`.

---

### Step 2: Paste this Code
Replace all code in `Code.gs` with the following:

```javascript
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var folderId = data.folderId || "1OV1osHIXrRjtaaIt7hX90AkY1AXGdZr6";
    var folder = DriveApp.getFolderById(folderId);

    // Decode base64 image
    var base64Data = data.image.replace(/^data:image\/\w+;base64,/, "");
    var decoded = Utilities.base64Decode(base64Data);
    var blob = Utilities.newBlob(decoded, "image/png", data.filename || ("transium-" + new Date().getTime() + ".png"));

    // Create file in Google Drive folder
    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      fileId: file.getId(),
      url: file.getUrl(),
      downloadUrl: "https://drive.google.com/uc?export=download&id=" + file.getId()
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: err.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

---

### Step 3: Deploy as Web App
1. Click the blue **Deploy** button (top right) → **New deployment**.
2. Click the gear icon ⚙️ next to "Select type" → Select **Web app**.
3. Set the options:
   - **Description**: `Transium Booth Uploader`
   - **Execute as**: `Me (your email)`
   - **Who has access**: **`Anyone`** *(Important: so your photobooth can send images)*
4. Click **Deploy**.
5. Authorize access when prompted by Google.
6. Copy the generated **Web app URL** (starts with `https://script.google.com/macros/s/.../exec`).

---

### Step 4: Add to Vercel
1. Go to your **[Vercel Dashboard](https://vercel.com)** → Select `transium-booth` project.
2. Go to **Settings** → **Environment Variables**.
3. Add:
   - **Key**: `GOOGLE_DRIVE_WEBHOOK_URL`
   - **Value**: *(Paste your Web app URL from Step 3)*
4. Click **Save** and **Redeploy**.

---

🎉 **Done!** Every photo taken on Transium Photobooth will now automatically drop into your Google Drive folder in real-time!
