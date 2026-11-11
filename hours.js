// ============================================================
//  OPENING HOURS – edit this file when TU/e changes its hours.
//  Source: https://www.tue.nl/en/our-university/tue-campus/buildings/opening-hours-buildings
// ============================================================

// Shown on the page so visitors know how fresh the data is.
window.HOURS_CHECKED = "11 November 2026";

// weekdays = Monday to Friday, weekend = Saturday and Sunday.
// Write hours as "HH:MM-HH:MM". A closing time after midnight (e.g. "08:00-02:00") is fine.
// Use null when the building is closed in that period.
window.BUILDINGS = [
  { name: "Atlas",        weekdays: "07:30-20:00", weekend: null },
  { name: "Auditorium",   weekdays: "07:30-20:00", weekend: null },
  { name: "Cascade",      weekdays: "07:30-20:00", weekend: null },
  { name: "Ceres",        weekdays: "07:30-20:00", weekend: null },
  { name: "Flux",         weekdays: "07:30-22:00", weekend: "10:00-21:00", note: "Also 10:00–21:00 on exam-period weekends" },
  { name: "Gaslab",       weekdays: "08:00-18:00", weekend: null },
  { name: "Gemini-Noord", weekdays: "07:30-20:00", weekend: null },
  { name: "Gemini-Zuid",  weekdays: null,          weekend: null, note: "Closed due to renovation" },
  { name: "Helix",        weekdays: "07:30-20:00", weekend: null, note: "Campus card holders only (labs)" },
  { name: "Luna",         weekdays: "08:00-02:00", weekend: "10:00-02:00" },
  { name: "Matrix",       weekdays: "07:30-20:00", weekend: null },
  { name: "MetaForum",    weekdays: "07:30-22:00", weekend: "10:00-21:00", note: "Library building" },
  { name: "Momentum",     weekdays: null,          weekend: null, note: "Not freely accessible" },
  { name: "Neuron",       weekdays: "07:30-22:00", weekend: "10:00-21:00" },
  { name: "Pendulum",     weekdays: "07:30-20:00", weekend: null },
  { name: "Qubit",        weekdays: "07:30-20:00", weekend: null },
  { name: "Spectrum",     weekdays: "07:30-20:00", weekend: null },
  { name: "Sports Centre", weekdays: "07:30-23:00", weekend: null, note: "Weekend hours: see the Student Sports Centre website" },
  { name: "Traverse",     weekdays: "07:30-20:00", weekend: null },
  { name: "Vector",       weekdays: "07:30-20:00", weekend: null },
  { name: "Vertigo",      weekdays: "07:30-20:00", weekend: null },
  { name: "Zwarte Doos",  weekdays: "08:30-20:00", weekend: null }
];

// Special days: holidays, Christmas closure, extended exam hours...
// Key = date "YYYY-MM-DD". "all" sets every building; "buildings" overrides specific ones.
// Use null for closed. Examples (remove the // to use them):
window.SPECIAL_DAYS = {
  // "2026-12-25": { label: "Christmas Day", all: null },
  // "2027-01-16": { label: "Exam period", buildings: { "MetaForum": "08:00-21:00" } },
};
