# DenobleTech Shop — HNG Lesson 3 mobile app

An Expo Android/iOS companion to the Lesson 2 web shop. The catalog, Google account, cart, checkout, and order history use the **same Supabase project and tables**. A cart change on either device appears on the other after refreshing; the mobile cart also refreshes every five seconds while visible. Checkout creates a demo order through the existing `place_order` database function. No payment is collected.

## What is ready

- Product collection and detail pages
- Google sign-in through the same Supabase Auth provider as the website
- Saved cart, quantity changes, checkout, and order history backed by Supabase
- EAS `preview` Android APK profile for an installable, self-contained phone app
- EAS `development` profile for interactive development with Metro

The included Expo public variables point to the existing DenobleTech Supabase project. These are publishable client settings, **never service role or email-provider keys**. The database's row-level security continues to restrict each user's cart and orders.

## Google sign-in setup

In the **same** Supabase project as the web shop, add this redirect under **Authentication → URL Configuration → Redirect URLs**:

```text
denobletech://auth/callback
```

Google continues to use the Supabase provider callback already configured for the website. The mobile app passes the deep link as `redirectTo` so the browser can return the Supabase session to the installed app.

## Local setup

```bash
npm install
npx expo lint
npm run typecheck
npx expo start
```

Copy `.env.example` to `.env.local` for local development. Never add the Supabase service-role key or an email API key to the mobile build.

## Android build

The tested HNG build is **DenobleTech-Shop-Android-arm64-v1.0.1.apk**. It includes visible labels and hints for Full name, Phone number, Delivery address, and City on checkout.

To build through EAS:

```bash
npm install
npx eas-cli@latest login
npx eas-cli@latest build --platform android --profile preview
```

The preview build is installable and does not require Expo Go or a running Metro server. Expo Go is not suitable for testing this app's custom Google OAuth callback.

## Required demonstration

1. On the website, sign in with Google and add a product to the cart.
2. Start recording on a physical Android phone, show the DenobleTech Shop app icon, launch the app, and sign in with the same Google account.
3. Open Cart and refresh it to show the web item on mobile.
4. Add a second product on mobile, then refresh the website cart to show the mobile addition.
5. On the phone, enter demo checkout details, place an order, and open Orders. Refresh the website Orders page to show the same order.

Checkout is a demo: no payment is collected and no shipment is arranged.

## Group Zedu contribution

The separate group requirement is exactly one changed word in a Zedu article's body text, followed by a branch, commit, push, and PR to the team's target branch. Do not change formatting, markup, or unrelated code.
