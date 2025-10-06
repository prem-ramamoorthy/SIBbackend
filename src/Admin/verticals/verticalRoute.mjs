import express from 'express';
import { Vertical } from '../AdminSchemas.mjs';
import { createVerticalValidation, updateVerticalValidation, idValidation } from './validation.mjs';
import { handleValidationErrors ,  authenticateCookie  } from '../middlewares.mjs';

const router = express.Router();

router.post('/createvertical', createVerticalValidation, handleValidationErrors ,  authenticateCookie, async (req, res) => {
  try {
    const newVertical = new Vertical(req.body);
    const savedVertical = await newVertical.save();
    res.status(201).json(savedVertical);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/getallverticals', async (req, res) => {
  try {
    const verticals = await Vertical.find().sort({ created_at: -1 });
    res.status(200).json(verticals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/getverticalbyid/:id', idValidation, handleValidationErrors ,  authenticateCookie, async (req, res) => {
  try {
    const vertical = await Vertical.findById(req.params.id);
    if (!vertical) {
      return res.status(404).json({ message: 'Vertical not found' });
    }
    res.status(200).json(vertical);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/updateverticalbyid/:id', updateVerticalValidation, handleValidationErrors ,  authenticateCookie, async (req, res) => {
  try {
    const updatedVertical = await Vertical.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!updatedVertical) {
      return res.status(404).json({ message: 'Vertical not found' });
    }
    res.status(200).json(updatedVertical);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/deleteverticalbyid/:id', idValidation, handleValidationErrors ,  authenticateCookie, async (req, res) => {
  try {
    const deletedVertical = await Vertical.findByIdAndDelete(req.params.id);
    if (!deletedVertical) {
      return res.status(404).json({ message: 'Vertical not found' });
    }
    res.status(200).json({ message: 'Vertical deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;