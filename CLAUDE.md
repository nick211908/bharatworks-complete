You are a Senior React Native + TypeScript engineer.

OBJECTIVE:
Apply minimal, production-safe fixes. Do NOT refactor UI. Only augment.

GLOBAL RULES:
- Modify only required lines
- Preserve UI/UX and structure
- No dummy data hacks
- No unnecessary explanations
- Deterministic fixes only

---

## TASK 1: API CONFIG + INTERCEPTOR
File: `MyApp/src/services/api.ts`

REPLACE existing logic with:

- Dynamic baseURL:
  - prod → https://api.yourproductiondomain.com/api
  - dev → `EXPO_PUBLIC_API_HOST || (android ? 10.0.2.2 : localhost)`

- Axios instance

- In-memory token cache:
  `let cachedToken: string | null = null`

- Export:
  `setAuthToken(token)`

- Request interceptor:
  - Load token from AsyncStorage ONLY if cache empty
  - Attach Authorization header

- Response interceptor:
  - On 401:
    - clear cache
    - remove AsyncStorage token

---

## TASK 2: TOKEN PRELOAD
File: `MyApp/App.tsx` OR `AppNavigator.tsx`

IMPLEMENT:
- `useEffect`:
  - read AsyncStorage token
  - call `setAuthToken(token)`
- Add loading state:
  - block render until done
  - show spinner

---

## TASK 3: AUTH PAYLOAD FIX
File: `MyApp/src/services/AuthService.ts`

ENFORCE:
- Email flow → `{ email, otp }`
- Phone flow → `{ phone, otp }`
- NEVER send fake phone values
- NEVER mix payloads

---

## TASK 4: UI RACE CONDITION
Files:
- `Login.tsx`
- `MobileVerification.tsx`

IMPLEMENT:
- State:
  `const [isLoading, setIsLoading] = useState(false)`

- Wrap API calls:

`setIsLoading(true)
try { await fn() }
finally { setIsLoading(false) }`


- Buttons:
- `disabled={isLoading}`
- show `<ActivityIndicator />` when loading

---

## TASK 5: AUTH MODE SEPARATION
File: `MobileVerification.tsx`

IMPLEMENT:
- Strict branching:
- email → `verifyEmailOtp`
- phone → `verifyOtp`
- No mixed logic
- Correct error messages per mode

---

## OUTPUT FORMAT (STRICT)

1. PATCH (unified diff ONLY)
2. FIX SUMMARY (1 line per task)
3. ASSUMPTIONS (if required)

PATCH RULES:
- Only changed lines
- No full file dumps
- Format:
--- before
+++ after
@@

---

PRIORITY:
1. Data consistency
2. Security (tokens, env)
3. UX stability
4. Performance (caching)

---

IF NO CHANGES:
Return:
NO_CHANGES_REQUIRED

---

## TASK 6: HINDI LOCALIZATION
Files: 
- `Login.tsx`
- `MobileVerification.tsx`

IMPLEMENT:
- Add a language toggle (English/Hindi) or basic context
- Translate all user-facing strings in the Auth screens to Hindi
- Ensure layout handles longer Hindi text correctly