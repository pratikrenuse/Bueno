// WhatsApp for the owners' side of the site.
//
// Owners get a WhatsApp channel (read only updates), one per language. Paste each channel's link
// below as it is created. A language without its own channel yet falls back to the English one.
export const WHATSAPP_CHANNEL_URLS = {
  en: 'https://whatsapp.com/channel/0029VbDw27tDJ6Gyifoeqx0Z',
  no: '',
  sv: '',
  de: '',
  fr: '',
  nl: '',
};
export const whatsappChannel = (locale) => WHATSAPP_CHANNEL_URLS[locale] || WHATSAPP_CHANNEL_URLS.en;

// The professionals' groups, one for estate agents and one for lawyers.
export const WHATSAPP_AGENTS_URL = 'https://chat.whatsapp.com/HSkoRFSDXiQGA7xK7awW7j';
export const WHATSAPP_LAWYERS_URL = '#whatsapp-lawyers';

// Where "Partner with Bueno" on the estate agents' page goes. Swap in the partner page or a
// contact form when there is one.
export const BUENO_PARTNER_URL = 'https://getbueno.com';
