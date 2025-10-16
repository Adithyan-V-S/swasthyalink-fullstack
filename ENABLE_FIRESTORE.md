# Firestore Quota Exceeded Resolution Guide

## Issue Summary
Your Firebase Firestore writes have exceeded the free Spark plan quota of 20,000 writes per day. This causes service disruption until the quota resets or you upgrade your plan.

## Resolution Options

### 1. Code Optimizations to Reduce Writes
- **Debounce or throttle writes:** For example, in `updateUserProfile`, avoid writing on every small change by batching or delaying writes.
- **Batch writes:** Use Firestore batch writes to combine multiple write operations into one.
- **Check for data changes:** Before writing, verify if the data has actually changed to avoid unnecessary writes.
- **Optimize notifications:** Group or limit notification updates to reduce write frequency.
- **Archive or delete old requests:** Reduce updates on stale data.
- **Review write-heavy functions:** Such as `sendFamilyRequest`, `acceptFamilyRequest`, `rejectFamilyRequest`, and `addToFamilyNetwork` for optimization opportunities.

### 2. Upgrade Firebase Plan to Blaze (Pay-as-you-go)
- Upgrading removes the 20K writes/day limit.
- Billing is based on actual usage.
- Steps to upgrade:
  1. Go to [Firebase Console](https://console.firebase.google.com/).
  2. Select your project.
  3. Navigate to **Project Settings > Usage and billing**.
  4. Click the **Upgrade** button.
  5. Follow the prompts to add billing information and switch to Blaze plan.

## Testing Recommendations
- Perform **critical-path testing** on:
  - User profile updates
  - Family requests creation and updates
  - Family network modifications
- Optionally, perform **thorough testing** covering all affected pages and backend services.

## Next Steps
- Implement code optimizations as per above.
- Upgrade Firebase plan if higher usage is expected.
- Test critical paths to verify stability and quota handling.

---

If you want, I can provide example code snippets for debouncing and batching writes, and assist with upgrade steps and testing.

Please let me know how you want to proceed.
