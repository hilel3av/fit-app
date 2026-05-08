"use client";
import React, { useState, useMemo, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows, Line, Sphere } from "@react-three/drei";
import { calculateElbow, Point } from "../utils/kinematics";
import { BIKES } from "../constants/bikes";
import ShirtModel from "./ShirtModel";

export default function Engine3D() {
  // 1. משתני השליטה כמו שהיו לנו קודם
  const [height, setHeight] = useState(180);
  const [armLength, setArmLength] = useState(65);
  const [selectedBike, setSelectedBike] = useState<keyof typeof BIKES>("SUPERSPORT");

  const bike = BIKES[selectedBike];

  // 2. המנוע הקינמטי - מחשב את הנקודות מאחורי הקלעים
  const skeleton = useMemo(() => {
    const scale = 2.2; 
    const torsoLength = (height * 0.3) * scale;
    const upperArm = (armLength * 0.45) * scale;
    const lowerArm = (armLength * 0.55) * scale;

    const hip: Point = bike.seat;
    
    // חישוב זווית הרכינה
    const rad = (bike.leanAngle * Math.PI) / 180;
    const shoulder: Point = {
      x: hip.x + Math.sin(rad) * torsoLength,
      y: hip.y - Math.cos(rad) * torsoLength,
    };

    // חישוב המרפק
    const elbow = calculateElbow(shoulder, bike.handlebar, upperArm, lowerArm);

    return { shoulder, hip, elbow, torsoLength };
  }, [height, armLength, selectedBike]);

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-8 bg-black min-h-screen text-white font-sans selection:bg-zinc-800">
      
      {/* --- פאנל השליטה --- */}
      <div className="w-full lg:w-96 flex flex-col gap-6 relative z-10">
        <div className="bg-zinc-900/50 backdrop-blur-md p-6 rounded-2xl border border-zinc-800 shadow-2xl">
          <h2 className="text-2xl font-bold tracking-tight mb-1">STALBET LABS</h2>
          <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest mb-6">3D Kinematic Engine v2.0</p>
          
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

        {/* בחירת אופנוע */}
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
      </div>

      {/* --- סטודיו התלת-מימד --- */}
      <div className="flex-1 bg-[#0a0a0a] rounded-3xl border border-zinc-800 relative overflow-hidden shadow-[inset_0_0_100px_rgba(0,0,0,0.9)] cursor-move">
        
        {/* מצלמה שממוקמת כדי להראות את כל הגוף והאופנוע */}
        <Canvas camera={{ position: [0, 1, 6], fov: 50 }}>
          
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 5, 2]} intensity={2.5} color="#ffb86c" castShadow />
          <pointLight position={[-5, 2, -5]} intensity={1} color="#4ade80" />

          <ContactShadows resolution={1024} scale={10} blur={1.5} opacity={0.8} far={5} color="#000000" position={[0, -1.5, 0]} />

          {/* קבוצת השלד והמודל - מכוילת לפרופורציות ריאליסטיות */}
<group scale={0.02} position={[-2, 0.5, 0]}>
  
  {/* נקודות מגע אופנוע */}
  <Sphere position={[bike.handlebar.x, -bike.handlebar.y, 0]} args={[5]}>
    <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2} />
  </Sphere>
  <Sphere position={[bike.seat.x, -bike.seat.y, 0]} args={[8]}>
    <meshStandardMaterial color="#3f3f46" />
  </Sphere>

  {/* שלד הרוכב - קווים עבים וברורים יותר */}
  <Line 
    points={[
      [skeleton.shoulder.x, -skeleton.shoulder.y, 0], 
      [skeleton.elbow.x, -skeleton.elbow.y, 0], 
      [bike.handlebar.x, -bike.handlebar.y, 0]
    ]} 
    color="#ffffff" lineWidth={5} 
  />
  <Line 
    points={[[skeleton.hip.x, -skeleton.hip.y, 0], [skeleton.shoulder.x, -skeleton.shoulder.y, 0]]} 
    color="#ffffff" lineWidth={8} 
  />

  {/* הלבשת החולצה על השלד */}
  {/* שינוי המיקום (position) והגודל (scale) כאן הוא קריטי להתאמה */}
  <group position={[skeleton.shoulder.x, -skeleton.shoulder.y, 0]} rotation={[0, 0, (bike.leanAngle * Math.PI) / 180]}>
    <Suspense fallback={null}>
      <ShirtModel 
        scale={75} // הגדלנו מ-40 ל-75 כדי שתתאים לגובה הרוכב
        position={[0, -45, 0]} // הזזנו את המודל כך שהצווארון יישב בדיוק על נקודת הכתף
        rotation={[0, Math.PI / 2, 0]} // מסובב את החולצה שתפנה הצידה (פרופיל) כמו הרוכב
      />
    </Suspense>
  </group>
</group>

          <gridHelper args={[20, 20, "#3f3f46", "#18181b"]} position={[0, -1.5, 0]} />
          
          <OrbitControls makeDefault enablePan={false} minPolarAngle={Math.PI / 4} maxPolarAngle={Math.PI / 2} />
        </Canvas>

        <div className="absolute bottom-6 left-6 pointer-events-none z-10">
          <p className="text-xs text-zinc-500 font-mono tracking-widest uppercase bg-black/50 p-2 rounded-md">
            Left Click: Rotate Camera | Scroll: Zoom
          </p>
        </div>
      </div>
    </div>
  );
}