import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Shield } from 'lucide-react';

interface PlanCardProps {
  title: string;
  description: string;
  price: string;
  features: string[];
  imageSrc?: string;
  imageAlt?: string;
  highlighted?: boolean;
  customContent?: React.ReactNode;
}

const PlanCard: React.FC<PlanCardProps> = ({
  title,
  description,
  price,
  features,
  imageSrc,
  imageAlt,
  highlighted = false,
  customContent
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${highlighted ? 'border-2 border-blue-500' : ''}`}>
      <div className="px-6 py-8">
        <h3 className="text-2xl font-semibold text-gray-900">{title}</h3>
        <p className="mt-4 text-gray-500">{description}</p>
        <div className="mt-6">
          {imageSrc ? (
            <img 
              src={imageSrc}
              alt={imageAlt || title}
              className="w-full h-32 object-contain"
            />
          ) : customContent ? (
            <div className="h-[128px] flex items-center justify-center">
              {customContent}
            </div>
          ) : null}
        </div>
        <p className="mt-8">
          <span className="text-4xl font-extrabold text-gray-900">{price}</span>
          {price !== 'POA' && <span className="text-base font-medium text-gray-500">/month</span>}
        </p>
        <ul className="mt-8 space-y-4">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center text-gray-700">
              <Check className="h-5 w-5 text-green-500 mr-2" />
              <span dangerouslySetInnerHTML={{ 
                __html: feature.replace(
                  /CQC/g, 
                  '<a href="https://www.cqc.org.uk/guidance-regulation/providers/regulations" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-700">CQC</a>'
                )
              }} />
            </li>
          ))}
        </ul>
      </div>
      <div className="px-6 py-4 bg-gray-50">
        <Link
          to="/register"
          className="block w-full text-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        >
          {price === 'POA' ? 'Contact Us' : 'Get Started'}
        </Link>
      </div>
    </div>
  );
};

export default PlanCard;
