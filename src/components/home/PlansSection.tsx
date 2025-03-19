import React from 'react';
import PlanCard from './PlanCard';

const PlansSection = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Residential Monitoring Plans
        </h2>
        <p className="mt-4 text-lg text-gray-600">
          Choose the right monitoring solution to maintain comfort and compliance in your facility
        </p>
      </div>

      <div className="mt-16 grid gap-8 lg:grid-cols-3">
        <PlanCard 
          title="Small"
          description="Perfect for smaller residential facilities"
          price="£15"
          imageSrc="https://jiablavyvojfiecxqury.supabase.co/storage/v1/object/sign/images/2sensors.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJpbWFnZXMvMnNlbnNvcnMucG5nIiwiaWF0IjoxNzQwMDcwMzY4LCJleHAiOjE3NzE2MDYzNjh9.1INjcgiOZeYYAmeEu7BjUez-JsTNX7PbWe7njKVdgLg"
          imageAlt="2 Temperature Sensors"
          features={[
            "2 Temperature Sensors for common areas",
            "1 Gateway with 24/7 monitoring",
            "Compliance-ready temperature reports",
            "Basic compliance documentation"
          ]}
        />
        
        <PlanCard 
          title="Medium"
          description="Ideal for medium-sized facilities with multiple common areas"
          price="£25"
          imageSrc="https://jiablavyvojfiecxqury.supabase.co/storage/v1/object/sign/images/4sensors.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJpbWFnZXMvNHNlbnNvcnMucG5nIiwiaWF0IjoxNzQwMDcwNDAwLCJleHAiOjE3NzE2MDY0MDB9.VXB1Sy1jS8Hwta_XdLSD6iqdb2xZUmsjSPxxYEnpucw"
          imageAlt="4 Temperature Sensors"
          features={[
            "4 Temperature Sensors for extended coverage",
            "2 Gateways for reliable coverage",
            "Advanced compliance reporting",
            "Priority support",
            "Temperature trend analysis"
          ]}
          highlighted={true}
        />
        
        <PlanCard 
          title="Large"
          description="Perfect for large facilities with multiple floors"
          price="£35"
          imageSrc="https://jiablavyvojfiecxqury.supabase.co/storage/v1/object/sign/images/8sensors.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJpbWFnZXMvOHNlbnNvcnMucG5nIiwiaWF0IjoxNzQwMDcwNDE5LCJleHAiOjE3NzE2MDY0MTl9.BlX5Cou_0Fx7H0SP8lrlvubgkKiaF8vaNOCiVNpDGA8"
          imageAlt="8 Temperature Sensors"
          features={[
            "8 Temperature Sensors for complete coverage",
            "3 Gateways for multi-floor monitoring",
            "Full compliance analytics suite",
            "Priority support",
            "Custom alert thresholds",
            "Automated compliance reports"
          ]}
        />
      </div>
      
      <div className="mt-12 text-center">
        <p className="text-gray-600">
          Need a custom solution for your residential facility?{' '}
          <a href="/contact" className="text-blue-600 font-medium hover:text-blue-500">
            Contact us
          </a>{' '}
          for a tailored monitoring solution that meets your specific requirements and helps maintain <a href="https://www.cqc.org.uk/guidance-regulation/providers/regulations" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">CQC</a> standards.
        </p>
      </div>
    </div>
  );
};

export default PlansSection;
