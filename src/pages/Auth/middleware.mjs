import admin from "./firebase.mjs";
import { validationResult } from "express-validator";

export const authenticateUser = async (req, res, next) => {
  // --- THE FIX ---
  // 1. Try to read the standard cookie (Works for Web & Android)
  // 2. If blocked by Apple, fall back to the custom header (Works for iOS)
  const sessionCookie = req.cookies.session || req.headers['x-session-token'] || "";
  // ---------------

  try {
    const decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true);
    req.user = decodedClaims;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized", error: err.message || err });
  }
};

export const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
