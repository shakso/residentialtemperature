import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from '../lib/auth';
import { createUserProfile } from '../lib/api';
import AuthForm from '../components/auth/AuthForm';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '../lib/stripe';
import Register from './Register/index';
import { useEffect } from 'react';


export default Register
