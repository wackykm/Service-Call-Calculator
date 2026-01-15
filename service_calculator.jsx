import React, { useState, useMemo } from 'react';
import { Calculator, CheckSquare, FileText, DollarSign, Users, Download } from 'lucide-react';

const ServiceCalculator = () => {
  const [schoolName, setSchoolName] = useState('');
  const [enrollment, setEnrollment] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  
  // Service categories with their base monthly hours and whether they're typically included
  const [services, setServices] = useState({
    // Core Services (usually included in base)
    coreAccounting: {
      name: 'Core Accounting & Monthly Close',
      category: 'Core Services',
      selected: true,
      baseIncluded: true,
      hours: 16,
      tasks: ['Monthly closing', 'Financial statements', 'Board reporting packages', 'Depreciation']
    },
    bankRec: {
      name: 'Bank Reconciliations (All Accounts)',
      category: 'Core Services',
      selected: true,
      baseIncluded: true,
      hours: 16.4,
      tasks: ['Operating', 'Insurance', 'Endowment', 'Donation', 'Capital accounts']
    },
    auditPrep: {
      name: 'Audit Preparation',
      category: 'Core Services',
      selected: true,
      baseIncluded: true,
      hours: 4,
      tasks: ['Documentation organization', 'Digital backup systems', 'Auditor support']
    },
    
    // Student Accounts (complexity driver)
    studentAR: {
      name: 'Student Accounts Receivable',
      category: 'Student Accounts',
      selected: false,
      baseIncluded: false,
      hours: 62,
      complexityMultiplier: 1.0,
      tasks: ['Tuition tracking', 'Invoicing in FACTS', 'Aging monitoring', 'Delinquent letters', 'Dorm/Cafeteria/Athletic fees', 'ASP deposits', 'Wire transfers']
    },
    studentAccounts: {
      name: 'Student Account Management',
      category: 'Student Accounts',
      selected: false,
      baseIncluded: false,
      hours: 30,
      tasks: ['Payment tracking', 'Financial plans', 'Parent communications', 'Scholarship management']
    },
    studentAP: {
      name: 'Student Payables',
      category: 'Student Accounts',
      selected: false,
      baseIncluded: false,
      hours: 6.8,
      tasks: ['Student tithe', 'Student payroll', 'Annual 1099 preparation']
    },
    
    // Specialized Services
    endowment: {
      name: 'Endowment Fund Management',
      category: 'Specialized',
      selected: false,
      baseIncluded: false,
      hours: 16,
      tasks: ['Interest tracking', 'Fluctuation monitoring', 'Contributions', 'Distribution calculations']
    },
    transportation: {
      name: 'Transportation Accounting',
      category: 'Specialized',
      selected: false,
      baseIncluded: false,
      hours: 7.4,
      tasks: ['IFTA reporting', 'Transportation transfers', 'Fuel documentation']
    },
    squareDeposits: {
      name: 'Square/POS Reconciliation',
      category: 'Specialized',
      selected: false,
      baseIncluded: false,
      hours: 12,
      tasks: ['Mission sale', 'Farm store', 'Business office transactions']
    },
    payroll: {
      name: 'Payroll Processing Support',
      category: 'Specialized',
      selected: false,
      baseIncluded: false,
      hours: 8,
      tasks: ['Expensing', 'Bank charges', 'Payroll withholding tracking']
    },
    hr: {
      name: 'HR Documentation',
      category: 'Specialized',
      selected: false,
      baseIncluded: false,
      hours: 2.2,
      tasks: ['Taskforce paperwork', 'Volunteer insurance', 'Per diem tracking', 'Education reimbursements']
    },
  });

  // Pricing tiers based on complexity
  const pricingTiers = [
    { min: 0, max: 50, base: 2200, label: 'Small Day School' },
    { min: 50, max: 100, base: 2500, label: 'Medium Day School' },
    { min: 100, max: 150, base: 2800, label: 'Large Day School / Small Boarding' },
    { min: 150, max: 250, base: 3200, label: 'Medium Boarding Academy' },
    { min: 250, max: 999, base: 3500, label: 'Large Boarding Academy' },
  ];

  const toggleService = (key) => {
    setServices(prev => ({
      ...prev,
      [key]: { ...prev[key], selected: !prev[key].selected }
    }));
  };

  const calculations = useMemo(() => {
    // Determine base price tier
    const enrollmentNum = parseInt(enrollment) || 0;
    const tier = pricingTiers.find(t => enrollmentNum >= t.min && enrollmentNum <= t.max) || pricingTiers[0];
    
    // Calculate total hours for selected services
    const selectedServices = Object.values(services).filter(s => s.selected);
    const totalHours = selectedServices.reduce((sum, s) => sum + s.hours, 0);
    
    // Calculate additional cost for non-base services
    let additionalCost = 0;
    selectedServices.forEach(service => {
      if (!service.baseIncluded) {
        // Complex services like Student AR add more
        const multiplier = service.complexityMultiplier || 1.0;
        additionalCost += (service.hours / 10) * 100 * multiplier;
      }
    });
    
    const estimatedMonthly = Math.round(tier.base + additionalCost);
    const estimatedAnnual = estimatedMonthly * 12;
    
    return {
      tier,
      totalHours,
      estimatedMonthly,
      estimatedAnnual,
      selectedServices
    };
  }, [services, enrollment]);

  const generateProposal = () => {
    const proposalText = `
PRELIMINARY SERVICE PROPOSAL
Generated: ${new Date().toLocaleDateString()}

SCHOOL INFORMATION:
${schoolName || '[School Name]'}
${contactName ? `Contact: ${contactName}` : ''}
${contactEmail ? `Email: ${contactEmail}` : ''}
${enrollment ? `Enrollment: ${enrollment} students` : ''}

SERVICES SELECTED:
${calculations.selectedServices.map(s => 
  `✓ ${s.name} (${s.hours} hrs/month)\n  ${s.tasks.join(', ')}`
).join('\n\n')}

ESTIMATED PRICING:
Base Tier: ${calculations.tier.label}
Monthly Service Fee: $${calculations.estimatedMonthly.toLocaleString()}
Annual Investment: $${calculations.estimatedAnnual.toLocaleString()}

Note: This is a preliminary estimate based on our discovery conversation.
A formal proposal with exact pricing will be provided after reviewing your
specific systems, enrollment details, and operational complexity.

On-site assistant (15-20 hrs/week): School's responsibility (~$20-25K annually)

NEXT STEPS:
1. Review current accounting systems and workload
2. Discuss transition timeline
3. Provide formal proposal with exact pricing
4. Answer any questions about service delivery

Questions? Contact Kevin at [your email]
    `.trim();
    
    const blob = new Blob([proposalText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${schoolName.replace(/\s+/g, '_') || 'School'}_Preliminary_Proposal.txt`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Calculator className="w-8 h-8 text-indigo-600" />
            <h1 className="text-3xl font-bold text-gray-800">Remote Accounting Services</h1>
          </div>
          <p className="text-gray-600">Discovery Call Calculator - Check services as you discuss them</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column - School Info */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5" />
                School Information
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">School Name</label>
                  <input
                    type="text"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                    placeholder="Adventist Academy"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                    placeholder="Principal Name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                    placeholder="principal@school.edu"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Enrollment</label>
                  <input
                    type="number"
                    value={enrollment}
                    onChange={(e) => setEnrollment(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                    placeholder="150"
                  />
                  {enrollment && (
                    <p className="text-sm text-indigo-600 mt-1">
                      {calculations.tier.label}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Price Summary */}
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-lg shadow-lg p-6 text-white">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Estimated Investment
              </h2>
              
              <div className="space-y-3">
                <div>
                  <p className="text-indigo-200 text-sm">Monthly Service Fee</p>
                  <p className="text-3xl font-bold">${calculations.estimatedMonthly.toLocaleString()}</p>
                </div>
                
                <div className="border-t border-indigo-400 pt-3">
                  <p className="text-indigo-200 text-sm">Annual Investment</p>
                  <p className="text-2xl font-bold">${calculations.estimatedAnnual.toLocaleString()}</p>
                </div>
                
                <div className="border-t border-indigo-400 pt-3">
                  <p className="text-indigo-200 text-sm">Total Hours/Month</p>
                  <p className="text-xl font-bold">{calculations.totalHours} hours</p>
                </div>
              </div>
              
              <button
                onClick={generateProposal}
                disabled={!schoolName}
                className="w-full mt-6 bg-white text-indigo-600 py-3 px-4 rounded-lg font-semibold hover:bg-indigo-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                Generate Proposal
              </button>
              
              <p className="text-xs text-indigo-200 mt-3 text-center">
                Preliminary estimate - formal proposal to follow
              </p>
            </div>
          </div>

          {/* Right Column - Services */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <CheckSquare className="w-5 h-5" />
                Select Services
              </h2>

              {/* Core Services */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-700 mb-3 pb-2 border-b-2 border-indigo-200">
                  Core Services (Included in Base)
                </h3>
                <div className="space-y-3">
                  {Object.entries(services)
                    .filter(([_, s]) => s.category === 'Core Services')
                    .map(([key, service]) => (
                      <div
                        key={key}
                        className="bg-indigo-50 p-4 rounded-lg border-2 border-indigo-200"
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={service.selected}
                            onChange={() => toggleService(key)}
                            className="mt-1 w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
                          />
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="font-semibold text-gray-800">{service.name}</h4>
                              <span className="text-sm text-gray-600 font-medium">{service.hours} hrs/mo</span>
                            </div>
                            <p className="text-sm text-gray-600">{service.tasks.join(' • ')}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Student Accounts */}
              <div className="mb-6">
                <h3 className="font-bold text-gray-700 mb-3 pb-2 border-b-2 border-green-200">
                  Student Accounts (Select if applicable)
                </h3>
                <div className="space-y-3">
                  {Object.entries(services)
                    .filter(([_, s]) => s.category === 'Student Accounts')
                    .map(([key, service]) => (
                      <div
                        key={key}
                        onClick={() => toggleService(key)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                          service.selected
                            ? 'bg-green-50 border-green-400'
                            : 'bg-gray-50 border-gray-200 hover:border-green-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={service.selected}
                            onChange={() => toggleService(key)}
                            className="mt-1 w-5 h-5 text-green-600 rounded focus:ring-green-500"
                          />
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="font-semibold text-gray-800">{service.name}</h4>
                              <span className="text-sm text-gray-600 font-medium">{service.hours} hrs/mo</span>
                            </div>
                            <p className="text-sm text-gray-600">{service.tasks.join(' • ')}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Specialized Services */}
              <div>
                <h3 className="font-bold text-gray-700 mb-3 pb-2 border-b-2 border-amber-200">
                  Specialized Services (Select if applicable)
                </h3>
                <div className="space-y-3">
                  {Object.entries(services)
                    .filter(([_, s]) => s.category === 'Specialized')
                    .map(([key, service]) => (
                      <div
                        key={key}
                        onClick={() => toggleService(key)}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition ${
                          service.selected
                            ? 'bg-amber-50 border-amber-400'
                            : 'bg-gray-50 border-gray-200 hover:border-amber-300'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={service.selected}
                            onChange={() => toggleService(key)}
                            className="mt-1 w-5 h-5 text-amber-600 rounded focus:ring-amber-500"
                          />
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="font-semibold text-gray-800">{service.name}</h4>
                              <span className="text-sm text-gray-600 font-medium">{service.hours} hrs/mo</span>
                            </div>
                            <p className="text-sm text-gray-600">{service.tasks.join(' • ')}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceCalculator;
