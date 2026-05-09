import React from 'react';
import { Link } from 'react-router-dom';

const team = [
  { name: 'Dr. John Banda', title: 'Director General', image: null },
  { name: 'Ms. Mary Chanda', title: 'Director of Procurement', image: null },
  { name: 'Mr. Peter Zulu', title: 'Director of Finance', image: null },
  { name: 'Dr. Sarah Mwamba', title: 'Director of Operations', image: null },
];

const milestones = [
  { year: '2015', event: 'ZAMMSA established by an Act of Parliament' },
  { year: '2016', event: 'Launched the first national procurement framework' },
  { year: '2018', event: 'Achieved ISO 9001:2015 certification' },
  { year: '2019', event: 'Digitized procurement processes' },
  { year: '2020', event: 'Responded to COVID-19 pandemic with emergency procurement' },
  { year: '2022', event: 'Launched the e-Procurement portal' },
  { year: '2024', event: 'Expanded to 10 provincial offices nationwide' },
];

const About: React.FC = () => {
  return (
    <div>
      <section className="bg-gradient-to-r from-zammsa-green to-zammsa-green-dark text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">About ZAMMSA</h1>
          <p className="text-xl text-green-100 max-w-3xl">
            Zambia Medicines & Medical Supplies Agency - Ensuring quality healthcare through efficient and transparent procurement.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Mandate</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              ZAMMSA was established by an Act of Parliament in 2015 with the mandate to procure, store, and distribute
              medicines, medical supplies, and equipment for all public health facilities in Zambia.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              We are committed to ensuring that quality, affordable medicines and medical supplies are available
              to all Zambians through an efficient, transparent, and competitive procurement system.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Our e-Procurement platform provides a fair and open marketplace where suppliers can compete for
              procurement opportunities, ensuring value for money for the people of Zambia.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="w-12 h-12 bg-zammsa-green rounded-lg flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Mission</h3>
              <p className="text-sm text-gray-500">To provide quality medicines and medical supplies to all public health facilities in Zambia in a timely, cost-effective, and sustainable manner.</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="w-12 h-12 bg-zammsa-orange rounded-lg flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Vision</h3>
              <p className="text-sm text-gray-500">To be a world-class medicines and medical supplies procurement agency contributing to universal health coverage in Zambia.</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Integrity</h3>
              <p className="text-sm text-gray-500">We uphold the highest standards of transparency, accountability, and ethical conduct in all our procurement activities.</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">People First</h3>
              <p className="text-sm text-gray-500">We prioritize the health needs of the Zambian people in all our decisions and operations.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Key Milestones</h2>
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-zammsa-green hidden lg:block" />
            <div className="space-y-8">
              {milestones.map((m, i) => (
                <div key={m.year} className={`flex items-center gap-8 ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}>
                  <div className={`flex-1 ${i % 2 === 0 ? 'lg:text-right' : 'lg:text-left'}`}>
                    <div className="bg-white rounded-lg shadow-sm p-4 inline-block">
                      <p className="text-lg font-bold text-zammsa-green">{m.year}</p>
                      <p className="text-sm text-gray-600">{m.event}</p>
                    </div>
                  </div>
                  <div className="hidden lg:flex w-4 h-4 bg-zammsa-green rounded-full flex-shrink-0 relative z-10" />
                  <div className="flex-1 hidden lg:block" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Our Leadership Team</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member) => (
            <div key={member.name} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl text-gray-400 font-bold">
                  {member.name.split(' ').map((n) => n[0]).join('')}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900">{member.name}</h3>
              <p className="text-sm text-gray-500">{member.title}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-gray-900 mb-8 text-center">Our Partners</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center justify-items-center">
            {['MoH Zambia', 'UNICEF', 'WHO', 'Global Fund', 'USAID', 'JICA'].map((partner) => (
              <div key={partner} className="bg-white rounded-lg px-6 py-4 shadow-sm text-sm font-medium text-gray-500">
                {partner}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-zammsa-green py-12 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-bold mb-4">Want to do business with us?</h2>
          <p className="text-green-100 mb-6">Register as a supplier and get access to procurement opportunities.</p>
          <Link to="/suppliers/register" className="inline-block px-8 py-3 bg-zammsa-orange text-white font-semibold rounded-lg hover:bg-zammsa-orange-dark transition-colors">
            Register as Supplier
          </Link>
        </div>
      </section>
    </div>
  );
};

export default About;
