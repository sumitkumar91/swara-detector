/**
 * Indian Classical Music Ragas categorized by time of day (Prahar system)
 */

export const RAGAS_BY_TIME = [
  // 1 AM - 4 AM
  {
    name: "Adana",
    time: "1 AM - 4 AM",
    hourRange: [1, 4],
    mood: "Devotional, playful",
    searchQuery: "Raag Adana classical vocal meditation",
  },
  {
    name: "Darbari Kanada",
    time: "1 AM - 4 AM",
    hourRange: [1, 4],
    mood: "Deep, serious, meditative, devotional",
    searchQuery: "Raag Darbari Kanada late night meditation deep",
  },
  {
    name: "Malkauns",
    time: "1 AM - 4 AM",
    hourRange: [1, 4],
    mood: "Tranquility, romance, devotion",
    searchQuery: "Raag Malkauns midnight meditation deep",
  },

  // 4 AM - 7 AM
  {
    name: "Lalit",
    time: "4 AM - 7 AM",
    hourRange: [4, 7],
    mood: "Serene, devotional, yearning",
    searchQuery: "Raag Lalit pre dawn meditation sitar",
  },

  // 7 AM - 10 AM
  {
    name: "Ahir Bhairav",
    time: "7 AM - 10 AM",
    hourRange: [7, 10],
    mood: "Meditative, devotional",
    searchQuery: "Raag Ahir Bhairav morning meditation sitar",
  },
  {
    name: "Alhaiya Bilawal",
    time: "7 AM - 10 AM",
    hourRange: [7, 10],
    mood: "Serene and uplifting",
    searchQuery: "Raag Alhaiya Bilawal morning classical",
  },
  {
    name: "Bhairav",
    time: "7 AM - 10 AM",
    hourRange: [7, 10],
    mood: "Peaceful, calming, devotional, meditative",
    searchQuery: "Raag Bhairav morning meditation instrumental",
  },
  {
    name: "Deshkar",
    time: "7 AM - 10 AM",
    hourRange: [7, 10],
    mood: "Heroism, strength, courage",
    searchQuery: "Raag Deshkar morning classical meditation",
  },
  {
    name: "Ramkali",
    time: "7 AM - 10 AM",
    hourRange: [7, 10],
    mood: "Soulful, yearning, devotion, pathos",
    searchQuery: "Raag Ramkali morning meditation classical",
  },

  // 10 AM - 1 PM
  {
    name: "Asawari",
    time: "10 AM - 1 PM",
    hourRange: [10, 13],
    mood: "Divine and tranquil, surrender",
    searchQuery: "Raag Asawari late morning meditation classical",
  },
  {
    name: "Jaunpuri",
    time: "10 AM - 1 PM",
    hourRange: [10, 13],
    mood: "Devotion, separation, longing",
    searchQuery: "Raag Jaunpuri late morning meditation vocal",
  },
  {
    name: "Todi",
    time: "10 AM - 1 PM",
    hourRange: [10, 13],
    mood: "Deep, serious, tranquil, sorrowful, devotional",
    searchQuery: "Raag Todi morning meditation sitar",
  },

  // 1 PM - 4 PM
  {
    name: "Bhimpalas",
    time: "1 PM - 4 PM",
    hourRange: [13, 16],
    mood: "Sweet, playful, romance, devotion",
    searchQuery: "Raag Bhimpalasi afternoon vocal meditation",
  },

  // 4 PM - 7 PM
  {
    name: "Champak",
    time: "4 PM - 7 PM",
    hourRange: [16, 19],
    mood: "Romantic, peaceful, gentle loving, devotion",
    searchQuery: "Raag Champak evening meditation classical",
  },

  // 7 PM - 10 PM
  {
    name: "Bhoopali",
    time: "7 PM - 10 PM",
    hourRange: [19, 22],
    mood: "Peace, joy, romance, devotion",
    searchQuery: "Raag Bhoopali flute meditation peaceful evening",
  },
  {
    name: "Chhayanat",
    time: "7 PM - 10 PM",
    hourRange: [19, 22],
    mood: "Adornment, separation in love",
    searchQuery: "Raag Chhayanat Kalyan evening meditation classical",
  },
  {
    name: "Hameer",
    time: "7 PM - 10 PM",
    hourRange: [19, 22],
    mood: "Bravery, courage",
    searchQuery: "Raag Hameer evening classical meditation",
  },
  {
    name: "Hansadhwani",
    time: "7 PM - 10 PM",
    hourRange: [19, 22],
    mood: "Devotion, romance",
    searchQuery: "Raag Hansadhwani evening meditation classical",
  },
  {
    name: "Kamod",
    time: "7 PM - 10 PM",
    hourRange: [19, 22],
    mood: "Beauty, romance, devotion",
    searchQuery: "Raag Kamod evening meditation sitar",
  },
  {
    name: "Kedar",
    time: "7 PM - 10 PM",
    hourRange: [19, 22],
    mood: "Beauty, romance, separation",
    searchQuery: "Raag Kedar evening meditation classical",
  },
  {
    name: "Shuddh Kalyan",
    time: "7 PM - 10 PM",
    hourRange: [19, 22],
    mood: "Happy, peaceful, romantic, devotional",
    searchQuery: "Raag Shuddh Kalyan evening meditation classical",
  },
  {
    name: "Shyam Kalyan",
    time: "7 PM - 10 PM",
    hourRange: [19, 22],
    mood: "Romantic",
    searchQuery: "Raag Shyam Kalyan evening meditation sitar",
  },
  {
    name: "Yaman",
    time: "7 PM - 10 PM",
    hourRange: [19, 22],
    mood: "Happy, romantic, majestic",
    searchQuery: "Raag Yaman evening meditation sitar",
  },

  // 10 PM - 1 AM (wraps midnight)
  {
    name: "Bageshri",
    time: "10 PM - 1 AM",
    hourRange: [22, 1],
    mood: "Romantic",
    searchQuery: "Raag Bageshri night meditation vocal",
  },
  {
    name: "Gaud Malhar",
    time: "10 PM - 1 AM",
    hourRange: [22, 1],
    mood: "Romance, longing, uplifting, joyous",
    searchQuery: "Raag Gaud Malhar night meditation classical",
  },
  {
    name: "Gorakh Kalyan",
    time: "10 PM - 1 AM",
    hourRange: [22, 1],
    mood: "Romantic",
    searchQuery: "Raag Gorakh Kalyan night meditation classical",
  },
  {
    name: "Kafi",
    time: "10 PM - 1 AM",
    hourRange: [22, 1],
    mood: "Shringar (romance)",
    searchQuery: "Raag Kafi night meditation flute",
  },
  {
    name: "Khamaj",
    time: "10 PM - 1 AM",
    hourRange: [22, 1],
    mood: "Shringar (romance)",
    searchQuery: "Raag Khamaj night classical meditation",
  },
  {
    name: "Kirwani",
    time: "10 PM - 1 AM",
    hourRange: [22, 1],
    mood: "Romantic, serious, devotional",
    searchQuery: "Raag Kirwani night meditation classical",
  },
  {
    name: "Puriya",
    time: "10 PM - 1 AM",
    hourRange: [22, 1],
    mood: "Deep, serious, peace and tranquility",
    searchQuery: "Raag Puriya night meditation sitar",
  },
];

export const TIME_SLOTS = [
  { label: "1 AM - 4 AM", hourRange: [1, 4], period: "Late Night / Pre-Dawn" },
  { label: "4 AM - 7 AM", hourRange: [4, 7], period: "Brahma Muhurta / Dawn" },
  { label: "7 AM - 10 AM", hourRange: [7, 10], period: "Early Morning" },
  { label: "10 AM - 1 PM", hourRange: [10, 13], period: "Late Morning / Midday" },
  { label: "1 PM - 4 PM", hourRange: [13, 16], period: "Early Afternoon" },
  { label: "4 PM - 7 PM", hourRange: [16, 19], period: "Late Afternoon / Dusk" },
  { label: "7 PM - 10 PM", hourRange: [19, 22], period: "Early Evening / Night" },
  { label: "10 PM - 1 AM", hourRange: [22, 1], period: "Late Night" },
];

/**
 * Check if a given hour falls within an hour range [start, end]
 * (handles wrapping past midnight e.g. [22, 1])
 */
export function isHourInRange(hour, range) {
  const [start, end] = range;
  if (start < end) {
    return hour >= start && hour < end;
  }
  // Wraps midnight (e.g. 22 to 1)
  return hour >= start || hour < end;
}

/**
 * Get all ragas suitable for a specific 24-hour hour (0-23)
 */
export function getRagasForHour(hour) {
  return RAGAS_BY_TIME.filter((raga) => isHourInRange(hour, raga.hourRange));
}

/**
 * Get ragas suitable for current time
 */
export function getCurrentTimeRagas(date = new Date()) {
  const currentHour = date.getHours();
  const currentSlot = TIME_SLOTS.find((slot) => isHourInRange(currentHour, slot.hourRange));
  const ragas = getRagasForHour(currentHour);

  return {
    hour: currentHour,
    slot: currentSlot || { label: "Current Time", period: "" },
    ragas,
  };
}
