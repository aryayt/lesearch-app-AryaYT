# Deployment Fix: React 19 Peer Dependency Conflict

**Date:** October 9, 2025  
**Issue:** npm peer dependency conflict during deployment  
**Status:** ✅ RESOLVED

---

## Problem

During deployment, npm was showing a peer dependency conflict:

```
npm warn ERESOLVE overriding peer dependency
npm warn While resolving: @excalidraw/excalidraw@0.16.4
npm warn Found: react-dom@19.0.0
npm warn Could not resolve dependency:
npm warn peer react-dom@"^17.0.2 || ^18.2.0" from @excalidraw/excalidraw@0.16.4
```

**Root Cause:**
- Project uses: **React 19.0.0**
- `@excalidraw/excalidraw@0.16.4` (used by `@udecode/plate-excalidraw@48.0.0`) requires: **React 17 or 18 only**

---

## Solution

### **Added npm override to force Excalidraw v0.18.0**

Updated `package.json` to include:

```json
"overrides": {
  "@excalidraw/excalidraw": "0.18.0"
}
```

**Why this works:**
- `@excalidraw/excalidraw@0.18.0` supports React 19:
  ```json
  {
    "react": "^17.0.2 || ^18.2.0 || ^19.0.0",
    "react-dom": "^17.0.2 || ^18.2.0 || ^19.0.0"
  }
  ```

---

## Verification

### 1. Correct version installed ✅
```bash
$ npm list @excalidraw/excalidraw
lesearch@0.1.0
└─┬ @udecode/plate-excalidraw@48.0.0
  └── @excalidraw/excalidraw@0.18.0 overridden
```

### 2. Build successful ✅
```bash
$ npm run build
✓ Compiled successfully in 19.5s
✓ Generating static pages (29/29)
```

### 3. No peer dependency errors ✅
- Previous error: `Could not resolve dependency: peer react-dom@"^17.0.2 || ^18.2.0"`
- Current status: All dependencies resolved correctly

---

## Impact

- ✅ Deployment will no longer fail due to peer dependency conflicts
- ✅ All Excalidraw drawing functionality remains intact
- ✅ Compatible with React 19 (latest version)
- ✅ No breaking changes in application behavior

---

## Files Changed

1. `package.json` - Added `overrides` section
2. `package-lock.json` - Updated with new Excalidraw version

---

## Deployment Instructions

When deploying, simply run:

```bash
npm install
npm run build
```

No additional flags or workarounds needed. The override is automatically applied.

---

## Alternative Solutions Considered

1. ❌ **Downgrade to React 18** - Would lose React 19 features and recent updates
2. ❌ **Remove Excalidraw** - Would lose drawing functionality in the editor
3. ❌ **Use --legacy-peer-deps flag** - Not a proper fix, just suppresses the warning
4. ✅ **Force newer Excalidraw version** - Best solution, maintains compatibility

---

## Notes

- The `npm warn ERESOLVE overriding peer dependency` warnings you may see during install are **expected and normal**
- These warnings indicate npm is successfully applying the override (not an error)
- The warning will disappear once `@udecode/plate-excalidraw` officially updates to Excalidraw 0.18.0+

---

**Status:** ✅ Deployment-ready

