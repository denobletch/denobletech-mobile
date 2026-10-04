# DenobleTech Shop — HNG Lesson 3 mobile app

An Expo Android/iOS companion to the Lesson 2 web shop. The catalog, Google account, cart, checkout, and order history use the **same Supabase project and tables**. A cart change on either device appears on the other after refreshing; the mobile cart also refreshes every five seconds while visible. Checkout creates a demo order through the existing `place_order` database function. No payment is collected.

## What is ready

- Product collection and detail pages, with the shop's artwork and a launch icon
- Google sign-in through the same Supabase Auth provider as the website
- Saved cart, quantity changes, checkout, and order history backed by Supabase
- EAS `preview` Android APK profile for an installable, self-contained phone app
- EAS `development` profile for interactive development with Metro

The included Expo public variables point to the existing DenobleTech Supabase project. These are publishable client settings, **never service role or email-provider keys**. The database's row-level security continues to restrict each user's cart and orders.

## Finish Google sign-in setup

In the **same** Supabase project as the web shop, open **Authentication → URL Configuration → Redirect URLs** and add the exact additional URL:

```text
denobletech://auth/callback
```

Keep the website's existing Site URL and redirect URLs. Google continues to use the Supabase provider callback already configured for the website; do not replace it with the mobile deep link in Google Cloud Console. The mobile app passes this link as `redirectTo` so the browser can return the Supabase session to the installed app.

## Install on a physical Android phone

Download **DenobleTech-Shop-Android-arm64-v1.0.1.apk** onto an ARM64 Android phone and open the download to install it. Version 1.0.1 adds visible labels and hints for Full name, Phone number, Delivery address, and City on the checkout page. It uses the same signing certificate and a higher version code than the previous APK, so install it over the existing app to keep its saved session. The APK contains the JavaScript bundle and does not need Expo Go, Metro, or an Expo account. It supports Android 7.0 or newer. It is signed with a demonstration key; use a private release key for app store publication. The signature and package metadata are verified; the updated checkout screen still needs a phone check.

To build through Expo instead, run these commands from this directory:


```bash
npm ci
npx eas-cli@latest login
npx eas-cli@latest build --platform android --profile preview
```

On first use, EAS may ask to create/link the Expo project and generate Android signing credentials. Choose your own Expo account. When the build finishes, open its install link on the phone and install the APK. The preview profile includes the JavaScript bundle, so it launches from the phone's **DenobleTech Shop** icon without a running computer.

For development instead, run `npx eas-cli@latest build --platform android --profile development`, install that APK, then `npx expo start --dev-client --tunnel` and open the app. A development build needs the Metro server; a preview build is simpler for recording. **Expo Go is not suitable for testing this Google OAuth callback** because it cannot register this app's scheme.

If you need iOS, the `preview` profile can build an internal iOS app, but physical iOS distribution requires Apple signing and device provisioning.

## Record the required demonstration

1. On the website, sign in with Google and add a product to the cart.
2. Start screen recording on the physical phone. Show the **DenobleTech Shop** app icon, launch the installed app, and sign in with the **same Google account**.
3. Open Cart and pull down or tap **Refresh cart** to show the web item on mobile.
4. Add a second product on the phone. Refresh the cart on the website to show the mobile addition.
5. On the phone, enter demo checkout details, place an order, and open Orders. The website's Orders page should show the same order after refreshing.

Use sample delivery details for the recording. Checkout does not take payment or arrange shipment. Lesson 3's guide says confirmation email is not required for this mobile counterpart.

## Checks and maintenance

```bash
npx expo lint
npm run typecheck
npx expo export --platform android
```

The public Supabase values are in `.env.example` and the EAS profiles. A developer can copy `.env.example` to `.env.local` for a local run; `.env.local` is ignored by Git. If the Supabase project changes, update both places. Never add the Supabase service role key or an email API key to a mobile build.

## Group Zedu contribution

The separate group requirement is **exactly one changed word in a Zedu article's body text**, followed by a branch, commit, push, and PR to the team's target branch. Do not change formatting, markup, or unrelated code. The team repository and target branch are not part of this mobile project; use the actual team link before making that edit. Confirm the final deadline from the current official HNG announcement.
