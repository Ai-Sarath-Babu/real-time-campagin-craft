# Campaign Craft - Complete User Guide

## 🚀 What You've Built

A full-stack UTM tracking and analytics platform with:
- **Real-time tracking**: Live event tracking with WebSocket updates
- **Campaign management**: Create, store, and manage UTM campaigns
- **Analytics dashboard**: View clicks, conversions, and pageviews in real-time
- **Tracking scripts**: Embeddable JavaScript for any website
- **User authentication**: Secure login/signup with Supabase Auth

## 📊 Database Structure

### Tables Created:
1. **campaigns** - Stores UTM campaigns with all parameters
2. **tracking_events** - Real-time event tracking (clicks, pageviews, conversions)
3. **campaign_stats** - Aggregated daily statistics per campaign

### Features:
- ✅ Row Level Security (RLS) enabled
- ✅ Real-time subscriptions active
- ✅ Automatic stat aggregation via triggers
- ✅ Proper indexes for performance

## 🎯 How to Use

### Step 1: Sign Up
1. Go to `/auth` page
2. Create an account with email/password
3. **Important**: For testing, disable "Confirm email" in Supabase settings:
   - Go to Authentication > Settings > Email Auth
   - Toggle off "Enable email confirmations"

### Step 2: Create a Campaign
1. Go to Dashboard → UTM Builder tab
2. Fill in:
   - Campaign Name (e.g., "Summer Sale 2024")
   - Website URL (your destination URL)
   - Required: Source, Medium, Campaign
   - Optional: Term, Content, ID, Custom parameters
3. Click "Save Campaign"
4. Your campaign is now stored and ready to track!

### Step 3: Get Tracking Script
1. Go to Dashboard → My Campaigns tab
2. Find your campaign
3. Click "Get Script" button
4. Copy the tracking script
5. Paste it in your website before the closing `</body>` tag

### Step 4: Track Events
The script automatically tracks:
- **Page views**: Automatic when page loads
- **Clicks**: Add `data-track="click"` to any button/link
- **Conversions**: Add `data-track="conversion"` to conversion buttons

Example:
```html
<button data-track="click">Learn More</button>
<button data-track="conversion">Buy Now</button>
```

### Step 5: View Live Analytics
1. Go to Dashboard → Live Analytics tab
2. See real-time updates as events happen:
   - Total clicks, conversions, pageviews
   - Conversion rates
   - Live activity feed
   - Top performing campaigns

## 🧪 Testing the Tracking

### Quick Test:
1. Create a test campaign in the dashboard
2. Copy the campaign's UTM URL
3. Click "Test Tracking" in the navigation
4. Add your UTM parameters to the URL
5. Click the test buttons to track events
6. Go back to Live Analytics to see the events appear in real-time!

### Example Test URL:
```
/test-tracking?utm_source=google&utm_medium=cpc&utm_campaign=summer_sale_2024
```

## 🔐 Security Features

### Authentication
- Secure email/password authentication
- Session management with auto-refresh
- Protected routes (must be logged in)

### Database Security
- Row Level Security (RLS) on all tables
- Users can only see their own campaigns
- Public tracking endpoint (no auth required)
- Server-side validation

## 📱 Pages Overview

### Landing Page (`/`)
- Hero section with stats
- Feature showcase
- Demo UTM builder
- Demo dashboard

### Auth Page (`/auth`)
- Sign in / Sign up tabs
- Email/password authentication
- Auto-redirect when logged in

### Dashboard (`/dashboard`)
- **UTM Builder**: Create and save campaigns
- **My Campaigns**: View, manage, get tracking scripts
- **Live Analytics**: Real-time tracking data

### Test Tracking (`/test-tracking`)
- Test tracking functionality
- Simulate clicks and conversions
- Verify UTM parameters

## 🛠 Technical Details

### Edge Function
- **Endpoint**: `https://azolpholrzdashejgcdl.supabase.co/functions/v1/track-event`
- **Method**: POST
- **Public access**: No authentication required
- **CORS enabled**: Works from any domain

### Real-time Updates
- WebSocket subscriptions on `tracking_events` table
- Automatic UI updates when new events arrive
- No polling required

### Performance
- Indexed database queries
- Efficient stat aggregation via triggers
- Optimized real-time subscriptions

## 📈 Key Metrics Tracked

1. **Clicks**: User clicks on tracked elements
2. **Page Views**: Automatic page load tracking
3. **Conversions**: Goal completions (purchases, signups, etc.)
4. **Unique Visitors**: Session-based tracking
5. **Conversion Rate**: Conversions / Clicks
6. **Campaign Performance**: Per-source and per-medium breakdown

## 🎨 Design System

### Colors:
- **Primary**: Purple (#6366f1) - Main brand color
- **Accent**: Cyan - Secondary highlights
- **Success**: Green - Positive actions
- **Warning**: Amber - Alerts

### Features:
- Glassmorphism effects
- Smooth animations
- Responsive design
- Dark mode support

## 🚨 Important Notes

1. **Email Confirmation**: Disable for testing in Supabase settings
2. **CORS**: The tracking endpoint accepts requests from any domain
3. **Privacy**: No PII collected by default
4. **Real-time**: Dashboard updates automatically (no refresh needed)
5. **Edge Function**: Already deployed and ready to use

## 🔄 Next Steps

### Enhance Tracking:
- Add custom event types
- Track user demographics
- A/B testing capabilities
- Funnel visualization

### Advanced Features:
- Export data to CSV
- Email reports
- Campaign templates
- Team collaboration
- API webhooks

### Analytics Improvements:
- Historical charts
- Compare campaigns
- ROI calculations
- Attribution modeling

## 📞 Support

For issues or questions:
1. Check the Live Analytics to verify tracking
2. Use browser console to debug tracking calls
3. Review Supabase logs for edge function errors
4. Check RLS policies if data isn't showing

---

**Built with**: React, TypeScript, Tailwind CSS, Supabase, Vite
**Fully functional**: Authentication ✓ | Database ✓ | Real-time ✓ | Edge Functions ✓
