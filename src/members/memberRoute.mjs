import express from 'express'
import MemberStatistics from './MemberStatisticsRoute.mjs';

const MemberRouter = express.Router();

MemberRouter.use('/statistics', MemberStatistics)

export default MemberRouter ;