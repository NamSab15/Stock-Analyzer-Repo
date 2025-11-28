// backend/services/companyAnalysisService.js - Company Specific Trading Analysis

/**
 * Company-Specific Trading Analysis Database
 * Provides sector insights, key metrics, and investment thesis for each stock
 */
const COMPANY_ANALYSIS_DB = {
  'RELIANCE.NS': {
    name: 'Reliance Industries Ltd',
    sector: 'Energy',
    subsector: 'Oil & Gas / Petrochemicals / Retail',
    marketCap: 'Mega Cap',
    keyMetrics: {
      peRatio: 20.5,
      pbRatio: 3.2,
      roE: 12.5,
      roA: 4.2,
      debtToEquity: 0.35,
    },
    businessHighlights: [
      'India\'s largest private conglomerate',
      'Integrated energy company (oil, gas, petrochemicals)',
      'Jio digital services and retail businesses',
      'Strong cash flow generation',
    ],
    keyDrivers: [
      'Oil & Gas production and pricing trends',
      'Petrochemical margins and demand',
      'Jio ARPU expansion and subscriber growth',
      'Reliance Retail expansion',
      'Energy transition investments',
    ],
    risks: [
      'Global crude oil price volatility',
      'Regulatory and environmental risks',
      'Energy transition impacts on oil demand',
      'Competitive intensity in retail',
      'Geopolitical tensions affecting energy markets',
    ],
    investmentThesis: 'Blue-chip defensive play with diversified revenue streams. Strong dividend yield, market leader in multiple segments.',
    bulletPoints: [
      '✓ Market leader in energy and petrochemicals',
      '✓ High dividend yield and shareholder returns',
      '✓ Digital transformation underway',
      '✗ Vulnerable to crude oil price fluctuations',
      '✗ High capex requirements for expansion',
    ],
  },

  'TCS.NS': {
    name: 'Tata Consultancy Services Ltd',
    sector: 'IT Services',
    subsector: 'Software Services / Consulting',
    marketCap: 'Mega Cap',
    keyMetrics: {
      peRatio: 24.8,
      pbRatio: 5.1,
      roE: 18.5,
      roA: 7.3,
      debtToEquity: 0.1,
    },
    businessHighlights: [
      'India\'s largest IT services company',
      'Global leader in IT and business services',
      'Strong presence across all verticals',
      'Consistent profitability and growth',
    ],
    keyDrivers: [
      'Digital transformation spending globally',
      'BFSI sector spending and IT budgets',
      'Cloud and managed services adoption',
      'Onsite/offshore ratio optimization',
      'Deal pipeline and win rates',
    ],
    risks: [
      'US recession impact on IT spending',
      'Visa restrictions and attrition rates',
      'Intense competition from global peers',
      'Margin compression from wage inflation',
      'Currency volatility (USD/INR)',
    ],
    investmentThesis: 'Quality IT services play with strong fundamentals. Premium valuation justified by market leadership and consistency.',
    bulletPoints: [
      '✓ Market leadership in IT services',
      '✓ Strong cash generation and ROE',
      '✓ Consistent dividend payments',
      '✗ Premium valuation',
      '✗ Cyclical exposure to IT spending',
    ],
  },

  'HDFCBANK.NS': {
    name: 'HDFC Bank Ltd',
    sector: 'Banking',
    subsector: 'Private Banking',
    marketCap: 'Mega Cap',
    keyMetrics: {
      peRatio: 22.3,
      pbRatio: 2.8,
      roE: 15.2,
      roA: 1.8,
      debtToEquity: 3.5,
    },
    businessHighlights: [
      'India\'s largest private sector bank',
      'Strong retail and SME customer base',
      'Digital banking leader',
      'Merger with HDB Financial Services underway',
    ],
    keyDrivers: [
      'Loan growth and deposit mobilization',
      'NIM (Net Interest Margin) trends',
      'Credit quality and NPL management',
      'Fee income and cross-sell opportunities',
      'Digital adoption and branch optimization',
    ],
    risks: [
      'Asset quality concerns during economic slowdown',
      'Deposit competition and rate pressures',
      'Regulatory changes and compliance issues',
      'Merger integration challenges',
      'Competitive intensity in retail banking',
    ],
    investmentThesis: 'Premium banking proxy with strong growth trajectory. Conservative credit underwriting with solid dividend yield.',
    bulletPoints: [
      '✓ Market leader in private banking',
      '✓ Strong growth in deposits and advances',
      '✓ Conservative asset quality',
      '✗ Premium valuation to peers',
      '✗ Merger integration risks',
    ],
  },

  'INFY.NS': {
    name: 'Infosys Ltd',
    sector: 'IT Services',
    subsector: 'Software Services / Consulting',
    marketCap: 'Mega Cap',
    keyMetrics: {
      peRatio: 22.5,
      pbRatio: 4.8,
      roE: 17.3,
      roA: 6.8,
      debtToEquity: 0.0,
    },
    businessHighlights: [
      'Global IT services company with strong presence',
      'Focus on digital and cloud services',
      'Strong India operations and talent pool',
      'Zero debt balance sheet',
    ],
    keyDrivers: [
      'Digital services revenue growth',
      'Cloud adoption acceleration',
      'Consulting and application services demand',
      'Margin expansion initiatives',
      'Talent utilization and pricing',
    ],
    risks: [
      'Global macro slowdown impact',
      'Visa and immigration policy changes',
      'Talent retention and cost inflation',
      'Competition from peers and startups',
      'Customer concentration risk',
    ],
    investmentThesis: 'Strong IT services player with focus on digital transformation. Conservative growth at reasonable valuation.',
    bulletPoints: [
      '✓ Digital services expansion',
      '✓ Strong free cash flow',
      '✓ Zero debt, strong balance sheet',
      '✗ Exposure to macro slowdown',
      '✗ Attrition challenges persist',
    ],
  },

  'ICICIBANK.NS': {
    name: 'ICICI Bank Ltd',
    sector: 'Banking',
    subsector: 'Private Banking',
    marketCap: 'Mega Cap',
    keyMetrics: {
      peRatio: 19.8,
      pbRatio: 2.2,
      roE: 13.8,
      roA: 1.5,
      debtToEquity: 3.8,
    },
    businessHighlights: [
      'Second largest private sector bank',
      'Strong retail and corporate franchises',
      'Growing digital and wealth management',
      'Asset quality improving',
    ],
    keyDrivers: [
      'Loan portfolio growth across segments',
      'Deposit growth and mix improvement',
      'NIM sustainability',
      'Fee income from wealth and treasury',
      'Credit cost moderation',
    ],
    risks: [
      'NPL resolution and recovery risks',
      'Regulatory capital requirements',
      'Interest rate sensitivity',
      'Competitive deposit pricing',
      'Macro economic slowdown impact',
    ],
    investmentThesis: 'Improving asset quality with growth momentum. Valuation attractive compared to HDFC Bank on recovery play.',
    bulletPoints: [
      '✓ Improving credit quality',
      '✓ Growth in retail advances',
      '✓ Attractive valuations',
      '✗ Higher NPL ratios vs peers',
      '✗ Regulatory scrutiny',
    ],
  },

  'HINDUNILVR.NS': {
    name: 'Hindustan Unilever Ltd',
    sector: 'FMCG',
    subsector: 'Personal Care & Home Care',
    marketCap: 'Large Cap',
    keyMetrics: {
      peRatio: 28.5,
      pbRatio: 8.2,
      roE: 28.3,
      roA: 12.1,
      debtToEquity: 0.15,
    },
    businessHighlights: [
      'India\'s largest FMCG company',
      'Diversified portfolio across categories',
      'Strong brand portfolio and distribution',
      'Digital commerce leadership',
    ],
    keyDrivers: [
      'Volume growth in rural and urban markets',
      'Price realization and premiumization',
      'Cost inflation management',
      'New category expansion',
      'E-commerce and D2C growth',
    ],
    risks: [
      'Input cost inflation (commodities, energy)',
      'Rural slowdown and demand pressure',
      'Competition from local players',
      'Consumer price sensitivity',
      'Currency and commodity volatility',
    ],
    investmentThesis: 'Quality consumer defensive with pricing power. Premium valuations justified by market leadership and ROE.',
    bulletPoints: [
      '✓ Market leader with strong brands',
      '✓ Pricing power and margin expansion',
      '✓ Consistent dividend growth',
      '✗ Premium valuations',
      '✗ Rural consumption pressure',
    ],
  },

  'ITC.NS': {
    name: 'ITC Ltd',
    sector: 'FMCG',
    subsector: 'Tobacco / FMCG / Hotels / Agribusiness',
    marketCap: 'Large Cap',
    keyMetrics: {
      peRatio: 15.2,
      pbRatio: 1.8,
      roE: 10.5,
      roA: 4.2,
      debtToEquity: 0.4,
    },
    businessHighlights: [
      'Largest tobacco company in India',
      'Diversified FMCG portfolio',
      'Hotel chain (ITC Hotels)',
      'Agribusiness and packaging',
    ],
    keyDrivers: [
      'Tobacco volume and price realization',
      'FMCG segment profitability',
      'Hotels recovery post-pandemic',
      'Agribusiness commodity prices',
      'Excise duty changes',
    ],
    risks: [
      'Tobacco regulations and excise duty hikes',
      'Health concerns and volume decline',
      'Regulatory restrictions on advertising',
      'Commodity price volatility',
      'Organized retail competition',
    ],
    investmentThesis: 'Diversified conglomerate with strong dividend yield. Tobacco business provides stable cash flows despite headwinds.',
    bulletPoints: [
      '✓ Strong dividend yield',
      '✓ Diversified revenue streams',
      '✓ Attractive valuation',
      '✗ Tobacco business headwinds',
      '✗ Hotels business uncertainty',
    ],
  },

  'POWERGRID.NS': {
    name: 'Power Grid Corporation of India Ltd',
    sector: 'Power',
    subsector: 'Transmission & Distribution',
    marketCap: 'Large Cap',
    keyMetrics: {
      peRatio: 18.5,
      pbRatio: 2.1,
      roE: 11.2,
      roA: 3.8,
      debtToEquity: 1.2,
    },
    businessHighlights: [
      'India\'s largest power transmission company',
      'Critical infrastructure player',
      'Stable regulated returns business',
      'Renewable energy transmission focus',
    ],
    keyDrivers: [
      'Transmission line expansion',
      'Grid modernization and technology upgrades',
      'Renewable energy integration',
      'Tariff realization and cost management',
      'Capacity addition and utilization',
    ],
    risks: [
      'Regulatory rate cuts and tariff pressure',
      'Project execution and cost overruns',
      'Government budget constraints',
      'Rising debt levels',
      'Political and regulatory changes',
    ],
    investmentThesis: 'Utility play with stable dividend and essential service. Defensive but slow-growth characteristics.',
    bulletPoints: [
      '✓ Stable regulated returns',
      '✓ Dividend aristocrat',
      '✓ Infrastructure criticality',
      '✗ Slow growth prospects',
      '✗ Rising leverage',
    ],
  },

  'SBIN.NS': {
    name: 'State Bank of India',
    sector: 'Banking',
    subsector: 'Public Sector Banking',
    marketCap: 'Mega Cap',
    keyMetrics: {
      peRatio: 14.2,
      pbRatio: 1.6,
      roE: 11.3,
      roA: 1.2,
      debtToEquity: 5.2,
    },
    businessHighlights: [
      'Largest public sector bank in India',
      'Extensive branch and ATM network',
      'Government banking relationships',
      'Pension and insurance businesses',
    ],
    keyDrivers: [
      'Deposit growth from government entities',
      'Loan growth across retail and commercial',
      'NPA resolution and recovery',
      'Technology investment and digital banking',
      'Cost-to-income ratio improvement',
    ],
    risks: [
      'High NPA levels and recovery risks',
      'Competitive deposit mobilization',
      'Government bond portfolio risk',
      'Regulatory capital requirements',
      'PSU reform challenges',
    ],
    investmentThesis: 'PSU banking play with asset quality recovery underway. Attractive valuation but legacy challenges remain.',
    bulletPoints: [
      '✓ Improving asset quality',
      '✓ Cheap valuations',
      '✓ Government backing',
      '✗ High legacy NPAs',
      '✗ Execution risks',
    ],
  },

  'BHARTIARTL.NS': {
    name: 'Bharti Airtel Ltd',
    sector: 'Telecom',
    subsector: 'Telecom Services',
    marketCap: 'Large Cap',
    keyMetrics: {
      peRatio: 26.3,
      pbRatio: 3.2,
      roE: 12.1,
      roA: 2.8,
      debtToEquity: 1.8,
    },
    businessHighlights: [
      'Second largest telecom operator in India',
      'Expanding 5G network',
      'Digital services and tower business',
      'Africa operations and content platforms',
    ],
    keyDrivers: [
      'ARPU growth and subscriber additions',
      '5G capex and rollout impact',
      '4G network quality advantage',
      'Postpaid mix improvement',
      'Digital services and OTT expansion',
    ],
    risks: [
      'Intense price competition',
      'High capex requirements for 5G',
      'Regulatory intervention on pricing',
      'Subscriber acquisition costs',
      'Africa operations profitability',
    ],
    investmentThesis: 'Telecom consolidation play with improving unit economics. 5G investment to drive long-term growth.',
    bulletPoints: [
      '✓ ARPU improvement trend',
      '✓ 5G leadership positioning',
      '✓ Digital expansion',
      '✗ High capex intensity',
      '✗ Price competition',
    ],
  },

  'KOTAKBANK.NS': {
    name: 'Kotak Mahindra Bank Ltd',
    sector: 'Banking',
    subsector: 'Private Banking',
    marketCap: 'Large Cap',
    keyMetrics: {
      peRatio: 18.5,
      pbRatio: 2.3,
      roE: 14.2,
      roA: 1.6,
      debtToEquity: 3.2,
    },
    businessHighlights: [
      'Leading private sector bank',
      'Strong wealth and investment banking',
      'Asset management and insurance',
      'Digital banking innovation',
    ],
    keyDrivers: [
      'Advances growth in retail and corporate',
      'NIM maintenance and liability costs',
      'Wealth management fee income',
      'Insurance business growth',
      'Cost efficiency ratio',
    ],
    risks: [
      'High concentration in mutual fund business',
      'Regulatory capital requirements',
      'Competition in retail lending',
      'Asset quality in unsecured lending',
      'Market-linked wealth management',
    ],
    investmentThesis: 'Premium private bank with strong wealth franchise. Conservative growth with robust governance.',
    bulletPoints: [
      '✓ Strong wealth management business',
      '✓ Quality asset portfolio',
      '✓ Digital innovation leader',
      '✗ Market-linked income volatility',
      '✗ Wealth business regulatory risk',
    ],
  },

  'LT.NS': {
    name: 'Larsen & Toubro Ltd',
    sector: 'Infrastructure',
    subsector: 'Engineering & Construction',
    marketCap: 'Large Cap',
    keyMetrics: {
      peRatio: 22.1,
      pbRatio: 2.7,
      roE: 12.8,
      roA: 2.9,
      debtToEquity: 0.25,
    },
    businessHighlights: [
      'India\'s largest diversified conglomerate',
      'Major infrastructure development player',
      'Technology and digital services focus',
      'Financial services and mutual funds',
    ],
    keyDrivers: [
      'Infrastructure pipeline and project execution',
      'Real estate development momentum',
      'Technology services growth',
      'Order book conversion',
      'Margin improvement',
    ],
    risks: [
      'Project execution delays and cost overruns',
      'Government spending cycles',
      'Real estate market downturn',
      'Technology services competition',
      'Working capital management',
    ],
    investmentThesis: 'Diversified play on India infrastructure growth. Strong order book provides visibility.',
    bulletPoints: [
      '✓ Largest infrastructure company',
      '✓ Strong order book',
      '✓ Diversified revenue streams',
      '✗ Project execution risks',
      '✗ Capital intensity',
    ],
  },

  'AXISBANK.NS': {
    name: 'Axis Bank Ltd',
    sector: 'Banking',
    subsector: 'Private Banking',
    marketCap: 'Large Cap',
    keyMetrics: {
      peRatio: 17.3,
      pbRatio: 1.9,
      roE: 11.5,
      roA: 1.4,
      debtToEquity: 4.1,
    },
    businessHighlights: [
      'Third largest private sector bank',
      'Strong retail franchise',
      'Digital banking capabilities',
      'Growing wealth management',
    ],
    keyDrivers: [
      'Retail advances growth',
      'CASA ratio improvement',
      'NIM expansion',
      'Fee income growth',
      'Cost-to-income optimization',
    ],
    risks: [
      'Competitive deposit pricing',
      'Retail credit quality risks',
      'Regulatory capital requirements',
      'IT and technology risks',
      'Talent retention',
    ],
    investmentThesis: 'Emerging private bank with strong growth. Improving profitability metrics and asset quality.',
    bulletPoints: [
      '✓ Strong retail growth',
      '✓ Improving CASA ratio',
      '✓ Digital banking expansion',
      '✗ Competitive deposits pressure',
      '✗ Retail credit risks',
    ],
  },

  'WIPRO.NS': {
    name: 'Wipro Ltd',
    sector: 'IT Services',
    subsector: 'Software Services / Consulting',
    marketCap: 'Large Cap',
    keyMetrics: {
      peRatio: 20.5,
      pbRatio: 4.1,
      roE: 16.2,
      roA: 5.9,
      debtToEquity: 0.15,
    },
    businessHighlights: [
      'Global IT services company',
      'Focus on digital and cloud transformation',
      'Strong presence in consulting',
      'Managed services and infrastructure',
    ],
    keyDrivers: [
      'Digital services revenue growth',
      'Cloud adoption acceleration',
      'Enterprise services demand',
      'Margin expansion from scale',
      'Pricing realization',
    ],
    risks: [
      'US economic slowdown impact',
      'Talent cost inflation',
      'Geographic revenue concentration',
      'Customer concentration risk',
      'Visa and immigration policy',
    ],
    investmentThesis: 'Strong digital transformation focus. Mid-tier IT services player with selective growth.',
    bulletPoints: [
      '✓ Digital services focus',
      '✓ Strong operational metrics',
      '✓ Reasonable valuations',
      '✗ Slower growth than TCS/Infy',
      '✗ Talent retention challenges',
    ],
  },

  'ADANIENT.NS': {
    name: 'Adani Enterprises Ltd',
    sector: 'Diversified',
    subsector: 'Conglomerate / Infrastructure',
    marketCap: 'Large Cap',
    keyMetrics: {
      peRatio: 32.5,
      pbRatio: 4.2,
      roE: 13.2,
      roA: 2.1,
      debtToEquity: 2.1,
    },
    businessHighlights: [
      'Diversified Adani Group flagship',
      'Infrastructure development projects',
      'Renewable energy and power assets',
      'Logistics and port operations',
    ],
    keyDrivers: [
      'Project pipeline execution',
      'Infrastructure development cycle',
      'Renewable energy capacity additions',
      'Logistics network expansion',
      'Government infrastructure spending',
    ],
    risks: [
      'High leverage and refinancing risk',
      'Geopolitical and regulatory scrutiny',
      'Project execution and delays',
      'Commodity price volatility',
      'Interest rate sensitivity',
    ],
    investmentThesis: 'Infrastructure play on India\'s development. High growth but elevated leverage and execution risks.',
    bulletPoints: [
      '✓ Emerging infrastructure player',
      '✓ Renewable energy exposure',
      '✓ Government support',
      '✗ High leverage',
      '✗ Execution risks',
    ],
  },

  'TATAMOTORS.NS': {
    name: 'Tata Motors Ltd',
    sector: 'Automobile',
    subsector: 'Cars & Utility Vehicles',
    marketCap: 'Large Cap',
    keyMetrics: {
      peRatio: 8.5,
      pbRatio: 0.9,
      roE: 10.2,
      roA: 1.8,
      debtToEquity: 1.5,
    },
    businessHighlights: [
      'India\'s largest automobile manufacturer',
      'Global operations including Jaguar Land Rover',
      'Commercial vehicles leader',
      'EV and digital mobility initiatives',
    ],
    keyDrivers: [
      'Domestic passenger vehicle demand',
      'Commercial vehicle volumes and pricing',
      'JLR turnaround progress',
      'EV adoption and pricing',
      'Supply chain normalization',
    ],
    risks: [
      'Cyclical auto industry downturn',
      'JLR profitability challenges',
      'Semiconductor shortage impact',
      'EV transition capex requirements',
      'Competition from new entrants',
    ],
    investmentThesis: 'Cyclical turnaround play. JLR stabilization and EV growth potential provide upside.',
    bulletPoints: [
      '✓ Market leader in CV segment',
      '✓ Cheap valuations',
      '✓ EV opportunity',
      '✗ JLR turnaround uncertain',
      '✗ Cyclical downturn risk',
    ],
  },

  'ASIANPAINT.NS': {
    name: 'Asian Paints Ltd',
    sector: 'Paints',
    subsector: 'Decorative & Industrial Paints',
    marketCap: 'Large Cap',
    keyMetrics: {
      peRatio: 28.2,
      pbRatio: 8.5,
      roE: 28.5,
      roA: 11.2,
      debtToEquity: 0.08,
    },
    businessHighlights: [
      'India\'s largest paint manufacturer',
      'Diversified product portfolio',
      'Strong distribution network',
      'Digital and DIY channel expansion',
    ],
    keyDrivers: [
      'Decorative paint volume and pricing',
      'Industrial coatings demand',
      'Housing cycle and construction activity',
      'Premium product mix improvement',
      'Export growth',
    ],
    risks: [
      'Input cost inflation (resins, pigments)',
      'Housing cycle downturn',
      'Pricing power limitations',
      'Competition from organized and unorganized players',
      'Commodity volatility',
    ],
    investmentThesis: 'Quality consumption play with strong brand. Premium valuations reflect market leadership.',
    bulletPoints: [
      '✓ Market leader with strong brands',
      '✓ Premium product mix expansion',
      '✓ Distribution advantage',
      '✗ Premium valuations',
      '✗ Housing cycle exposure',
    ],
  },

  'MARUTI.NS': {
    name: 'Maruti Suzuki India Ltd',
    sector: 'Automobile',
    subsector: 'Passenger Cars',
    marketCap: 'Large Cap',
    keyMetrics: {
      peRatio: 12.3,
      pbRatio: 1.5,
      roE: 12.8,
      roA: 3.2,
      debtToEquity: 0.2,
    },
    businessHighlights: [
      'India\'s largest passenger car manufacturer',
      'Strong brand presence and distribution',
      'New model launches and SUV focus',
      'Hybrid technology leadership',
    ],
    keyDrivers: [
      'Passenger car segment volumes',
      'SUV mix improvement',
      'Hybrid and EV product launches',
      'Pricing and margin management',
      'Export opportunities',
    ],
    risks: [
      'Auto industry cyclical downturn',
      'Semiconductor supply issues',
      'New competition (EV manufacturers)',
      'Fuel economy regulations',
      'Labor relations and strikes',
    ],
    investmentThesis: 'Market leader in passenger cars. Conservative growth with strong profitability.',
    bulletPoints: [
      '✓ Market leader in PV segment',
      '✓ Strong brand and network',
      '✓ Hybrid and SUV expansion',
      '✗ Cyclical downturn risk',
      '✗ EV transition uncertainty',
    ],
  },

  'TITAN.NS': {
    name: 'Titan Company Ltd',
    sector: 'Jewellery',
    subsector: 'Jewellery & Watches',
    marketCap: 'Large Cap',
    keyMetrics: {
      peRatio: 32.1,
      pbRatio: 5.2,
      roE: 16.3,
      roA: 4.1,
      debtToEquity: 0.35,
    },
    businessHighlights: [
      'India\'s largest jewellery retailer',
      'Watches and eyewear brands',
      'Unique retail experience and stores',
      'Digital and omnichannel presence',
    ],
    keyDrivers: [
      'Jewellery demand and wedding season',
      'Same-store growth and new stores',
      'Watches and accessories expansion',
      'Retail traffic and conversion rates',
      'E-commerce penetration',
    ],
    risks: [
      'Gold price volatility',
      'Consumer spending slowdown',
      'Unorganized market competition',
      'Real estate lease costs',
      'Inventory management',
    ],
    investmentThesis: 'Organized jewellery play with strong brand. Growth from organized market consolidation.',
    bulletPoints: [
      '✓ Market consolidation leadership',
      '✓ Strong brands and experience',
      '✓ Omnichannel expansion',
      '✗ Gold price volatility',
      '✗ Consumer discretionary exposure',
    ],
  },

  'SUNPHARMA.NS': {
    name: 'Sun Pharmaceutical Industries Ltd',
    sector: 'Pharma',
    subsector: 'Pharmaceutical Manufacturing',
    marketCap: 'Large Cap',
    keyMetrics: {
      peRatio: 18.5,
      pbRatio: 2.3,
      roE: 12.4,
      roA: 3.1,
      debtToEquity: 0.28,
    },
    businessHighlights: [
      'India\'s second largest pharma company',
      'Global operations and generic focus',
      'Specialty pharma expansion',
      'API and formulation expertise',
    ],
    keyDrivers: [
      'US generic volumes and pricing',
      'India branded generic growth',
      'Specialty pharma revenues',
      'Cost efficiency and margins',
      'New product launches',
    ],
    risks: [
      'US generic price deflation',
      'FDA compliance and inspections',
      'Drug recalls and regulatory issues',
      'Patent cliff and pipeline risk',
      'Geopolitical tensions (China dependency)',
    ],
    investmentThesis: 'Global pharma play with US exposure. Recovery from past issues and specialty pharma growth.',
    bulletPoints: [
      '✓ Second largest pharma company',
      '✓ Specialty pharma growth',
      '✓ Global diversification',
      '✗ Generic pricing pressure',
      '✗ FDA compliance risks',
    ],
  },

  'ULTRACEMCO.NS': {
    name: 'UltraTech Cement Ltd',
    sector: 'Cement',
    subsector: 'Cement & Building Materials',
    marketCap: 'Large Cap',
    keyMetrics: {
      peRatio: 16.8,
      pbRatio: 2.1,
      roE: 12.6,
      roA: 3.4,
      debtToEquity: 0.45,
    },
    businessHighlights: [
      'India\'s largest cement manufacturer',
      'Diversified capacity across regions',
      'Cost efficiency and vertical integration',
      'Infrastructure and real estate exposure',
    ],
    keyDrivers: [
      'Cement volume growth from infrastructure',
      'Capacity utilization and pricing',
      'Cost management (energy, fuel)',
      'Infrastructure and housing demand',
      'Export opportunities',
    ],
    risks: [
      'Cyclical cement industry downturn',
      'Fuel and energy cost volatility',
      'Infrastructure spending slowdown',
      'Excess capacity and competition',
      'Environmental compliance',
    ],
    investmentThesis: 'Infrastructure cycle play. Market leader with cost advantage and pricing power.',
    bulletPoints: [
      '✓ Market leader in cement',
      '✓ Cost efficiency leadership',
      '✓ Capacity scale',
      '✗ Cyclical downturn risk',
      '✗ Energy cost volatility',
    ],
  },

  'NESTLEIND.NS': {
    name: 'Nestle India Ltd',
    sector: 'FMCG',
    subsector: 'Food & Beverages',
    marketCap: 'Large Cap',
    keyMetrics: {
      peRatio: 35.2,
      pbRatio: 12.1,
      roE: 38.2,
      roA: 15.8,
      debtToEquity: 0.05,
    },
    businessHighlights: [
      'India\'s premium food and beverage company',
      'Strong global brand recognition',
      'Diversified product portfolio',
      'High profitability and quality',
    ],
    keyDrivers: [
      'Premium product volume growth',
      'Price realization and mix improvement',
      'New product launches',
      'Export expansion',
      'E-commerce channel growth',
    ],
    risks: [
      'Input cost inflation (milk, cocoa)',
      'Premium product demand slowdown',
      'Consumer price sensitivity',
      'Competition from local brands',
      'Regulatory changes on nutrition',
    ],
    investmentThesis: 'Premium quality consumption with pricing power. Highest ROE among peers.',
    bulletPoints: [
      '✓ Highest quality and brand',
      '✓ Superior profitability',
      '✓ Pricing power',
      '✗ Premium valuations',
      '✗ Limited volume growth',
    ],
  },

  'BAJFINANCE.NS': {
    name: 'Bajaj Finance Ltd',
    sector: 'Finance',
    subsector: 'Non-Banking Finance / Lending',
    marketCap: 'Large Cap',
    keyMetrics: {
      peRatio: 24.5,
      pbRatio: 4.1,
      roE: 18.2,
      roA: 3.5,
      debtToEquity: 2.8,
    },
    businessHighlights: [
      'India\'s largest non-bank finance company',
      'Diversified lending portfolio',
      'Digital-first and mobile-centric',
      'Insurance and investment products',
    ],
    keyDrivers: [
      'Loan portfolio growth across segments',
      'Credit quality and NPA management',
      'Funding costs and spread management',
      'Digital customer acquisition',
      'Fee and insurance income',
    ],
    risks: [
      'Macro slowdown impact on credit demand',
      'Rising credit costs',
      'Competition from banks and fintechs',
      'Regulatory tightening on NBFC',
      'Asset quality deterioration',
    ],
    investmentThesis: 'NBFC market leader with strong growth and profitability. Digital capabilities provide edge.',
    bulletPoints: [
      '✓ Market leader in NBFC',
      '✓ Strong growth trajectory',
      '✓ Digital innovation',
      '✗ Rising credit costs',
      '✗ Regulatory risks',
    ],
  },

  'HCLTECH.NS': {
    name: 'HCL Technologies Ltd',
    sector: 'IT Services',
    subsector: 'Software Services / Consulting',
    marketCap: 'Large Cap',
    keyMetrics: {
      peRatio: 19.2,
      pbRatio: 3.8,
      roE: 15.8,
      roA: 5.2,
      debtToEquity: 0.12,
    },
    businessHighlights: [
      'Global IT services and infrastructure',
      'Engineering and R&D services focus',
      'Mode 3 services strategy',
      'Platform-driven offerings',
    ],
    keyDrivers: [
      'Engineering and R&D services growth',
      'Cloud and infrastructure revenue',
      'Consulting services expansion',
      'Large deal wins and revenue stability',
      'Margin improvement',
    ],
    risks: [
      'Macro slowdown impact on IT spending',
      'Pricing pressure and competition',
      'Talent retention and cost inflation',
      'Customer concentration',
      'Currency volatility',
    ],
    investmentThesis: 'IT services player with engineering and R&D focus. Selective growth in specialized services.',
    bulletPoints: [
      '✓ Engineering services differentiation',
      '✓ Strong margin potential',
      '✓ Reasonable valuations',
      '✗ Macro IT spending risk',
      '✗ Attrition challenges',
    ],
  },

  'TECHM.NS': {
    name: 'Tech Mahindra Ltd',
    sector: 'IT Services',
    subsector: 'Software Services / Consulting',
    marketCap: 'Large Cap',
    keyMetrics: {
      peRatio: 17.8,
      pbRatio: 2.9,
      roE: 14.2,
      roA: 4.8,
      debtToEquity: 0.08,
    },
    businessHighlights: [
      'Global IT services company',
      'Telecom and digital services focus',
      'Network services and security',
      'Cloud and AI solutions',
    ],
    keyDrivers: [
      'Telecom services revenue growth',
      'Digital transformation spending',
      'Network and security services',
      'Cloud and AI adoption',
      'Margin expansion from scale',
    ],
    risks: [
      'Telecom sector slowdown impact',
      'Macro IT spending cyclicality',
      'Competition from larger peers',
      'Integration risks from acquisitions',
      'Talent retention',
    ],
    investmentThesis: 'Telecom-focused IT services with digital capabilities. Mid-tier player with selective growth.',
    bulletPoints: [
      '✓ Telecom sector exposure',
      '✓ Digital services focus',
      '✓ Reasonable valuations',
      '✗ Telecom revenue pressure',
      '✗ Integration risks',
    ],
  },
};

/**
 * Get company-specific analysis
 */
function getCompanyAnalysis(symbol) {
  return COMPANY_ANALYSIS_DB[symbol] || null;
}

/**
 * Get sector-wide insights
 */
function getSectorInsights(sector) {
  const sectorCompanies = Object.values(COMPANY_ANALYSIS_DB).filter(
    comp => comp.sector === sector
  );
  
  if (sectorCompanies.length === 0) {
    return null;
  }

  const avgPE = sectorCompanies.reduce((sum, c) => sum + c.keyMetrics.peRatio, 0) / sectorCompanies.length;
  const avgROE = sectorCompanies.reduce((sum, c) => sum + c.keyMetrics.roE, 0) / sectorCompanies.length;
  
  return {
    sector,
    companies: sectorCompanies.length,
    avgPE: avgPE.toFixed(1),
    avgROE: avgROE.toFixed(1),
    companies: sectorCompanies,
  };
}

/**
 * Enhance prediction with company analysis
 */
function enhancePredictionWithAnalysis(prediction, symbol) {
  const analysis = getCompanyAnalysis(symbol);
  
  if (!analysis) {
    return prediction;
  }

  return {
    ...prediction,
    companyAnalysis: {
      businessHighlights: analysis.businessHighlights,
      keyDrivers: analysis.keyDrivers,
      risks: analysis.risks,
      investmentThesis: analysis.investmentThesis,
      bulletPoints: analysis.bulletPoints,
      sector: analysis.sector,
      subsector: analysis.subsector,
      keyMetrics: analysis.keyMetrics,
    },
  };
}

module.exports = {
  getCompanyAnalysis,
  getSectorInsights,
  enhancePredictionWithAnalysis,
  COMPANY_ANALYSIS_DB,
};
