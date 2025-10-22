import express from 'express';
import admin from "../../Auth/firebase.mjs";

const router = express.Router();

export const authenticateCookie = async (req, res, next) => {
  const sessionCookie = req.cookies.session || "";
  try {
    const decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true);
    req.user = decodedClaims;
    next();
  } catch (err) {
    req.user = null ;
    next();
  }
};

router.get('/showprofile',
  authenticateCookie,
  async (req, res) => {
    let editable = false ;
    if(req.user) editable = true ;
    res.send({editable})
  }
);

export default router