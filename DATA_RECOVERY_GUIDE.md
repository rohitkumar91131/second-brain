# Data Recovery Guide

## If Data Was Actually Deleted

If after testing you find that your data count is 0 in MongoDB (using the verification script), here's how to recover:

### Option 1: Restore from Backup (If Available)
```bash
# Contact hosting provider (Render, MongoDB Atlas)
# Request a backup restore to point before data loss occurred
# This is the safest method
```

### Option 2: Check if Data Was Soft-Deleted
Our system marks deleted notes with a `deletedAt` timestamp rather than truly deleting them.

```javascript
// In MongoDB console
db.notes.findOne({ userId: ObjectId("...your_id..."), deletedAt: { $ne: null } })
// If this returns documents, your notes are in "trash"
// They can be recovered by clearing the deletedAt field
```

### Option 3: Restore Soft-Deleted Data (In App)
If your app has a "Recycle Bin" or "Trash" feature:
1. Go to Dashboard → Recycle Bin
2. Right-click deleted note → "Restore"
3. Note should return to its original location

### Option 4: Manual Recovery via MongoDB
If you have access to MongoDB:

```javascript
// Restore all soft-deleted notes for a user
db.notes.updateMany(
  { 
    userId: ObjectId("...your_id..."),
    deletedAt: { $ne: null }
  },
  { $set: { deletedAt: null } }
)

// Verify restoration
db.notes.find({ userId: ObjectId("...your_id...") }).count()
// Should show restored count
```

## Prevention for Future

The email-based verification now ensures data won't be lost due to ID mismatches:

1. ✅ Email is permanent unique identifier
2. ✅ Falls back to email if ID lookup fails
3. ✅ All subsequent operations use correct ID
4. ✅ Data is always found, never "orphaned"

## Questions to Ask When Investigating

1. **When did the loss happen?**
   - Right after login? → ID mismatch issue (now fixed)
   - During logout? → Session corruption (unlikely)
   - Random time? → Possible accidental delete

2. **Was it all data or some data?**
   - All gone → User ID issue (now fixed)
   - Only some → Possible accidental delete (check trash)

3. **Do you remember the data?**
   - Yes → We can search backups for recovery
   - No → Less critical, focus on prevention

## Recommended Actions

1. **Run verification script** (see DATA_LOSS_FIX_TESTING.md)
2. **Check Recycle Bin** in your app if it exists
3. **Test login/logout cycle** multiple times
4. **Monitor logs** for email fallback activation
5. **Report to support** with:
   - Exact time data disappeared
   - Which types of data (notes, projects, etc.)
   - Email account used
   - Device and browser used

---

This guide is for **post-incident recovery**. The email-based verification fix ensures this doesn't happen again.
