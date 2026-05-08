// constants/bikes.ts

export const BIKES = {
  SUPERSPORT: {
    name: "סופר-ספורט (רכינה קדימה)",
    handlebar: { x: 420, y: 280 },
    seat: { x: 150, y: 350 },
    footpeg: { x: 180, y: 480 },
    leanAngle: 45, // הרוכב רוכן ב-45 מעלות
  },
  NAKED: {
    name: "נייקד (ישיבה זקופה חלקית)",
    handlebar: { x: 380, y: 220 },
    seat: { x: 150, y: 350 },
    footpeg: { x: 200, y: 480 },
    leanAngle: 15,
  },
  CRUISER: {
    name: "קרוזר (הישענות אחורה)",
    handlebar: { x: 350, y: 180 },
    seat: { x: 150, y: 400 },
    footpeg: { x: 400, y: 450 },
    leanAngle: -10,
  }
};