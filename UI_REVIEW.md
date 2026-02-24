# UI Review - Live Auction Concept Verification

## Current Implementation Issues

The current UI is implementing a **"Timed Auction"** model (like eBay), but your concept is a **"Live Event Auction"** model (like traditional auction houses).

### ❌ Current Wrong Implementation:
1. **CountdownTimer** - Shows countdown to auction END time
2. **CreateAuction** - Has "End Date & Time" field with note "Auctions must run for a minimum of 24 hours"
3. **Auction Data** - Uses `startTime` and `endTime` suggesting auctions run over a period
4. **Auction Status** - Shows "Active" but doesn't clearly indicate it's a scheduled live event

### ✅ Your Correct Concept:
- Auction happens ONLY on a specific day/time (published by bank)
- Two participant groups:
  - **On-field**: Physical location where auction is taking place
  - **Online**: Remote participants attending online
- All bids shared in real-time between both groups
- Admin coordinates/manages the live event

## Required Changes

1. Replace "End Date & Time" with "Auction Date & Time" (the scheduled live event)
2. Change countdown to show time until auction STARTS (not ends)
3. Add auction status: "Scheduled", "Live Now", "Completed"
4. Remove concept of "bidding period" - emphasize it's a live event
5. Make it clear auctions are scheduled events, not continuous bidding windows
