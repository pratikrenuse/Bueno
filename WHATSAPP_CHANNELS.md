# Spain 24/7 WhatsApp channels

One read-only channel per language for owners. A post goes out on each channel every day.
The site reads these links from `whatsapp.js`; change them there and here together.

| Language | Channel |
|---|---|
| English | https://whatsapp.com/channel/0029VbDw27tDJ6Gyifoeqx0Z |
| Norwegian | https://whatsapp.com/channel/0029VbEWWkIKgsNxuHSBSK2s |
| Swedish | https://whatsapp.com/channel/0029VbDa6qR6GcGIMpzX4M0s |
| German | https://whatsapp.com/channel/0029VbEJaT8JkK79IG7nVZ1Y |
| French | https://whatsapp.com/channel/0029VbEKRXM1t90g5DEHe83r |
| Dutch | https://whatsapp.com/channel/0029Vb99fU17T8beeFeOTf3b |

## Where the site shows them

- Home page: the bar at the top, the WhatsApp section (with every language listed) and the footer link.
- Every other owner page (all tools, answers, guides, about, directory): a WhatsApp band above the footer
  (`WhatsAppFollow.jsx`, rendered by `SiteFooter.jsx`), a "WhatsApp channel" link in the footer,
  and a small floating follow button that appears once the reader scrolls and can be closed.
- The estate agent and lawyer pages keep their own WhatsApp groups, not these channels.
