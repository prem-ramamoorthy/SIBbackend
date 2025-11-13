import router from "./CoordinatorRoute.mjs";
import RegionRouter from "./regions/regionRoute.mjs";
import VerticalRouter from './verticals/verticalRoute.mjs'
import express from 'express'

const AdminRouter = express.Router();

AdminRouter.use('/region',RegionRouter)
AdminRouter.use('/vertical',VerticalRouter)
AdminRouter.use('/coordinator' , router)

export default AdminRouter ;