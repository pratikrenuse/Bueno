# Social posting tool

Page: `/internal-social` (internal password). Function: `api/social.js`. Tables: `social_accounts`, `social_posts`.

One place to post to several Instagram accounts, Facebook Pages and LinkedIn profiles. Each
account is connected once by its owner. Approved posts are published by the site itself, at
the time set on each post, through the platforms' official APIs.

It is separate from every other tool. It imports nothing from the LinkedIn deck, the Facebook
deck, the news, the newsletter or the reels, and touches none of their tables.

## What it does and does not do

| Platform | Posts to | Formats |
|---|---|---|
| Instagram | Creator or Business accounts | One photo, a carousel, or a reel |
| Facebook | Pages | Text, photos, or one video |
| LinkedIn | Personal profiles | Text and photos |

Not possible through any official API, so not in the tool: Facebook personal profiles,
Facebook groups, WhatsApp channels, Instagram personal (non-professional) accounts, Instagram
music and stickers. LinkedIn video and LinkedIn company pages are not built yet.

It only publishes posts. It never logs in with a password, and never likes, follows, comments
or messages. That is what keeps it inside each platform's rules.

## How a post travels

1. It is added: on the page (arrives approved, because the person adding it is the approver)
   or from outside (arrives `pending` and waits for Approve on the page).
2. Three times a day (about 06:40, 11:40 and 16:40 UTC, each within the hour) the run
   publishes every approved post whose time has come, at most one per account per run.
3. The result is recorded on the post: published with its link, or the reason it did not go.

## The safeguards

- Only `approved` posts are published.
- A post is claimed in the database before anything is sent, so two runs cannot both send it.
- If the final publish call gets no clear answer, the post is parked as "Please check" and is
  never retried by itself. On the page: "It is live" or "Send it again".
- A clear refusal (wrong image shape, for example) is retried on the next two runs, then the
  post stops as "Failed" and an email goes out with the reason.
- Instagram tokens renew themselves. Facebook Page tokens do not expire. LinkedIn access lasts
  60 days: an email goes out a week before, and the owner clicks Connect again.
- If a platform refuses a token, the account is marked "Connect again", its posts wait, and
  an email goes out.
- Emails go to Pratik only (`SOCIAL_ALERT_TO` overrides the address). Nothing is emailed when
  everything went fine.

## One-time setup

These three steps need a login to Meta and LinkedIn as the owner of the developer account,
which is why they cannot be done from code.

Open `/internal-social`, press "Run health check" and copy the redirect address it shows. It
is `https://<the site address you use>/api/social/callback`. Register exactly that address in
each app below.

**Meta app (Instagram and Facebook), at developers.facebook.com**

1. Create an app (type Business).
2. Add the product "Instagram", choose "API setup with Instagram login", add the redirect
   address under Business login settings. Copy the Instagram app ID and Instagram app secret
   (these are not the same as the Facebook app ID and secret).
3. Add the product "Facebook Login for Business", add the same redirect address under Valid
   OAuth Redirect URIs. Copy the app ID and app secret from App settings, Basic.
4. Every Instagram account has to be a Creator or Business account (Instagram app, Settings,
   Account type). While the Meta app has not been through App Review, each Instagram account
   also has to be added under App roles as an Instagram tester and accept the invite in its
   Instagram settings. After App Review for `instagram_business_content_publish`, any
   professional account can connect without that step.
5. Set the app to Live once the redirect addresses and a privacy policy address are filled in.
   Posts made to a Page by an app that is still in development mode may be visible only to
   people who have a role on the app.

**LinkedIn app, at linkedin.com/developers**

1. Create an app (it has to be linked to a LinkedIn company page, any page you administer).
2. Under Products, add "Share on LinkedIn" and "Sign In with LinkedIn using OpenID Connect".
   Neither needs a review.
3. Under Auth, add the redirect address. Copy the client ID and client secret.

**Vercel environment variables** (then redeploy, because new variables only apply to a new
deployment):

```
INSTAGRAM_APP_ID
INSTAGRAM_APP_SECRET
FACEBOOK_APP_ID
FACEBOOK_APP_SECRET
LINKEDIN_CLIENT_ID
LINKEDIN_CLIENT_SECRET
```

A platform whose two variables are missing simply shows as "not set up yet" on the page. The
others work without it.

**Tables.** `studio/social_schema.sql` creates the two tables. It is safe to run twice.

## Connecting an account

Log in to the account in the browser, open `/internal-social`, press Connect, click Allow.
For an account that belongs to someone else, press "Copy a link for someone else" and send
them the link. It works for three days and does not need the internal password.

## Adding posts from outside the page

`POST /api/social?action=create` with the `x-passcode` header:

```json
{
  "posts": [
    {
      "account_ids": ["<account id>"],
      "caption": "The text.",
      "media": [{ "url": "https://.../photo.jpg", "type": "image" }],
      "scheduled_at": "2026-12-01T08:00:00Z"
    }
  ]
}
```

Posts added this way arrive `pending`. They can also be inserted straight into `social_posts`
(account_id, caption, media, scheduled_at). Either way they wait for Approve on the page.

## Checks

- `node social.test.mjs` runs the whole flow against mocked platforms.
- `GET /api/social?action=health` (password) shows settings, tables and the redirect address.
- `GET /api/social?action=run&dry=1` (password) lists what the next run would publish and
  sends nothing.

## Not yet proven

Everything is tested against mocked platforms, following the platforms' published
documentation. The first real post on each platform is the real test. Do it with one account
and one post before queueing many.
