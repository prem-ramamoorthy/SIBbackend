import express from "express";
import admin from "./firebase.mjs";
import { authenticateUser, handleValidation } from "./middleware.mjs";
import {
  signupValidator,
  loginValidator,
  updateProfileValidator,
  resetPasswordValidator,
  deleteAccountValidator,
} from "./validator.mjs";
import transporter from "./transporter.mjs";

const router = express.Router();

router.post("/signup", signupValidator, handleValidation, async (req, res) => {
  const { email, password, displayName } = req.body;
  try {
    const user = await admin.auth().createUser({ email, password, displayName });
    res.status(201).json({ message: "User created", uid: user.uid });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/sessionLogin", loginValidator, handleValidation, async (req, res) => {
  const idToken = req.body.idToken?.toString();
  const expiresIn = parseInt(process.env.SESSION_EXPIRY) || 60 * 60 * 24 * 5 * 1000;
  if (!idToken) {
    return res.status(400).json({ error: "Missing ID token" });
  }
  try {
    const sessionCookie = await admin.auth().createSessionCookie(idToken, { expiresIn });
    res.cookie("session", sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    res.json({ message: "Session created" });
  } catch (error) {
    console.error("Error creating session cookie:", error);
    res.status(401).json({ error: "Invalid token" });
  }
});

router.get("/profile", authenticateUser, (req, res) => {
  res.json({ user: req.user });
});

router.post("/sessionLogout", (req, res) => {
  res.clearCookie("session");
  res.json({ message: "Logged out" });
});

router.put("/updateProfile", authenticateUser, updateProfileValidator, handleValidation, async (req, res) => {
  const { displayName, password } = req.body;
  try {
    const updatedUser = await admin.auth().updateUser(req.user.uid, { displayName, password });
    res.json({ message: "Profile updated", user: updatedUser });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/resetPassword", resetPasswordValidator, handleValidation, async (req, res) => {
  const { email } = req.body;
  try {
    const link = await admin.auth().generatePasswordResetLink(email);
    await transporter.sendMail({
      from: '"SIB - Sengundhar in Business" <kairospredict@gmail.com>',
      to: email,
      subject: "Password Reset Request",
      html: `
        <p>Click the link to reset your password:</p>
        <a href="${link}">${link}</a>
        <p>If you didn’t ask to reset the password, you can ignore this email.</p>
        <p>Thanks,</p>
        <p>SIB - Sengundhar in Business</p>
      `
    });

    res.json({ message: "Password reset email sent successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/refreshSession", authenticateUser, async (req, res) => {
  const expiresIn = parseInt(process.env.SESSION_EXPIRY);
  try {
    const newSessionCookie = await admin.auth().createSessionCookie(req.cookies.session, { expiresIn });
    res.cookie("session", newSessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: true,
      sameSite: "none",
      domain: ".vercel.app",
    });
    res.json({ message: "Session refreshed" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/deleteAccount", authenticateUser, deleteAccountValidator, handleValidation, async (req, res) => {
  try {
    await admin.auth().deleteUser(req.user.uid);
    res.clearCookie("session");
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;