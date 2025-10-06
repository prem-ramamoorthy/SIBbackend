import chapterMembershipRouter from './chapterMembershipRoute.mjs'
import chapterMainRouter from './chapterRoute.mjs'

import express from 'express'

const ChapterRouter = express.Router();

ChapterRouter.use('/membership',chapterMembershipRouter)
ChapterRouter.use('/main', chapterMainRouter)

export default ChapterRouter ;