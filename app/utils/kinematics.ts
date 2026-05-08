// utils/kinematics.ts

export interface Point {
  x: number;
  y: number;
}

/**
 * פונקציה לחישוב מיקום המרפק באמצעות קינמטיקה הפוכה (IK)
 * @param start - נקודת הכתף
 * @param end - נקודת הכידון
 * @param upperArm - אורך הזרוע (כתף עד מרפק)
 * @param lowerArm - אורך האמה (מרפק עד כף יד)
 */
export function calculateElbow(
  start: Point,
  end: Point,
  upperArm: number,
  lowerArm: number
): Point {
  // חישוב המרחק הישיר מהכתף לכידון (יתר המשולש)
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const d = Math.sqrt(dx * dx + dy * dy);

  // מניעת שגיאה אם היד קצרה מדי מלהגיע לכידון
  const dist = Math.min(d, upperArm + lowerArm - 1);

  // חישוב הזווית של הזרוע העליונה ביחס לקו הישר לכידון
  const angleA = Math.acos(
    (upperArm * upperArm + dist * dist - lowerArm * lowerArm) /
    (2 * upperArm * dist)
  );

  // הזווית הכוללת של היד במרחב
  const angleToTarget = Math.atan2(dy, dx);
  const finalAngle = angleToTarget + angleA;

  return {
    x: start.x + Math.cos(finalAngle) * upperArm,
    y: start.y + Math.sin(finalAngle) * upperArm,
  };
}