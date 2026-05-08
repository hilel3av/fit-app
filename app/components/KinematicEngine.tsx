"use client";
import React, { useState, useMemo } from "react";
import { calculateElbow, Point } from "../utils/kinematics";
import { BIKES } from "../constants/bikes";

export default function KinematicEngine() {
  const [height, setHeight] = useState(180);
  const [armLength, setArmLength] = useState(65);
  const [selectedBike, setSelectedBike] = useState<keyof typeof BIKES>("SUPERSPORT");
  const [isOversize, setIsOversize] = useState(false);

  const bike = BIKES[selectedBike];

  // חישוב מתמטי חי של השלד
  const skeleton = useMemo(() => {
    const scale = 2.2; 
    const torsoLength = (height * 0.3) * scale;
    const upperArm = (armLength * 0.45) * scale;
    const lowerArm = (armLength * 0.55) * scale;

    const hip: Point = bike.seat;
    
    const rad = (bike.leanAngle * Math.PI) / 180;
    const shoulder: Point = {
      x: hip.x + Math.sin(rad) * torsoLength,
      y: hip.y - Math.cos(rad) * torsoLength,
    };

    const elbow = calculateElbow(shoulder, bike.handlebar, upperArm, lowerArm);

    // חישוב חשיפת הבד (Hem Lift) - מגדיר עד לאן התמונה תימתח כלפי מטה
    const baseCoverage = isOversize ? 1.15 : 1.0;
    const liftAmount = Math.max(0, bike.leanAngle * 0.8);
    const hemY = hip.y + (15 * baseCoverage) - (liftAmount / baseCoverage);

    const dx = bike.handlebar.x - elbow.x;
    const dy = bike.handlebar.y - elbow.y;
    const elbowAngle = Math.abs(Math.round(Math.atan2(dy, dx) * (180 / Math.PI)));

    return { shoulder, hip, elbow, hemY, torsoLength, elbowAngle };
  }, [height, armLength, selectedBike, isOversize]);

  const isCovered = skeleton.hemY > skeleton.hip.y + 5;

  // *** לוגיקת התמונות ***
  // כאן אנחנו אומרים למחשב איזו תמונה מתיקיית public לטעון לפי הכפתור שנלחץ
  const currentShirtImage = isOversize ? "/shirt1-g-f.png" : "/shirt1-g.png";

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-8 bg-black min-h-screen text-white font-sans selection:bg-zinc-800">
      
      {/* פאנל השליטה */}
      <div className="w-full lg:w-96 flex flex-col gap-6 relative z-10">
        <div className="bg-zinc-900/50 backdrop-blur-md p-6 rounded-2xl border border-zinc-800 shadow-2xl">
          <h2 className="text-2xl font-bold tracking-tight mb-1">STALBET LABS</h2>
          <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mb-6">Kinematic Fitting Engine v1.1</p>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-zinc-400">גובה רוכב</span>
                <span className="font-mono text-white">{height} cm</span>
              </div>
              <input type="range" min="160" max="200" value={height} onChange={(e) => setHeight(Number(e.target.value))} className="w-full accent-white" />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-zinc-400">מוטת זרועות</span>
                <span className="font-mono text-white">{armLength} cm</span>
              </div>
              <input type="range" min="55" max="80" value={armLength} onChange={(e) => setArmLength(Number(e.target.value))} className="w-full accent-white" />
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/50 backdrop-blur-md p-6 rounded-2xl border border-zinc-800 shadow-2xl">
          <label className="text-xs text-zinc-500 font-mono uppercase tracking-widest block mb-4">תנוחת רכיבה (Chassis)</label>
          <div className="flex flex-col gap-2">
            {(Object.keys(BIKES) as Array<keyof typeof BIKES>).map((key) => (
              <button
                key={key}
                onClick={() => setSelectedBike(key)}
                className={`w-full text-right p-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  selectedBike === key 
                  ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]" 
                  : "bg-zinc-800/50 text-zinc-400 hover:bg-zinc-700 hover:text-white"
                }`}
              >
                {BIKES[key].name}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto">
          <button
            onClick={() => setIsOversize(!isOversize)}
            className={`w-full relative overflow-hidden group p-5 rounded-2xl font-bold transition-all duration-500 border-2 ${
              isOversize 
              ? "border-[#4ade80] bg-[#4ade80]/10 text-[#4ade80] shadow-[0_0_20px_rgba(74,222,128,0.2)]" 
              : "border-zinc-700 bg-zinc-900 text-white hover:border-zinc-500"
            }`}
          >
            <div className="flex justify-between items-center relative z-10">
              <span className="text-lg uppercase tracking-wide">
                {isOversize ? "Full Oversize Faded" : "Regular Fit"}
              </span>
              <span className="font-mono text-xl">
                {isOversize ? "₪180" : "₪159"}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* המסך הוויזואלי */}
      <div className="flex-1 bg-[#0a0a0a] rounded-3xl border border-zinc-800 relative overflow-hidden shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]">
        
        <div className="absolute top-6 left-6 z-20 pointer-events-none">
          <div className="flex flex-col gap-1 font-mono text-[10px] text-zinc-500 tracking-widest">
            <p>SYS_STATUS: <span className="text-green-400">ONLINE</span></p>
            <p>POSTURE_ANGLE: <span className="text-white">{bike.leanAngle}°</span></p>
            <p>HEM_TENSION: <span className={isCovered ? "text-white" : "text-red-400"}>{Math.round(skeleton.hemY)}px</span></p>
          </div>
        </div>

        <svg viewBox="0 0 600 600" className="w-full h-full drop-shadow-[0_0_25px_rgba(255,255,255,0.05)]">
          <defs>
            <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>
            </pattern>
            <filter id="neon-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          
          <rect width="100%" height="100%" fill="url(#grid)" />
          <line x1="0" y1="520" x2="600" y2="520" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="5,5" />

          <circle cx={bike.handlebar.x} cy={bike.handlebar.y} r="6" fill="#ef4444" filter="url(#neon-glow)" className="transition-all duration-700 ease-in-out" />
          <circle cx={bike.seat.x} cy={bike.seat.y} r="8" fill="rgba(255,255,255,0.2)" className="transition-all duration-700 ease-in-out" />
          <circle cx={bike.footpeg.x} cy={bike.footpeg.y} r="6" fill="rgba(255,255,255,0.2)" className="transition-all duration-700 ease-in-out" />

          {/* השלד - מצויר מאחורי התמונה */}
          <g stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" style={{ transition: "all 0.7s cubic-bezier(0.4, 0, 0.2, 1)" }}>
            <path d={`M ${bike.seat.x} ${bike.seat.y} L ${bike.footpeg.x} ${bike.footpeg.y}`} strokeOpacity="0.3" />
            <line x1={skeleton.hip.x} y1={skeleton.hip.y} x2={skeleton.shoulder.x} y2={skeleton.shoulder.y} />
            <path d={`M ${skeleton.shoulder.x} ${skeleton.shoulder.y} L ${skeleton.elbow.x} ${skeleton.elbow.y} L ${bike.handlebar.x} ${bike.handlebar.y}`} />
          </g>

          {/* תמונת ה-PNG של החולצה מתיקיית public */}
          <image 
            href={currentShirtImage}
            x={skeleton.shoulder.x - 35} // הזזה קלה שמאלה כדי שהצווארון יישב באמצע השלד
            y={skeleton.shoulder.y - 15} // תחילת התמונה קצת מעל הכתף
            width="70" // רוחב החולצה ביחס לשלד
            height={skeleton.hemY - skeleton.shoulder.y + 15} // הגובה נמתח באופן דינמי ומתמטי עד למכפלת!
            preserveAspectRatio="none" // מכריח את התמונה להימתח לגובה שחישבנו
            style={{ transition: "all 0.7s cubic-bezier(0.4, 0, 0.2, 1)" }}
            transform={`rotate(${-bike.leanAngle * 0.7} ${skeleton.shoulder.x} ${skeleton.shoulder.y})`} // מסובב את התמונה יחד עם זווית הרכינה
          />

          <circle cx={skeleton.shoulder.x} cy={skeleton.shoulder.y - 35} r="22" fill="rgba(255,255,255,0.05)" stroke="white" strokeWidth="1.5" style={{ transition: "all 0.7s cubic-bezier(0.4, 0, 0.2, 1)" }} />
          <circle cx={skeleton.shoulder.x} cy={skeleton.shoulder.y} r="4" fill="white" style={{ transition: "all 0.7s cubic-bezier(0.4, 0, 0.2, 1)" }} />
        </svg>

        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-zinc-900/80 backdrop-blur-md px-6 py-3 rounded-full border border-zinc-700 flex items-center gap-3 shadow-xl">
          <div className={`w-3 h-3 rounded-full ${isCovered ? "bg-green-400 shadow-[0_0_10px_#4ade80]" : "bg-red-500 shadow-[0_0_10px_#ef4444] animate-pulse"}`}></div>
          <p className="text-sm font-mono tracking-wide">
            LOWER_BACK_COVERAGE: <span className={isCovered ? "text-green-400" : "text-red-400"}>{isCovered ? "OPTIMAL" : "EXPOSED"}</span>
          </p>
        </div>

      </div>
    </div>
  );
}