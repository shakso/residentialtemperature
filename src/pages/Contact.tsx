import React from 'react';
import HomeNavbar from '../components/navigation/HomeNavbar';
import ContactForm from '../components/home/ContactForm';
import Footer from '../components/Footer';
import { MessageSquare } from 'lucide-react';
import { useEffect } from 'react';

const Contact = () => {
  useEffect(() => {
    document.title = 'Contact | residential temperature';
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      <HomeNavbar />
      <div className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <MessageSquare className="h-12 w-12 text-blue-500" />
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900">Get in Touch</h1>
            <p className="mt-4 text-xl text-gray-600">
              Have questions about our temperature monitoring solutions? Fill out the form below and we'll get back to you as soon as possible.
            </p>
          </div>
          <ContactForm />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;
