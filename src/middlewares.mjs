import admin from "../Auth/firebase.mjs";
import { validationResult } from 'express-validator';
import { Vertical } from '../src/Admin/AdminSchemas.mjs';
import User from "../Auth/Schemas.mjs";
import { Chapter } from "./chapter/ChapterSchema.mjs";

export const authenticateCookie = async (req, res, next) => {
  const sessionCookie = req.cookies.session || "";
  try {
    const decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true);
    req.user = decodedClaims;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" , error : err });
  }
};

export function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

export async function mapNamesToIds(req, res, next) {
  try {
    if (typeof req.body.username === 'string' && req.body.username.trim()) {
      const user = await User.findOne({ username: req.body.username }).select('_id');
      if (!user) {
        return res.status(400).json({
          errors: [{ type: 'field', path: 'username', msg: 'User not found by username' }]
        });
      }
      req.body.user_id = user._id;
      delete req.body.username;
    }
    if (typeof req.body.vertical_name === 'string' && req.body.vertical_name.trim()) {
      const vertical = await Vertical.findOne({ vertical_name: req.body.vertical_name }).select('_id');
      if (!vertical) {
        return res.status(400).json({
          errors: [{ type: 'field', path: 'vertical_name', msg: 'Vertical not found by name' }]
        });
      }
      req.body.vertical_id = vertical._id;
      delete req.body.vertical_name;
    }
    next();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}

export async function mapChapterNamesToIds(req, res, next) {
  try {
    if (typeof req.body.username === 'string' && req.body.username.trim()) {
      const user = await User.findOne({ username: req.body.username }).select('_id');
      if (!user) {
        return res.status(400).json({
          errors: [{ type: 'field', path: 'username', msg: 'User not found by username' }]
        });
      }
      req.body.user_id = user._id;
      delete req.body.username;
    }
    if (typeof req.body.chapter_name === 'string' && req.body.chapter_name.trim()) {
      const chapter = await Chapter.findOne({ chapter_name: req.body.chapter_name }).select('_id');
      if (!chapter) {
        return res.status(400).json({
          errors: [{ type: 'field', path: 'chapter_name', msg: 'Chapter not found by name' }]
        });
      }
      req.body.chapter_id = chapter._id;
      delete req.body.chapter_name;
    }
    next();
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}