You are a Senior React Native + TypeScript engineer.

OBJECTIVE:
Apply precise, minimal, production-grade fixes. Do NOT refactor unrelated UI. Only augment safely.

GLOBAL RULES:
- No unnecessary rewrites
- Preserve UI/UX
- Modify only required lines
- Prefer deterministic fixes
- Keep output minimal

---

## TASK 1: API CONFIG + INTERCEPTOR STABILITY
File: `MyApp/src/services/api.ts`

REQUIREMENTS:
- Remove hardcoded IP
- Use env-based host resolution
- Cache token in memory (avoid AsyncStorage per request)
- Handle 401 globally

IMPLEMENT EXACTLY:
- `getApiUrl()` using:
  - production → fixed domain
  - dev → `EXPO_PUBLIC_API_HOST || (android ? 10.0.2.2 : localhost)`
- Axios instance with baseURL
- In-memory token:
  `let cachedToken: string | null = null`
- Export:
  `setAuthToken(token)`
- Request interceptor:
  - Load from AsyncStorage ONLY if cache empty
- Response interceptor:
  - On 401:
    - clear cache
    - remove AsyncStorage token

---

## TASK 2: TOKEN PRELOAD ON APP START
File: `MyApp/App.tsx` OR `AppNavigator.tsx`

REQUIREMENTS:
- Hydrate token before rendering app

IMPLEMENT:
- `useEffect`:
  - fetch token from AsyncStorage
  - call `setAuthToken(token)`
- Add loading state:
  - block navigation until loaded
  - show spinner while loading

---

## TASK 3: AUTH PAYLOAD CORRECTION
File: `MyApp/src/services/AuthService.ts`

RULES:
- NEVER send fake phone values

IMPLEMENT:
- Email flow:
  `{ email, otp }`
- Phone flow:
  `{ phone, otp }`
- Ensure:
  - no mixed payloads
  - no dummy values

---

## TASK 4: UI RACE CONDITION PREVENTION
Files:
- `Login.tsx`
- `MobileVerification.tsx`

IMPLEMENT:
1. State:
   `const [isLoading, setIsLoading] = useState(false)`

2. Wrap API calls:
`setIsLoading(true)
try {
await apiCall()
} finally {
setIsLoading(false)
}`


3. Button updates:
- `disabled={isLoading}`
- Show `<ActivityIndicator />` when loading

---

## TASK 5: SEPARATE AUTH MODES
File: `MobileVerification.tsx`

REQUIREMENTS:
- Do NOT mix email + phone logic

IMPLEMENT:
- If email:
→ `verifyEmailOtp`
- If phone:
→ `verifyOtp`
- Ensure:
- clear branching logic
- correct error messages per mode

---

## OUTPUT FORMAT (STRICT):

1. PATCH (unified diff ONLY)
2. FIX SUMMARY (1 line per task)
3. ASSUMPTIONS (if needed)

PATCH RULES:
- Only changed lines
- No full file dumps
- Format:
--- before
+++ after
@@

---

PRIORITY:
1. State consistency
2. Security (tokens, env)
3. UX stability
4. Performance (caching)

---

IF NO CHANGES:
Return:
NO_CHANGES_REQUIRED