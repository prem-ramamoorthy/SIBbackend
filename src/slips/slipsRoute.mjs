import OneToOneRouter from './OneToOneRoute.mjs';
import express from 'express'

const slipsRouter = express.Router();

slipsRouter.use('/one2one',OneToOneRouter)

export default slipsRouter ;