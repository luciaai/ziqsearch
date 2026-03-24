# Academic Discount Management Guide

## How It Works (Simple Explanation)

The academic discount works in **two ways**:

### 1. Automatic (for .edu emails)
When anyone signs up with a university or academic institution email, the system checks if their email domain is approved. If yes, they automatically get $5/month pricing instead of $10/month.

**Who qualifies:** Students, professors, researchers, staff - anyone with an approved academic email domain.

**No manual approval needed** - it all happens automatically!

### 2. Request-Based (for non-.edu users)
For homeschoolers, international students, and others without .edu emails, there's a request form at `/request-education-discount`.

**How it works:**
- User fills out form with name, email, role, and details
- Optionally uploads proof (homeschool membership, enrollment letter, etc.)
- You receive email notification at ziqsearch@gmail.com
- You review and manually send them a discount code if approved
- They use the code at checkout to get $5/month pricing

---

## How to Manage Approved Domains

You control which university email domains get the discount by editing a simple list.

### Option 1: Edit the Code (Simplest)

**File:** `lib/discount.ts` (line 70)

**Current approved domains:**
```javascript
studentDomains = ['.edu'];
```

**To add more domains:**
```javascript
studentDomains = ['.edu', '.ac.uk', '.edu.au'];
```

**Common university domains:**
- `.edu` - US universities (e.g., user@stanford.edu)
- `.ac.uk` - UK universities (e.g., user@oxford.ac.uk)
- `.edu.au` - Australian universities (e.g., user@sydney.edu.au)
- `.ac.nz` - New Zealand universities
- `.edu.ca` - Canadian universities

**After editing:**
1. Save the file
2. Restart your dev server (`npm run dev`)
3. Deploy to production
4. Done! The new domains are now approved

---

### Option 2: Vercel Edge Config (Advanced - Optional)

If you want to update domains WITHOUT touching code or redeploying:

1. Go to your Vercel dashboard
2. Navigate to your project → Storage → Edge Config
3. Create a new Edge Config (if you don't have one)
4. Add a key: `student_domains`
5. Set value as comma-separated list: `.edu,.ac.uk,.edu.au`
6. Connect Edge Config to your project
7. Changes take effect immediately (no deployment needed)

**When to use this:**
- You need to frequently add/remove domains
- You want instant updates without redeploying
- You have multiple people managing domains

**When to use Option 1 instead:**
- You rarely change domains (simpler)
- You don't want to set up Vercel Edge Config
- You prefer everything in code

---

## Required Environment Variable

For the discount to work, you need this in your `.env` file:

```
DODO_STUD_DISC_ID=your_discount_id_from_payment_provider
```

This is the discount ID from your payment provider (Stripe/DodoPayments) that applies the $5 pricing.

**Without this variable:** The system will still detect students but won't apply the discount at checkout.

---

## How Users See It

### Regular User:
- Sees: "Pro - $10/month"
- Pricing page shows: "Academic discount available - Get Pro for just $5/month!"

### Academic User (with .edu email):
- Sees: "Pro - $10/month" with green "Academic" badge
- Pricing page shows: "Academic discount active - Your academic email has been recognized"
- Upgrade button says: "🎓 Upgrade with academic discount"
- At checkout: Discount automatically applied

---

## Testing

**To test if a domain works:**

1. Sign up with a test email using that domain (e.g., test@stanford.edu)
2. Go to `/pricing` page
3. If domain is approved, you'll see:
   - Green "Student" badge on Pro plan
   - "Student discount active" message
   - "$5/month" pricing

**If it doesn't work:**
- Check the domain is in the list (line 70 of `lib/discount.ts`)
- Make sure you restarted the dev server
- Check browser console for errors
- Verify `DODO_STUD_DISC_ID` is set in `.env`

---

## Quick Reference

**File to edit:** `lib/discount.ts` (line 70)

**Current setup:** Only `.edu` domains approved

**To add domains:** Add to the array: `['.edu', '.ac.uk', '.edu.au']`

**Pricing:** 
- Regular: $10/month
- Academic: $5/month (50% off)

**Who qualifies:** Students, professors, researchers, staff - anyone with approved academic email

**Automatic:** Yes - no manual approval needed

---

## Troubleshooting

**Problem:** User not getting discount
- **Check:** Is their email domain in the approved list?
- **Check:** Did you restart the server after editing?
- **Check:** Is `DODO_STUD_DISC_ID` set in environment variables?

**Problem:** Want to remove a domain
- **Solution:** Delete it from the array in line 70, save, restart server

**Problem:** Need to add many domains quickly
- **Solution:** Consider using Vercel Edge Config (Option 2)

---

## Managing Education Discount Requests

When someone submits a request via `/request-education-discount`:

1. **You receive an email** at ziqsearch@gmail.com with:
   - Applicant's name and email
   - Their role (student, homeschool teacher, etc.)
   - Organization (if provided)
   - Details about their situation
   - Link to proof document (if uploaded)

2. **Review the request:**
   - Does it seem legitimate?
   - Is the proof sufficient?
   - Do they qualify for education discount?

3. **If approved:**
   - Create a discount code in your payment provider (Stripe/DodoPayments)
   - Set it to 50% off or $5/month pricing
   - Email the code to the applicant
   - They use it at checkout

4. **If denied:**
   - Send a polite email explaining why
   - Suggest alternatives if applicable

**Typical approval criteria:**
- Homeschool students/teachers with proof
- International students without .edu emails
- Students at institutions that don't use .edu
- Educational researchers

---

## Summary

**Automatic discount (.edu emails):**
1. Edit `lib/discount.ts` line 70
2. Add/remove domains from the array
3. Save and restart server
4. Done!

**Manual discount (requests):**
1. Receive email notification
2. Review application
3. Send discount code if approved
4. Done!

**That's it!** The system handles everything else automatically.
