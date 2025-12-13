# iOS Conversion Progress

## Phase 0: Environment Setup
- [x] Static export config (`STATIC_EXPORT=true`)
- [x] Build script (`scripts/build-ios.sh`)
- [x] `capacitor.config.ts`
- [x] API URL abstraction (`getApiUrl()`)
- [x] CORS headers on API routes
- [x] iOS build tested and working

## Phase 1: Konsta Shell
- [x] Konsta provider setup
- [x] Root layout wrapped with KonstaProvider
- [x] Main page uses Konsta Page/Navbar

## Phase 2: Component Migration
- [x] `image-uploader.tsx` - Konsta + Capacitor Camera
- [x] `user-profile-form.tsx` - Konsta List/ListInput/Segmented
- [x] `report-display.tsx` - Konsta Page/Navbar/Card/List
- [x] `interactive-ingredient.tsx` - Simplified (no popup)
- [x] No shadcn imports in app or features

## Phase 3: Native Plugins
- [x] iOS platform added (`npx cap add ios`)
- [x] Capacitor plugins installed:
  - @capacitor/camera
  - @capacitor/haptics
  - @capacitor/preferences
  - @capacitor/share
  - @capacitor/keyboard
  - @capacitor/status-bar
  - @capacitor/network
- [x] Plugins synced with iOS

## Phase 4: Native Features (Pending)
- [ ] Migrate localStorage to Capacitor Preferences
- [ ] Add haptic feedback on buttons
- [ ] Implement share sheet for reports
- [ ] Handle offline state
- [ ] Configure status bar appearance

## Phase 5: Polish & Release (Pending)
- [ ] App icons (all sizes)
- [ ] Launch screen / splash
- [ ] Info.plist permissions
- [ ] Physical device testing
- [ ] App Store Connect setup

---

## Current Focus: UI/Interface Polish

The core functionality is wired up but the interface needs refinement before adding more native features.

### UI Tasks
- [ ] Home page layout improvements
- [ ] User profile form UX (proper pickers instead of click-cycling)
- [ ] Report display styling
- [ ] Loading states
- [ ] Error states
- [ ] Empty states
- [ ] Typography and spacing
- [ ] Color scheme / theming

---

## Files Changed

| File | Status |
|------|--------|
| `capacitor.config.ts` | New |
| `scripts/build-ios.sh` | New |
| `next.config.mjs` | Modified (static export) |
| `components/konsta-provider.tsx` | New |
| `app/client-layout.tsx` | New |
| `app/layout.tsx` | Modified (KonstaProvider) |
| `app/(main)/page.tsx` | Modified (Konsta components) |
| `components/features/image-uploader.tsx` | Modified (Konsta + Camera) |
| `components/features/user-profile-form.tsx` | Modified (Konsta) |
| `components/features/report-display.tsx` | Modified (Konsta) |
| `components/features/interactive-ingredient.tsx` | Modified (simplified) |

## Cleanup (Later)
- [ ] Remove unused `components/ui/` folder (shadcn remnants)
- [ ] Remove unused Radix dependencies from package.json
