export interface ContactFormData {
  name: string;
  email: string;
  phone: string | null;
  message: string;
  captchaToken: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  postcode: string;
  amount: number;
  subscriptionDay: string;
}
