// Define subscription plan types
export const plans = [
  {
    id: 'Small',
    priceId: 'price_1QmzekEAgypXY6TnmJCfsGnuV',
    name: 'Small',
    price: 15,
    description: 'Perfect for smaller premises',
    features: ['2 Temperature Sensors', '1 Gateway']
  },
  {
    id: 'Medium',
    priceId: 'price_1Qx8RpEAgypXY6Tn7sgwn86D',
    name: 'Medium',
    description: 'Ideal for 2 floor premises',
    price: 25,
    features: ['4 Temperature Sensors', '2 Gateways'],
    highlighted: true
  },
  {
    id: 'Large',
    priceId: 'price_1QmzekEAgypXY6TnmJCfsGnuV',
    name: 'Large',
    description: 'Ideal for multi floor premises over a large area',
    price: 35,
    features: ['8 Temperature Sensors', '3 Gateways']
  }
];

export interface Plan {
  id: string;
  priceId: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  highlighted?: boolean;
}

export interface FormState {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2: string;
  city: string;
  postcode: string;
  addressQuery: string;
  selectedPlan: string;
  configureWifi: string | null;
  wifiSSID: string;
  wifiPassword: string;
  confirmWifiPassword: string;
  termsAccepted: boolean;
  couponCode: string;
  paymentId: string | null;
}
