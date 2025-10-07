import OneToOneRouter from './OneToOneRoute.mjs';
import RefferalRouter from './referralsRoute.mjs';
import express from 'express'

const slipsRouter = express.Router();

slipsRouter.use('/one2one',OneToOneRouter)
slipsRouter.use('/referral',RefferalRouter)

export default slipsRouter ;