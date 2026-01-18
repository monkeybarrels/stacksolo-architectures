/**
 * Products Routes
 * Public product listing and details
 */

import { Router } from 'express';
import * as stripeService from '../services/stripe.service';

const router = Router();

/**
 * List all products
 */
router.get('/', async (_req, res) => {
  try {
    const products = await stripeService.listProducts();
    res.json({ products });
  } catch (error: any) {
    console.error('Error listing products:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get single product
 */
router.get('/:id', async (req, res) => {
  try {
    const product = await stripeService.getProduct(req.params.id);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ product });
  } catch (error: any) {
    console.error('Error getting product:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
