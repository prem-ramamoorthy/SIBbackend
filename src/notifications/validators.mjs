import mongoose from "mongoose";
import { body, param, query } from "express-validator";

export const createNotificationValidation = [
  body("receiver").exists().withMessage("receiver required").isString().withMessage("receiver must be string"),
  body("sender").optional().isString().withMessage("sender must be string"),
  body("header").optional().isString().withMessage("header must be string").isLength({ max: 80 }).withMessage("max 80 chars header"),
  body("content").exists().withMessage("content required").isString().withMessage("content must be string").isLength({ min: 2, max: 1024 }).withMessage("content must be 2-1024 chars"),
  body("read").optional().isBoolean().withMessage("read must be boolean"),
  body("readAt").optional().isISO8601().withMessage("readAt must be date"),
];

export const createbulkNotificationValidation = [
  body("header").optional().isString().withMessage("header must be string").isLength({ max: 80 }).withMessage("max 80 chars header"),
  body("content").exists().withMessage("content required").isString().withMessage("content must be string").isLength({ min: 2, max: 1024 }).withMessage("content must be 2-1024 chars"),
  body("read").optional().isBoolean().withMessage("read must be boolean"),
  body("readAt").optional().isISO8601().withMessage("readAt must be date"),
];

export const getNotificationsValidation = [
  query("receiver").optional().isString().withMessage("receiver must be string"),
  query("read").optional().isIn(["true", "false"]).withMessage("read must be boolean string"),
];

export const getNotificationByIdValidation = [
  param("id").exists().custom((v) => mongoose.Types.ObjectId.isValid(v)).withMessage("invalid id"),
];

export const updateNotificationValidation = [
  param("id").exists().custom((v) => mongoose.Types.ObjectId.isValid(v)).withMessage("invalid id"),
  body("header").optional().isString().withMessage("header must be string").isLength({ max: 80 }).withMessage("max 80 chars header"),
  body("content").optional().isString().withMessage("content must be string").isLength({ min: 2, max: 1024 }).withMessage("content must be 2-1024 chars"),
  body("read").optional().isBoolean().withMessage("read must be boolean"),
  body("readAt").optional().isISO8601().withMessage("readAt must be date"),
];

export const deleteNotificationValidation = [
  param("id").exists().custom((v) => mongoose.Types.ObjectId.isValid(v)).withMessage("invalid id"),
];

export const createBulkNotificationwithoutSenderValidation = [
  body("receiverList").exists().withMessage("receiver required").isArray().withMessage("receiver must be array"),
  body("header").optional().isString().withMessage("header must be string").isLength({ max: 80 }).withMessage("max 80 chars header"),
  body("content").exists().withMessage("content required").isString().withMessage("content must be string").isLength({ min: 2, max: 1024 }).withMessage("content must be 2-1024 chars"),
];