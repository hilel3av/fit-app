"use client";
import React from "react";
import { useGLTF } from "@react-three/drei";

export default function ShirtModel(props: any) {
  // הפונקציה הזו הולכת לתיקיית public ומחפשת קובץ בשם test-shirt.glb
  const { scene } = useGLTF("/oversized_t-shirt.glb");

  // אנחנו מחזירים את האובייקט התלת-ממדי (primitive) ומאפשרים לשנות לו מיקום וגודל מבחוץ
  return (
    <primitive 
      object={scene} 
      scale={3} // מגדיל את המודל פי 3 שייראה טוב על המסך
      position={[0, -1, 0]} // מוריד אותו קצת למטה שיישב טוב על הקרקע
      {...props} 
    />
  );
}

// שורת בונוס: טוענת את המודל ברקע עוד לפני שהלקוח לוחץ, כדי שלא יהיה עיכוב (Preload)
useGLTF.preload("/oversized_t-shirt.glb");