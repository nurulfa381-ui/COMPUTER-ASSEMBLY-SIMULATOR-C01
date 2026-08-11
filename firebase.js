/* =========================================================
   COMPUTER ASSEMBLY SIMULATOR C01
   V5 - FIREBASE ACTIVITY TRACKING
   ========================================================= */

import { initializeApp } from
"https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import {
  getAuth,
  signInAnonymously
} from
"https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
  getDatabase,
  ref,
  update,
  serverTimestamp
} from
"https://www.gstatic.com/firebasejs/12.17.1/firebase-database.js";


/* =========================================================
   FIREBASE CONFIG
   ========================================================= */

const firebaseConfig = {

  apiKey:
  "AIzaSyCVQ3P4O1mlPl9GCznwTpX29lENmSx0uLk",

  authDomain:
  "computer-system-set-up-race.firebaseapp.com",

  databaseURL:
  "https://computer-system-set-up-race-default-rtdb.asia-southeast1.firebasedatabase.app",

  projectId:
  "computer-system-set-up-race",

  storageBucket:
  "computer-system-set-up-race.firebasestorage.app",

  messagingSenderId:
  "855710524264",

  appId:
  "1:855710524264:web:c41255e00eff87aa8cacdd"

};


/* =========================================================
   INITIALIZE FIREBASE
   ========================================================= */

const app =
initializeApp(firebaseConfig);

const auth =
getAuth(app);

const db =
getDatabase(app);


/* =========================================================
   SAFE STUDENT ID
   Firebase key tidak boleh mengandungi:
   . # $ [ ]
   ========================================================= */

function safeKey(value){

  return String(value || "UNKNOWN")
    .trim()
    .replace(/[.#$\[\]\/]/g,"_");

}


/* =========================================================
   ANONYMOUS AUTHENTICATION
   Pelajar tidak perlu akaun Firebase.
   ========================================================= */

async function ensureFirebaseLogin(){

  if(auth.currentUser){
    return auth.currentUser;
  }

  const credential =
  await signInAnonymously(auth);

  return credential.user;

}


/* =========================================================
   START / ENTER SIMULATOR
   ========================================================= */

export async function startAssemblySession(
  studentData,
  totalSteps = 17
){

  try{

    const user =
    await ensureFirebaseLogin();

    const studentId =
    safeKey(studentData.id);

    const studentRef =
    ref(
      db,
      "computerAssembly/students/" +
      studentId
    );

    await update(
      studentRef,
      {

        name:
        studentData.name || "Pelajar",

        studentId:
        studentData.id || "",

        className:
        studentData.className || "",

        firebaseUid:
        user.uid,

        entered:
        true,

        status:
        "SEDANG BUAT",

        currentStep:
        0,

        totalSteps:
        totalSteps,

        progress:
        0,

        score:
        0,

        mistakes:
        0,

        startedAt:
        serverTimestamp(),

        lastActivity:
        serverTimestamp(),

        completed:
        false,

        completedAt:
        null,

        resultStatus:
        "BELUM SELESAI",

        simulatorVersion:
        "V5 ACTIVITY TRACKING"

      }
    );

    console.log(
      "✅ Firebase: sesi pelajar direkodkan."
    );

    return true;

  }
  catch(error){

    console.error(
      "❌ Firebase start session:",
      error
    );

    return false;

  }

}


/* =========================================================
   UPDATE PROGRESS
   Dipanggil setiap kali langkah berjaya.
   ========================================================= */

export async function updateAssemblyProgress(
  studentData,
  currentStep,
  totalSteps,
  score,
  mistakes
){

  try{

    await ensureFirebaseLogin();

    const studentId =
    safeKey(studentData.id);

    const progress =
    Math.min(
      100,
      Math.round(
        (currentStep / totalSteps) * 100
      )
    );

    const studentRef =
    ref(
      db,
      "computerAssembly/students/" +
      studentId
    );

    await update(
      studentRef,
      {

        status:
        currentStep >= totalSteps
        ? "SELESAI"
        : "SEDANG BUAT",

        currentStep:
        currentStep,

        totalSteps:
        totalSteps,

        progress:
        progress,

        score:
        score,

        mistakes:
        mistakes,

        lastActivity:
        serverTimestamp()

      }
    );

    return true;

  }
  catch(error){

    console.error(
      "❌ Firebase progress:",
      error
    );

    return false;

  }

}


/* =========================================================
   COMPLETE SIMULATION
   ========================================================= */

export async function completeAssemblySession(
  studentData,
  result,
  totalSteps = 17
){

  try{

    await ensureFirebaseLogin();

    const studentId =
    safeKey(studentData.id);

    const studentRef =
    ref(
      db,
      "computerAssembly/students/" +
      studentId
    );

    await update(
      studentRef,
      {

        name:
        studentData.name || "Pelajar",

        studentId:
        studentData.id || "",

        className:
        studentData.className || "",

        status:
        "SELESAI",

        currentStep:
        totalSteps,

        totalSteps:
        totalSteps,

        progress:
        100,

        score:
        result.score || 0,

        mistakes:
        result.mistakes || 0,

        accuracy:
        result.accuracy || 0,

        time:
        result.time || "00:00",

        completed:
        true,

        resultStatus:
        result.status ||
        "POST SUCCESS / BOOT SUCCESS",

        completedAt:
        serverTimestamp(),

        lastActivity:
        serverTimestamp(),

        simulatorVersion:
        "V5 ACTIVITY TRACKING"

      }
    );

    console.log(
      "✅ Firebase: simulasi selesai direkodkan."
    );

    return true;

  }
  catch(error){

    console.error(
      "❌ Firebase complete:",
      error
    );

    return false;

  }

}


/* =========================================================
   LOGOUT / KELUAR SEBELUM SELESAI
   ========================================================= */

export async function markAssemblyExit(
  studentData,
  currentStep,
  totalSteps,
  score,
  mistakes
){

  try{

    await ensureFirebaseLogin();

    const studentId =
    safeKey(studentData.id);

    const progress =
    Math.round(
      (currentStep / totalSteps) * 100
    );

    const studentRef =
    ref(
      db,
      "computerAssembly/students/" +
      studentId
    );

    await update(
      studentRef,
      {

        status:
        currentStep >= totalSteps
        ? "SELESAI"
        : "KELUAR SEBELUM SELESAI",

        currentStep:
        currentStep,

        totalSteps:
        totalSteps,

        progress:
        progress,

        score:
        score,

        mistakes:
        mistakes,

        lastActivity:
        serverTimestamp()

      }
    );

    return true;

  }
  catch(error){

    console.error(
      "❌ Firebase exit:",
      error
    );

    return false;

  }

}
