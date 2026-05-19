# Admin Content Manager

## Overview
This admin panel allows complete deletion of content (Updates, PDFs, Tools) along with their associated files from Supabase storage.

## Features
✅ **Complete Deletion** - Removes database records AND associated files  
✅ **Supabase Storage Cleanup** - Deletes images from storage buckets  
✅ **Real-time Updates** - UI refreshes automatically after deletion  
✅ **Confirmation Dialog** - Prevents accidental deletions  
✅ **Three Content Types** - Manage Updates, PDFs, and Tools  

## How It Works

### 1. File Deletion Logic
When admin deletes content:
- **Database Record** → Permanently deleted from Supabase
- **Image Files** → Removed from Supabase Storage bucket
- **External Links** → Cleaned up automatically

### 2. Storage Path Extraction
The system extracts file paths from Supabase URLs:
```
https://xyz.supabase.co/storage/v1/object/public/images/abc.jpg
↓
images/abc.jpg
```

### 3. Deletion Functions
- `deleteUpdateWithFiles()` - Updates + images
- `deletePdfWithFiles()` - PDFs + cover images  
- `deleteToolWithFiles()` - Tools + images

## Access
Visit: `/admin/content`

## Security Notes
⚠️ **This is a powerful tool** - Only trusted admins should have access  
⚠️ **Deletion is permanent** - No recovery option  
⚠️ **Affects all users** - Changes are immediate  

## Future Enhancements
- [ ] User authentication for admin routes
- [ ] Activity logging for deletions
