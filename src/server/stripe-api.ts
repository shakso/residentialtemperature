import express, { Request, Response } from 'express';
import { Stripe } from 'stripe';
import cors, { CorsOptions } from 'cors';
import * as dotenv from 'dotenv';
import type { CreateSubscriptionParams } from './types';

const PORT = process.env.PORT || 3001;
const API_BASE = '/api/stripe';

dotenv.config();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is required');
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

const app = express();

// Add error handling middleware
app.use((err: any, req: any, res: any, next: any) => {
  console.error('Stripe API error:', err);
  res.status(500).json({
    error: 'Internal server error'
  });
});

const corsOptions: CorsOptions = {
  origin: '*',
  credentials: true
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount all routes under /api/stripe
const router = express.Router();

app.use(API_BASE, router);

// Add error handling middleware
app.use((err: any, req: Request, res: Response, next: Function) => {
  console.error('Stripe API error:', err);
  console.error('Full error details:', {
    message: err.message,
    type: err.type,
    code: err.code,
    param: err.param,
    raw: err.raw
  });

  res.status(err.statusCode || 500).json({
    error: {
      message: err.message || 'An unexpected error occurred',
      type: err.type || 'api_error',
      raw: err.raw
    }
  });
});

// Get subscription details
router.get('/subscription/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        error: {
          message: 'Subscription ID is required',
          type: 'validation_error'
        }
      });
    }
    
    const subscription = await stripe.subscriptions.retrieve(id, {
      expand: ['latest_invoice', 'customer']
    });
    
    res.json({
      id: subscription.id,
      status: subscription.status,
      plan: subscription.items?.data[0]?.price?.nickname || 'Unknown Plan',
      current_period_end: subscription.current_period_end,
      cancel_at_period_end: subscription.cancel_at_period_end,
      customer: subscription.customer
    });
  } catch (error: any) {
    console.error('Error fetching subscription:', error);
    return res.status(error.statusCode || 500).json({
      error: {
        message: error.message || 'Failed to fetch subscription details',
        type: error.type || 'api_error'
      }
    });
  }
});

// Cancel subscription
router.post('/subscriptions/:id/cancel', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        error: {
          message: 'Subscription ID is required',
          type: 'validation_error'
        }
      });
    }
    
    const subscription = await stripe.subscriptions.update(id, {
      cancel_at_period_end: true,
      expand: ['latest_invoice']
    });
    
    return res.json({
      id: subscription.id,
      status: subscription.status,
      cancel_at_period_end: subscription.cancel_at_period_end,
      current_period_end: subscription.current_period_end,
      latest_invoice: subscription.latest_invoice
    });
  } catch (error: any) {
    console.error('Error canceling subscription:', error);
    return res.status(error.statusCode || 500).json({
      error: {
        message: error.message || 'Failed to cancel subscription',
        type: error.type || 'api_error',
        code: error.code
      }
    });
  }
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: Function) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: {
      message: err.message || 'An internal server error occurred',
      type: 'server_error'
    }
  });
});

router.post('/create-subscription', async (req: Request, res: Response) => {
  try {
    const {
      priceId,
      email,
      firstName,
      lastName,
      couponCode,
      address,
      metadata = {}
    } = req.body as CreateSubscriptionParams;

    // Basic validation
    if (!priceId || !email || !firstName || !lastName || !address?.line1 || !address?.city || !address?.postal_code) {
      const missingFields = [];
      if (!priceId) missingFields.push('priceId');
      if (!email) missingFields.push('email');
      if (!firstName) missingFields.push('firstName');
      if (!lastName) missingFields.push('lastName');
      if (!address?.line1) missingFields.push('address.line1');
      if (!address?.city) missingFields.push('address.city');
      if (!address?.postal_code) missingFields.push('address.postal_code');

      return res.status(400).json({
        error: { 
          message: `Missing required fields: ${missingFields.join(', ')}`,
          type: 'validation_error',
          param: missingFields[0]
        }
      });
    }

    // Create or get customer
    let customer;
    const existingCustomers = await stripe.customers.list({ 
      email: email.toLowerCase().trim(), 
      limit: 1
    });
    
    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
      
      // Update customer details
      await stripe.customers.update(customer.id, {
        name: `${firstName} ${lastName}`,
        address,
        metadata
      });
    } else {
      customer = await stripe.customers.create({
        email,
        name: `${firstName} ${lastName}`,
        address,
        metadata
      });
    }
    
    // Validate coupon if provided
    let coupon;
    if (couponCode) {
      try {
        coupon = await stripe.coupons.retrieve(couponCode);
      } catch (err) {
        // Invalid or expired coupon - ignore and continue without it
        console.warn('Invalid coupon code:', couponCode);
      }
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ 
        price: priceId,
        quantity: 1
      }],
      coupon: coupon?.id,
      metadata,
      payment_behavior: 'default_incomplete',
      payment_settings: {
        payment_method_types: ['card'],
        save_default_payment_method: 'on_subscription'
      },
      expand: ['latest_invoice.payment_intent']
    });

    if (!subscription.latest_invoice || typeof subscription.latest_invoice === 'string') {
      throw new Error('Invalid subscription response');
    }

    const { payment_intent } = subscription.latest_invoice;
    if (!payment_intent || typeof payment_intent === 'string') {
      throw new Error('Failed to create subscription payment intent');
    }

    const clientSecret = payment_intent.client_secret;

    if (!clientSecret) {
      throw new Error('Failed to create subscription payment intent');
    }

    console.log('Subscription created successfully:', {
      subscriptionId: subscription.id,
      clientSecret
    });

    res.json({
      clientSecret: clientSecret,
      subscriptionId: subscription.id
    });
  } catch (error: any) {
    console.error('Error creating subscription:', error);
    console.error('Full error details:', {
      message: error.message,
      type: error.type,
      code: error.code,
      param: error.param,
      raw: error.raw
    });
    
    const statusCode = error.statusCode || 
      (error.type === 'StripeInvalidRequestError' ? 400 : 500);

    return res.status(statusCode).json({
      error: {
        message: error.message || 'An error occurred while creating the subscription',
        type: error.type || 'StripeError',
        param: error.param,
        code: error.code,
        raw: error.raw
      }
    });
  }
});

const server = app.listen(PORT, () => {
  console.log(`Stripe API server running on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down Stripe API server...');
  server.close(() => {
    console.log('Stripe API server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down Stripe API server...');
  server.close(() => {
    console.log('Stripe API server closed');
    process.exit(0);
  });
});
