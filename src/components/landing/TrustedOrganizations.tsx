import React from 'react';
import { Building2, Users, Award, TrendingUp } from 'lucide-react';

export const TrustedOrganizations = () => {
  const stats = [
    { icon: Building2, value: "50+", label: "Organizations" },
    { icon: Users, value: "5,000+", label: "Employees Managed" },
    { icon: Award, value: "70%", label: "Time Saved on Coordination" },
    { icon: TrendingUp, value: "98%", label: "Meeting Attendance Rate" }
  ];

  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <p className="text-lg text-gray-600 font-medium">
            Trusted by HR Teams Across East Africa
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="text-center p-6 bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow"
            >
              <div className="inline-flex p-3 bg-royal-red/10 rounded-lg mb-3">
                <stat.icon className="h-6 w-6 text-royal-red" />
              </div>
              <div className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
