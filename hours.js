// ============================================================
//  OPENING HOURS – edit this file when TU/e changes its hours.
//  Source: https://www.tue.nl/en/our-university/tue-campus/buildings/opening-hours-buildings
// ============================================================

// Shown on the page so visitors know how fresh the data is.
window.HOURS_CHECKED = "11 November 2026";

// weekdays = Monday to Friday, weekend = Saturday and Sunday.
// Write hours as "HH:MM-HH:MM". A closing time after midnight (e.g. "08:00-02:00") is fine.
// Use null when the building is closed in that period.
// note = English note, noteNl = Dutch note (for the Dutch pages). Special days: label and labelNl.
// Different hours on Saturday and Sunday? Add saturday: "..." and/or sunday: "..." (they win over weekend).
// Optional: mapQuery: "..." to change what the map link searches for.
window.BUILDINGS = [
  { name: "Atlas",        weekdays: "07:30-20:00", weekend: null },
  { name: "Auditorium",   weekdays: "07:30-20:00", weekend: null },
  { name: "Cascade",      weekdays: "07:30-20:00", weekend: null },
  { name: "Ceres",        weekdays: "07:30-20:00", weekend: null },
  { name: "Flux", study: true,         weekdays: "07:30-22:00", weekend: "10:00-21:00", note: "Also 10:00–21:00 on exam-period weekends", noteNl: "Ook 10:00–21:00 in tentamenweekenden" },
  { name: "Gaslab",       weekdays: "08:00-18:00", weekend: null },
  { name: "Gemini-Noord", weekdays: "07:30-20:00", weekend: null },
  { name: "Gemini-Zuid",  weekdays: null,          weekend: null, note: "Closed due to renovation", noteNl: "Gesloten wegens renovatie" },
  { name: "Helix",        weekdays: "07:30-20:00", weekend: null, note: "Campus card holders only (labs)", noteNl: "Alleen met campuskaart (labs)" },
  { name: "Luna",         weekdays: "08:00-02:00", weekend: "10:00-02:00" },
  { name: "Matrix",       weekdays: "07:30-20:00", weekend: null },
  { name: "MetaForum", study: true,    weekdays: "07:30-22:00", weekend: "10:00-21:00", note: "Library building", noteNl: "Gebouw van de bibliotheek" },
  { name: "Momentum",     weekdays: null,          weekend: null, note: "Not freely accessible", noteNl: "Niet vrij toegankelijk" },
  { name: "Neuron", study: true,       weekdays: "07:30-22:00", weekend: "10:00-21:00" },
  { name: "Pendulum",     weekdays: "07:30-20:00", weekend: null },
  { name: "Qubit",        weekdays: "07:30-20:00", weekend: null },
  { name: "Spectrum",     weekdays: "07:30-20:00", weekend: null },
  { name: "Traverse",     weekdays: "07:30-20:00", weekend: null },
  { name: "Vector",       weekdays: "07:30-20:00", weekend: null },
  { name: "Vertigo",      weekdays: "07:30-20:00", weekend: null },
  { name: "Zwarte Doos",  weekdays: "08:30-20:00", weekend: null }
];

// Other services students often need.
window.SERVICES = [
  { name: "Library", building: "MetaForum", weekdays: "08:00-22:00", weekend: "10:00-21:00",
    mapQuery: "TU/e Library MetaForum Eindhoven",
    note: "TU/e ID card needed during exam weeks", noteNl: "TU/e-kaart nodig in tentamenweken" },
  // Source: https://ssceindhoven.tue.nl (opening hours SSC)
  { name: "Student Sports Centre", building: "Sports Centre", weekdays: "07:30-00:00", saturday: "08:30-21:00", sunday: "09:00-17:00",
    mapQuery: "Student Sports Centre Eindhoven", note: "Exercising until 23:00 on weekdays", noteNl: "Sporten tot 23:00 op doordeweekse dagen" }
];

// Places to eat and drink. Same format as the buildings.
// Source: https://www.tue.nl/en/our-university/about-the-university/facilities/catering
// (TU/e lists one set of hours per outlet; weekend opening is not listed, so weekend = null.)
window.FOOD = [
  { name: "Coffee&Co",              building: "Atlas",     weekdays: "09:00-15:00", weekend: null },
  { name: "Brownies&Downies",       building: "Atlas",     weekdays: "09:00-16:00", weekend: null },
  { name: "Food City",              building: "Atlas",     weekdays: "11:30-13:30", weekend: null, note: "Hot lunch", noteNl: "Warme lunch" },
  { name: "MetaForum canteen",      building: "MetaForum", weekdays: "09:00-15:00", weekend: null },
  { name: "Vertigo canteen",        building: "Vertigo",   weekdays: "09:00-15:00", weekend: null },
  { name: "Helix canteen",          building: "Helix",     weekdays: "10:00-14:00", weekend: null },
  { name: "Gemini canteen",         building: "Gemini",    weekdays: "11:30-13:30", weekend: null },
  { name: "Flux canteen",           building: "Flux",      weekdays: "10:00-14:00", weekend: null },
  { name: "Neuron canteen",         building: "Neuron",    weekdays: "10:00-14:00", weekend: null },
  { name: "Subway",                 building: "",          weekdays: "10:00-15:00", weekend: null, mapQuery: "Subway TU Eindhoven" },
  { name: "Hubble Community Café",  building: "",          weekdays: "10:30-02:00", weekend: "10:30-02:00", note: "Open every day, also in the evening", noteNl: "Elke dag open, ook 's avonds", mapQuery: "Hubble Community Cafe Eindhoven" },
  { name: "Student Sports Café",    building: "Sports Centre", weekdays: null, weekend: null, unknown: true, note: "Open 7 days a week; hours change weekly (see the SSC website)", noteNl: "7 dagen per week open; tijden wisselen per week (zie de SSC-website)", mapQuery: "Student Sports Centre Eindhoven" }
];

// Special days: holidays, Christmas closure, extended exam hours...
// Key = date "YYYY-MM-DD". "all" sets every building AND food place; "buildings" overrides
// specific ones by name (food names work here too, e.g. "Food City": "11:30-19:00").
// Special days within the next 2 weeks are announced in a banner at the top of the site.
// Use null for closed. Examples (remove the // to use them):
window.SPECIAL_DAYS = {
  // Library Christmas closure, source: https://www.tue.nl/library
  "2026-12-24": { label: "Christmas Eve (library)", labelNl: "Kerstavond (bibliotheek)", buildings: { "Library": "08:00-16:00" } },
  "2026-12-25": { label: "Christmas closure (library)", labelNl: "Kerstsluiting (bibliotheek)", buildings: { "Library": null } },
  "2026-12-26": { label: "Christmas closure (library)", labelNl: "Kerstsluiting (bibliotheek)", buildings: { "Library": null } },
  "2026-12-27": { label: "Christmas closure (library)", labelNl: "Kerstsluiting (bibliotheek)", buildings: { "Library": null } },
  "2026-12-28": { label: "Christmas closure (library)", labelNl: "Kerstsluiting (bibliotheek)", buildings: { "Library": null } },
  "2026-12-29": { label: "Christmas closure (library)", labelNl: "Kerstsluiting (bibliotheek)", buildings: { "Library": null } },
  "2026-12-30": { label: "Christmas closure (library)", labelNl: "Kerstsluiting (bibliotheek)", buildings: { "Library": null } },
  "2026-12-31": { label: "Christmas closure (library)", labelNl: "Kerstsluiting (bibliotheek)", buildings: { "Library": null } },
  "2027-01-01": { label: "Christmas closure (library)", labelNl: "Kerstsluiting (bibliotheek)", buildings: { "Library": null } },
  "2027-01-02": { label: "Christmas closure (library)", labelNl: "Kerstsluiting (bibliotheek)", buildings: { "Library": null } },
  // "2026-12-25": { label: "Christmas Day", all: null },
  // "2027-01-16": { label: "Exam period", buildings: { "MetaForum": "08:00-21:00" } },
};
