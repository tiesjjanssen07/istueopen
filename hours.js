// opening hours, from https://www.tue.nl/en/our-university/tue-campus/buildings/opening-hours-buildings

// date I last checked the hours (YYYY-MM-DD)
window.HOURS_CHECKED = "2026-11-11";

// weekdays = mon-fri, weekend = sat+sun, null = closed
// saturday/sunday can be set separately if they differ
// note = english, noteNl = dutch
// mapQuery = what google maps should search for (optional)
window.BUILDINGS = [
  { name: "Atlas",        weekdays: "07:30-20:00", weekend: null },
  { name: "Auditorium",   weekdays: "07:30-20:00", weekend: null },
  { name: "Cascade",      weekdays: "07:30-20:00", weekend: null },
  { name: "Ceres",        weekdays: "07:30-20:00", weekend: null },
  { name: "Flux", study: true,         weekdays: "07:30-22:00", weekend: null, note: "Weekends 10:00–21:00 only during exam periods", noteNl: "Weekend 10:00–21:00 alleen in tentamenperiodes" },
  { name: "Gaslab",       weekdays: "08:00-18:00", weekend: null },
  { name: "Gemini-Noord", weekdays: "07:30-20:00", weekend: null },
  { name: "Gemini-Zuid",  weekdays: null,          weekend: null, note: "Closed due to renovation", noteNl: "Gesloten wegens renovatie" },
  { name: "Helix",        weekdays: "07:30-20:00", weekend: null, note: "Campus card holders only (labs)", noteNl: "Alleen met campuskaart (labs)" },
  { name: "Luna",         weekdays: "08:00-02:00", weekend: "10:00-02:00" },
  { name: "Matrix",       weekdays: "07:30-20:00", weekend: null },
  { name: "MetaForum", study: true,    weekdays: "07:30-22:00", weekend: "10:00-21:00", note: "The library is here", noteNl: "Hier zit de bibliotheek" },
  { name: "Momentum",     weekdays: null,          weekend: null, note: "Not freely accessible", noteNl: "Niet vrij toegankelijk" },
  { name: "Neuron", study: true,       weekdays: "07:30-22:00", weekend: null, note: "Weekends 10:00–21:00 only during exam periods", noteNl: "Weekend 10:00–21:00 alleen in tentamenperiodes" },
  { name: "Pendulum",     weekdays: "07:30-20:00", weekend: null },
  { name: "Qubit",        weekdays: "07:30-20:00", weekend: null },
  { name: "Spectrum",     weekdays: "07:30-20:00", weekend: null },
  { name: "Traverse",     weekdays: "07:30-20:00", weekend: null },
  { name: "Vector",       weekdays: "07:30-20:00", weekend: null },
  { name: "Vertigo",      weekdays: "07:30-20:00", weekend: null },
  { name: "Zwarte Doos",  weekdays: "08:30-20:00", weekend: null }
];

// other services
window.SERVICES = [
  { name: "Library", building: "MetaForum", weekdays: "08:00-22:00", weekend: "10:00-21:00",
    mapQuery: "TU/e Library MetaForum Eindhoven",
    note: "TU/e ID card needed during exam weeks", noteNl: "TU/e-kaart nodig in tentamenweken" },
  // from https://ssceindhoven.tue.nl (faq)
  { name: "Student Sports Centre", building: "Sports Centre", weekdays: "07:30-00:00", saturday: "08:30-21:00", sunday: "09:00-17:00",
    mapQuery: "Student Sports Centre Eindhoven", note: "Exercising until 23:00 on weekdays", noteNl: "Sporten tot 23:00 op doordeweekse dagen" }
];

// food, from https://www.tue.nl/en/our-university/about-the-university/facilities/catering
// tue doesn't list weekend hours for the canteens
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
  { name: "Subway",                 building: "Auditorium",          weekdays: "10:00-15:00", weekend: null, mapQuery: "Subway TU Eindhoven" },
  { name: "Hubble Community Café",  building: "",          weekdays: "10:30-02:00", weekend: "10:30-02:00", note: "Open every day, also in the evening", noteNl: "Elke dag open, ook 's avonds", mapQuery: "Hubble Community Cafe Eindhoven" },
  { name: "Student Sports Café",    building: "Sports Centre", weekdays: null, weekend: null, unknown: true, note: "Open 7 days a week; hours change weekly (see the SSC website)", noteNl: "7 dagen per week open; tijden wisselen per week (zie de SSC-website)", mapQuery: "Student Sports Centre Eindhoven" }
];

// days that show a "hours may be different" warning
// public holidays are added automatically (see open.js), these are extra.
// "MM-DD" = every year, "YYYY-MM-DD" = only that year
window.WARNING_DAYS = {
  "12-24": { name: "Christmas Eve", nameNl: "kerstavond" },
  "12-27": { name: "the Christmas break", nameNl: "kerstvakantie" },
  "12-28": { name: "the Christmas break", nameNl: "kerstvakantie" },
  "12-29": { name: "the Christmas break", nameNl: "kerstvakantie" },
  "12-30": { name: "the Christmas break", nameNl: "kerstvakantie" },
  "12-31": { name: "the Christmas break", nameNl: "kerstvakantie" }
};

// bridge days from the academic calendar 2026-2027
window.WARNING_DAYS["2027-04-26"] = { name: "a TU/e bridge day", nameNl: "een brugdag van de TU/e" };
window.WARNING_DAYS["2027-05-07"] = { name: "a TU/e bridge day", nameNl: "een brugdag van de TU/e" };

// exam periods from the academic calendar 2026-2027 (add new ones every summer)
window.EXAM_PERIODS = [
  { start: "2026-10-26", end: "2026-11-07" },  // Q1
  { start: "2027-01-18", end: "2027-01-30" },  // Q2
  { start: "2027-04-05", end: "2027-04-17" },  // Q3
  { start: "2027-06-21", end: "2027-07-03" },  // Q4
  { start: "2027-08-16", end: "2027-08-21" }   // interim
];

// for the rain forecast
window.CAMPUS = { lat: 51.4478, lon: 5.4900 };

// days where the exact hours are known (replaces the warning for that day)
// all: null = everything closed, closeAt: "16:00" = everything closes early,
// buildings: { name: hours } for single places ("?" = unknown)
window.SPECIAL_DAYS = {
  // "2027-01-23": { label: "Exam period", labelNl: "Tentamenperiode", buildings: { "Flux": "10:00-21:00", "Neuron": "10:00-21:00" } },
  // "2026-12-25": { label: "Christmas closure", labelNl: "Kerstsluiting", all: null },
};
