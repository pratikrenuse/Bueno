// WhatsApp for the owners' side of the site.
//
// Owners get a WhatsApp channel (read only updates), one per language. A new post goes out on
// every channel every day, so the site points owners at the channel in their own language.
// There is one channel for each of the six site languages. The same links are kept in
// WHATSAPP_CHANNELS.md in the repo root.
export const WHATSAPP_CHANNEL_URLS = {
  en: 'https://whatsapp.com/channel/0029VbDw27tDJ6Gyifoeqx0Z',
  no: 'https://whatsapp.com/channel/0029VbEWWkIKgsNxuHSBSK2s',
  sv: 'https://whatsapp.com/channel/0029VbDa6qR6GcGIMpzX4M0s',
  de: 'https://whatsapp.com/channel/0029VbEJaT8JkK79IG7nVZ1Y',
  fr: 'https://whatsapp.com/channel/0029VbEKRXM1t90g5DEHe83r',
  nl: 'https://whatsapp.com/channel/0029Vb99fU17T8beeFeOTf3b',
};
export const whatsappChannel = (locale) => WHATSAPP_CHANNEL_URLS[locale] || WHATSAPP_CHANNEL_URLS.en;

// Every channel that exists, in the order they are listed on the site, named in its own language.
export const WHATSAPP_CHANNEL_LIST = [
  { code: 'en', label: 'English' },
  { code: 'no', label: 'Norsk' },
  { code: 'sv', label: 'Svenska' },
  { code: 'de', label: 'Deutsch' },
  { code: 'fr', label: 'Français' },
  { code: 'nl', label: 'Nederlands' },
].filter(c => WHATSAPP_CHANNEL_URLS[c.code]);

// The line that introduces the other languages, in the reader's language.
export const WHATSAPP_OTHER_LANGS = {
  en: 'The channel is also in these languages:',
  no: 'Kanalen finnes også på disse språkene:',
  sv: 'Kanalen finns också på de här språken:',
  de: 'Den Kanal gibt es auch in diesen Sprachen:',
  fr: 'La chaîne existe aussi dans ces langues :',
  nl: 'Het kanaal is er ook in deze talen:',
};

// The professionals' groups, one for estate agents and one for lawyers.
export const WHATSAPP_AGENTS_URL = 'https://chat.whatsapp.com/HSkoRFSDXiQGA7xK7awW7j';
export const WHATSAPP_LAWYERS_URL = '#whatsapp-lawyers';

// Where "Partner with Bueno" on the estate agents' page goes. Swap in the partner page or a
// contact form when there is one.
export const BUENO_PARTNER_URL = 'https://getbueno.com';
