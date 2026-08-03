# Talk — setup for Friday

This folder is a complete Vercel project: a static `index.html` app plus one
serverless function (`api/send-feedback.js`) that emails feedback to you via
Resend, silently, without opening a mail app.

## One-time setup (takes about 10 minutes)

1. **Create a Resend account** at resend.com (free tier: 3,000 emails/month,
   100/day — plenty for testing).
2. In the Resend dashboard, go to **API Keys** and create one. Copy it.
3. **Push this folder to a new GitHub repo.**
4. **Import that repo into Vercel** (vercel.com → Add New → Project → pick the repo).
5. Before the first deploy, add two **Environment Variables** in the Vercel
   project settings:
   - `RESEND_API_KEY` = the key you copied from Resend
   - `HOST_EMAIL` = the email address feedback should go to (defaults to
     karlvincev.kvv@gmail.com if you skip this)
6. Deploy. Vercel will give you a live URL like `https://talk-app-xyz.vercel.app`.
7. Open that URL on your phone at the event instead of the local file.

## Why `onboarding@resend.dev` as the sender

Resend lets you send from their shared `onboarding@resend.dev` address with
zero domain setup, as long as the recipient (`HOST_EMAIL`) is the same email
you used to sign up for Resend. That's exactly your case — you're emailing
yourself — so you can skip domain verification entirely for this test. If you
ever want to send to other people or use your own "from" address, you'd add
and verify a domain in Resend's dashboard.

## What still uses tokens vs. what doesn't

- Conversation translation and feedback translation: uses Claude, costs tokens.
- Everything else (UI text, the email itself): pure code, zero tokens,
  whether it goes through Resend or falls back to mailto.

## If something goes wrong

- If the API route isn't deployed yet (e.g. you're just opening `index.html`
  directly), the app automatically falls back to the old `mailto:` behavior,
  so testing still works even before you finish this setup.
- If Resend returns an error (bad API key, unverified recipient, etc.), check
  the function logs under your Vercel project's "Deployments" tab.
