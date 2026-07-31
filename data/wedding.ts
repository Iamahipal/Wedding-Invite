/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║  ★ SINGLE SOURCE OF TRUTH ★                                               ║
 * ║                                                                           ║
 * ║  Every name, date, venue, time and line of copy on the site comes from    ║
 * ║  this file. To make the invitation real, you only ever edit here.         ║
 * ║                                                                           ║
 * ║  Anything marked  // TODO  is a placeholder awaiting your real details.   ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 */

export type Attendance = 'yes' | 'no'

export interface WeddingEvent {
  /** Stable id — also used as the ScrollTrigger / React key. */
  id: string
  /** Display name in English. */
  name: string
  /** Devanagari rendering, shown as a smaller accent line. */
  nameHi: string
  /** ISO 8601 *with* the India offset so calendar exports are exact. */
  start: string
  /** ISO 8601 end. Used for the .ics duration. */
  end: string
  /** Human-friendly time, e.g. "4:00 PM onwards". */
  displayTime: string
  venue: string
  address: string
  dressCode: string
  /** One or two lines explaining the ritual — this is what makes the site warm. */
  description: string
  /** Which family tradition the ritual leans toward. Drives the accent colour. */
  tradition: 'marwar' | 'awadh' | 'both'
}

export interface Venue {
  name: string
  address: string
  /** Google Maps link — replace with the real pin. */
  mapUrl: string
}

// ─────────────────────────────────────────────────────────────────────────────
//  THE COUPLE
// ─────────────────────────────────────────────────────────────────────────────

export const couple = {
  groom: {
    firstName: 'Mahipal',
    fullName: 'Mahipal Shekhawat',
    nameHi: 'महिपाल',
    origin: 'Rajasthan',
    originHi: 'राजस्थान',
    region: 'Marwar',
    // TODO: replace with the real names of the groom's parents
    parents: 'Son of Shri & Smt. Shekhawat',
  },
  bride: {
    firstName: 'Niharika',
    fullName: 'Niharika Srivastava',
    nameHi: 'निहारिका',
    origin: 'Uttar Pradesh',
    originHi: 'उत्तर प्रदेश',
    region: 'Awadh',
    // TODO: replace with the real names of the bride's parents
    parents: 'Daughter of Shri & Smt. Srivastava',
  },
  /** Used in the URL-personalised greeting and the share card. */
  hashtag: '#MahipalWedsNiharika',
} as const

// ─────────────────────────────────────────────────────────────────────────────
//  THE HEADLINE DATE  (the pheras — what the countdown counts down to)
// ─────────────────────────────────────────────────────────────────────────────

/** TODO: set the real muhurat. ISO 8601 with India's +05:30 offset. */
export const weddingDate = '2026-11-27T21:30:00+05:30'

export const weddingDateDisplay = {
  full: '27th November 2026',
  short: '27.11.2026',
  day: 'Friday',
  city: 'Jaipur, Rajasthan',
}

// ─────────────────────────────────────────────────────────────────────────────
//  COPY
// ─────────────────────────────────────────────────────────────────────────────

export const copy = {
  /** Traditional invocation opening a Hindu wedding invitation. */
  invocation: '॥ श्री गणेशाय नमः ॥',
  invocationTranslit: 'Shri Ganeshaya Namah',

  scrollCue: 'Scroll to begin',

  invitation: {
    eyebrow: 'Together with our families',
    body: 'We invite you to share in our joy as we get married, and to bless the beginning of a life we will build together.',
  },

  twoWorlds: {
    eyebrow: 'Two states, one thread',
    title: 'Marwar meets Awadh',
    body: 'From the sandstone courtyards of Rajasthan to the chikankari evenings of Uttar Pradesh — two families, two histories, and one knot that ties them together.',
  },

  timeline: {
    eyebrow: 'The celebrations',
    title: 'Four days of festivity',
    body: 'Every ritual has its own hour, its own colour, and its own reason to dance.',
  },

  gallery: {
    eyebrow: 'Us, so far',
    title: 'A few of our favourite moments',
  },

  rsvp: {
    eyebrow: 'Will you be there?',
    title: 'Kindly RSVP',
    body: 'Your presence is the blessing we are asking for. Please let us know by the 1st of November so we can keep a seat — and a plate — ready for you.',
    deadline: '1st November 2026',
  },

  footer: {
    blessing: 'With the blessings of the Shekhawat and Srivastava families',
    signoff: 'We cannot wait to celebrate with you.',
  },
} as const

// ─────────────────────────────────────────────────────────────────────────────
//  VENUES
// ─────────────────────────────────────────────────────────────────────────────

// TODO: replace all three with the real venues and Google Maps pins.
export const venues: Record<string, Venue> = {
  haveli: {
    name: 'Samode Haveli',
    address: 'Gangapole, Jaipur, Rajasthan 302002',
    mapUrl: 'https://maps.google.com/?q=Samode+Haveli+Jaipur',
  },
  gardens: {
    name: 'The Rambagh Lawns',
    address: 'Bhawani Singh Road, Jaipur, Rajasthan 302005',
    mapUrl: 'https://maps.google.com/?q=Rambagh+Palace+Jaipur',
  },
  banquet: {
    name: 'Jai Mahal Banquet',
    address: 'Jacob Road, Civil Lines, Jaipur, Rajasthan 302006',
    mapUrl: 'https://maps.google.com/?q=Jai+Mahal+Palace+Jaipur',
  },
}

// ─────────────────────────────────────────────────────────────────────────────
//  THE ITINERARY
// ─────────────────────────────────────────────────────────────────────────────

export const events: WeddingEvent[] = [
  {
    id: 'mehendi',
    name: 'Mehendi',
    nameHi: 'मेहंदी',
    start: '2026-11-25T16:00:00+05:30',
    end: '2026-11-25T20:00:00+05:30',
    displayTime: '4:00 PM onwards',
    venue: venues.haveli.name,
    address: venues.haveli.address,
    dressCode: 'Fresh greens & mustard yellow',
    description:
      'Henna, folk songs and endless chai in the courtyard. The bride’s hands are painted with the groom’s initials hidden somewhere in the design — finding them is his first test.',
    tradition: 'awadh',
  },
  {
    id: 'haldi',
    name: 'Haldi',
    nameHi: 'हल्दी',
    start: '2026-11-26T11:00:00+05:30',
    end: '2026-11-26T14:00:00+05:30',
    displayTime: '11:00 AM onwards',
    venue: venues.haveli.name,
    address: venues.haveli.address,
    dressCode: 'Anything you don’t mind turning yellow',
    description:
      'Turmeric, sandalwood and rosewater, pressed onto the couple by everyone who loves them. Come prepared to be covered in it.',
    tradition: 'both',
  },
  {
    id: 'sangeet',
    name: 'Sangeet',
    nameHi: 'संगीत',
    start: '2026-11-26T19:30:00+05:30',
    end: '2026-11-27T00:00:00+05:30',
    displayTime: '7:30 PM onwards',
    venue: venues.gardens.name,
    address: venues.gardens.address,
    dressCode: 'Indian festive — jewel tones',
    description:
      'The night both families compete on the dance floor and pretend it isn’t a competition. Rajasthani ghoomar meets Lucknowi thumri, and nobody sits down.',
    tradition: 'both',
  },
  {
    id: 'baraat',
    name: 'Baraat & Varmala',
    nameHi: 'बारात एवं वरमाला',
    start: '2026-11-27T18:00:00+05:30',
    end: '2026-11-27T20:30:00+05:30',
    displayTime: '6:00 PM onwards',
    venue: venues.gardens.name,
    address: venues.gardens.address,
    dressCode: 'Traditional Indian formal',
    description:
      'The groom arrives with a band, a horse and roughly two hundred dancing relatives. The couple exchange garlands — and everybody tries to lift them higher.',
    tradition: 'marwar',
  },
  {
    id: 'pheras',
    name: 'Pheras',
    nameHi: 'फेरे',
    start: '2026-11-27T21:30:00+05:30',
    end: '2026-11-28T00:30:00+05:30',
    displayTime: '9:30 PM — the muhurat',
    venue: venues.gardens.name,
    address: venues.gardens.address,
    dressCode: 'Traditional Indian formal',
    description:
      'Seven steps around the sacred fire, seven promises spoken aloud. This is the moment the whole week has been walking toward.',
    tradition: 'both',
  },
  {
    id: 'reception',
    name: 'Reception',
    nameHi: 'प्रीतिभोज',
    start: '2026-11-28T19:00:00+05:30',
    end: '2026-11-28T23:30:00+05:30',
    displayTime: '7:00 PM onwards',
    venue: venues.banquet.name,
    address: venues.banquet.address,
    dressCode: 'Cocktail / Indo-western',
    description:
      'Dinner, speeches, and the first evening of being married. Come hungry and stay late.',
    tradition: 'awadh',
  },
]

// ─────────────────────────────────────────────────────────────────────────────
//  GALLERY
//  ★ SWAP: drop your photos into /public/gallery/ and update src + alt.
//    Landscape 3:2 crops at ~1600px wide look best. 6–10 images is the sweet
//    spot; the 3D arc is laid out from this array's length automatically.
// ─────────────────────────────────────────────────────────────────────────────

export interface GalleryItem {
  src: string
  alt: string
  caption: string
}

export const gallery: GalleryItem[] = [
  // TODO: replace with real photographs, and write real alt text — the alt is
  // what a guest using a screen reader gets instead of the picture.
  { src: '/gallery/01.png', alt: 'Placeholder image', caption: 'Where it started' },
  { src: '/gallery/02.png', alt: 'Placeholder image', caption: 'Jaipur, winter' },
  { src: '/gallery/03.png', alt: 'Placeholder image', caption: 'The first trip' },
  { src: '/gallery/04.png', alt: 'Placeholder image', caption: 'Lucknow evenings' },
  { src: '/gallery/05.png', alt: 'Placeholder image', caption: 'She said yes' },
  { src: '/gallery/06.png', alt: 'Placeholder image', caption: 'And here we are' },
]

// ─────────────────────────────────────────────────────────────────────────────
//  DRESS CODE PALETTE (rendered as swatches on the details card)
// ─────────────────────────────────────────────────────────────────────────────

export const dressCodePalette = [
  { name: 'Marigold', hex: '#E8A33D' },
  { name: 'Jodhpur Blue', hex: '#2B4C7E' },
  { name: 'Rose Gold', hex: '#C98B7A' },
  { name: 'Chikankari Ivory', hex: '#F5EFE3' },
  { name: 'Deep Maroon', hex: '#6B2637' },
]

// ─────────────────────────────────────────────────────────────────────────────
//  CONTACT — shown as the fallback if the RSVP endpoint is unreachable
// ─────────────────────────────────────────────────────────────────────────────

export const contact = {
  // TODO: real numbers. Used for the "WhatsApp us instead" fallback link.
  whatsapp: '+919999999999',
  whatsappDisplay: '+91 99999 99999',
  email: 'rsvp@example.com',
}
