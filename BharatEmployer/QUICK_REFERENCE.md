# Quick Reference: Setup & Testing

## 🚀 3-Step Setup (5 minutes)

### Step 1: Deploy SQL Trigger (1 minute)
```
Supabase Dashboard → SQL Editor → New Query
→ Paste supabase_auth_trigger.sql content
→ Click RUN
```

**That's it!** ✅ Trigger is now active.

---

### Step 2: Test Signup (2 minutes)
1. Open app
2. Go to signup tab
3. Fill form:
   - Name: John Doe
   - Email: john@example.com
   - Password: Test@123
   - DOB: 18/03/2000
   - Phone: 9876543210

4. Click "Continue"
5. **Should auto-navigate to EmployerRegistration screen**

---

### Step 3: Fill Employer Form (2 minutes)
1. Business Type: Select "Business"
2. Company Name: Acme Corp
3. Phone: 9876543210 (auto-filled)
4. Billing Address: 123 Main St, City
5. Click "Continue"
6. **Should auto-navigate to Home screen** ✅

---

## 🔍 Verify Setup Works

### Check User Was Created
1. Supabase Dashboard → Database → users table
2. You should see your test user
3. Check: id, name, email, phone are populated

### Check Employer Was Created
1. Supabase Dashboard → Database → employers table
2. You should see corresponding employer record
3. Check: user_id matches, company_name populated

---

## 📱 Code Overview

### 3 Files Modified:
```
App.tsx
  └─ Added: EmployerRegistrationScreen import
  └─ Added: checkEmployerProfile() logic
  └─ Shows registration if employer doesn't exist

AuthScreen.tsx
  └─ Modified: handleSignup() function
  └─ Now navigates to EmployerRegistration after signup

EmployerRegistration.tsx (NEW)
  └─ Full registration form
  └─ Saves to employers table
  └─ Navigates to MainTabs on success
```

### 1 File Created (SQL):
```
supabase_auth_trigger.sql
  └─ Trigger function: handle_new_user()
  └─ Runs on auth signup
  └─ Auto-creates public.users record
  └─ Includes RLS policies
```

---

## 🐛 Troubleshooting

### Users not being created
**Problem:** Signup works but no user in database
**Solution:** 
- Verify trigger deployed successfully
- Check Supabase Logs for errors
- Run test query: `SELECT * FROM public.users LIMIT 1;`

### Registration screen not showing
**Problem:** After signup, goes to home instead of registration
**Solution:**
- Check employer profile exists (it shouldn't yet!)
- In App.tsx, verify checkEmployerProfile() logic
- Clear app cache and retry

### Can't login after registration
**Problem:** Login works but goes back to registration
**Solution:**
- Verify employer record was actually saved
- Check RLS policies allow reading own employer
- Query: `SELECT * FROM employers WHERE user_id = 'YOUR_USER_ID';`

---

## 📊 Data Flow

### Signup:
```
AuthScreen.handleSignup()
  ↓
supabase.auth.signUp()
  ↓ (Success)
Alert → navigate('EmployerRegistration')
```

### Registration:
```
EmployerRegistration.handleContinue()
  ↓
Update users.phone
  ↓
Insert employers record
  ↓ (Success)
Alert → navigation.reset({Home})
```

### Login:
```
AuthScreen.handleLogin()
  ↓
supabase.auth.signInWithPassword()
  ↓ (Success)
App.tsx detects session change
  ↓
App.tsx calls checkEmployerProfile()
  ↓
Employer exists? 
  ├─ YES → Show MainTabs ✓
  └─ NO → Show AuthStack (EmployerRegistration)
```

---

## 💾 Database State

### After Signup Only:
```
users table:
  id: 550e8400-e29b-41d4-a716-446655440000
  phone: +919876543210
  name: John Doe
  email: john@example.com
  roles: ['employer']

employers table: (empty - user hasn't registered yet)
```

### After Registration:
```
users table: (same as above)

employers table:
  id: 550e8400-e29b-41d4-a716-446655440001
  user_id: 550e8400-e29b-41d4-a716-446655440000
  company_name: Acme Corp
  employer_type: business
  billing_address: 123 Main St, City
  created_at: 2024-01-30 10:30:00
```

---

## ⚙️ Configuration

### To Make Registration Mandatory:
In `EmployerRegistration.tsx`, remove the skip button:
```tsx
// Comment this out or delete:
<TouchableOpacity
  style={styles.skipBtn}
  onPress={handleSkip}
  disabled={loading}
>
  <Text style={styles.skipBtnText}>Skip for Now</Text>
</TouchableOpacity>
```

### To Add More Business Types:
In `EmployerRegistration.tsx`, update array:
```tsx
{
  { id: 'startup', label: 'Startup', icon: 'rocket' },
  { id: 'enterprise', label: 'Enterprise', icon: 'business' },
  // Add more...
}
```

### To Add More Form Fields:
1. Add state: `const [gstNumber, setGstNumber] = useState('')`
2. Add TextInput in JSX
3. Add to insert: `gst_number: gstNumber,`

---

## 📞 Support

See full docs:
- `IMPLEMENTATION_SUMMARY.md` - Overview
- `EMPLOYER_REGISTRATION_SETUP.md` - Detailed guide
- `SQL_SETUP_INSTRUCTIONS.md` - SQL explanations

---

**Status:** ✅ Ready to Deploy
**Next:** Run SQL trigger → Test signup flow → Done!
