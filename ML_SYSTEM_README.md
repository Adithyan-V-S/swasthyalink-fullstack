# Machine Learning Health Analytics System

## Overview

This comprehensive ML-powered health analytics system provides AI-driven health risk assessment, predictive analytics, and personalized recommendations for the Swasthyalink healthcare platform.

## Features

### 🔍 Health Risk Assessment
- Real-time health risk calculation based on multiple factors
- Disease-specific risk predictions (cardiovascular, diabetes, stroke)
- Comprehensive health scoring system
- Data validation and normalization

### 📊 Predictive Analytics
- Health trend analysis from historical data
- Future health predictions
- Statistical analysis of health metrics
- Pattern recognition and anomaly detection

### 🎯 Personalized Recommendations
- Immediate action items
- Short-term and long-term health goals
- Lifestyle modification suggestions
- Custom insights based on individual health data

### 📈 Interactive Dashboard
- Real-time health metrics visualization
- Interactive charts and graphs
- Comprehensive health reports
- User-friendly data input forms

## Architecture

### Backend Components

#### 1. ML Services (`backend/src/services/ml/`)
- **predictiveAnalytics.js**: Core predictive analytics engine
- Handles health trend predictions and risk calculations
- Integrates with various ML algorithms

#### 2. ML Models (`backend/src/models/`)
- **healthRiskModel.js**: Disease risk prediction models
- Supports multiple disease types
- Configurable risk thresholds and interpretations

#### 3. ML Utilities (`backend/src/utils/`)
- **mlHelpers.js**: Helper functions for data processing
- BMI calculations, health score computations
- Data validation and normalization utilities

#### 4. API Endpoints (`backend/server.js`)
- `/api/ml/health-risk-assessment`: Comprehensive health risk analysis
- `/api/ml/health-trends`: Predictive trend analysis
- `/api/ml/disease-risk/:diseaseType`: Disease-specific risk predictions
- `/api/ml/health-stats`: Statistical analysis of health data
- `/api/ml/health-recommendations`: Personalized recommendations
- `/api/ml/validate-health-data`: Health data validation

### Frontend Components

#### 1. ML Service (`frontend/src/services/mlService.js`)
- Frontend API client for ML endpoints
- Data formatting and validation
- Comprehensive health analysis orchestration

#### 2. Dashboard Components
- **HealthAnalyticsDashboard.jsx**: Main dashboard with data input and results
- **HealthMetricsChart.jsx**: Interactive charts for health trends
- **HealthRiskSummary.jsx**: Quick overview of health risks and scores

#### 3. Analytics Page (`frontend/src/pages/HealthAnalytics.jsx`)
- Complete health analytics interface
- Tabbed navigation for different views
- Real-time data processing and visualization

## Installation & Setup

### Backend Setup

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Install ML Dependencies**
   ```bash
   npm install natural compromise simple-statistics ml-regression ml-confusion-matrix
   ```

3. **Start Backend Server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Start Frontend Server**
   ```bash
   npm run dev
   ```

## Usage

### Basic Health Assessment

```javascript
import mlService from './services/mlService';

// Sample health data
const healthData = {
  age: 45,
  gender: 'male',
  height: 175,
  weight: 80,
  bloodPressure: { systolic: 135, diastolic: 85 },
  cholesterol: 220,
  glucose: 110,
  smoking: 'former',
  exercise: 'occasional'
};

// Get comprehensive health analysis
const analysis = await mlService.getComprehensiveHealthAnalysis(healthData);
console.log(analysis);
```

### API Endpoints Usage

#### Health Risk Assessment
```bash
POST /api/ml/health-risk-assessment
Content-Type: application/json

{
  "age": 45,
  "gender": "male",
  "height": 175,
  "weight": 80,
  "bloodPressure": {"systolic": 135, "diastolic": 85},
  "cholesterol": 220,
  "glucose": 110,
  "smoking": "former",
  "exercise": "occasional"
}
```

#### Health Trends Prediction
```bash
POST /api/ml/health-trends
Content-Type: application/json

{
  "historicalData": [...],
  "userId": "user123"
}
```

#### Disease Risk Prediction
```bash
POST /api/ml/disease-risk/cardiovascular
Content-Type: application/json

{
  "age": 45,
  "bloodPressure": {"systolic": 135, "diastolic": 85},
  "cholesterol": 220,
  "smoking": "former"
}
```

## Health Metrics Supported

### Primary Metrics
- **Age**: Chronological age in years
- **Gender**: Male, Female, Other
- **Height**: Height in centimeters
- **Weight**: Weight in kilograms
- **BMI**: Body Mass Index (calculated)

### Vital Signs
- **Blood Pressure**: Systolic and diastolic readings
- **Heart Rate**: Beats per minute
- **Temperature**: Body temperature

### Laboratory Values
- **Cholesterol**: Total cholesterol level
- **Glucose**: Blood glucose level
- **HDL/LDL**: Cholesterol subtypes
- **Triglycerides**: Blood lipid levels

### Lifestyle Factors
- **Smoking Status**: Never, Former, Current
- **Exercise Level**: Regular, Occasional, Sedentary
- **Alcohol Consumption**: Frequency and amount
- **Sleep Quality**: Hours and quality rating

## Risk Assessment Algorithm

### Health Score Calculation
The system calculates an overall health score (0-100) based on:

1. **Age Factor** (15% weight)
   - Optimal age range: 25-45
   - Penalty for ages outside optimal range

2. **BMI Factor** (20% weight)
   - Optimal BMI: 18.5-24.9
   - Underweight (<18.5): 30 points
   - Normal (18.5-24.9): 50 points
   - Overweight (25-29.9): 70 points
   - Obese (≥30): 90 points

3. **Blood Pressure Factor** (25% weight)
   - Normal (<120/80): 20 points
   - Elevated (120-129/<80): 40 points
   - Stage 1 (130-139/80-89): 60 points
   - Stage 2 (≥140/≥90): 80 points
   - Crisis (≥180/≥120): 100 points

4. **Lifestyle Factors** (30% weight)
   - Smoking: Never (10), Former (30), Current (80)
   - Exercise: Regular (20), Occasional (50), Sedentary (80)

5. **Lab Values** (10% weight)
   - Cholesterol: <200 (20), 200-239 (50), ≥240 (80)
   - Glucose: <100 (20), 100-125 (50), ≥126 (80)

### Risk Categories
- **Excellent** (0-30): Outstanding health indicators
- **Good** (31-50): Generally healthy with minor concerns
- **Fair** (51-70): Some health factors need attention
- **Poor** (71-100): Multiple health concerns present

## Predictive Analytics

### Trend Analysis
- Analyzes historical health data patterns
- Identifies increasing, decreasing, or stable trends
- Provides statistical summaries and predictions

### Disease Risk Models
- **Cardiovascular Disease**: Based on age, BP, cholesterol, smoking
- **Diabetes**: Based on age, BMI, glucose, family history
- **Stroke**: Based on age, BP, smoking, cholesterol

### Statistical Analysis
- Mean, median, and standard deviation calculations
- Trend detection algorithms
- Anomaly detection for unusual health readings

## Security & Privacy

### Data Protection
- All health data is encrypted in transit and at rest
- User authentication required for all ML operations
- Data anonymization for analytics processing

### Compliance
- HIPAA compliance considerations
- GDPR data protection standards
- Local healthcare regulations adherence

## Performance Optimization

### Caching
- ML model results cached for 24 hours
- Historical data cached for faster trend analysis
- API response caching for improved performance

### Scalability
- Horizontal scaling support for ML services
- Load balancing for high-traffic periods
- Asynchronous processing for complex calculations

## Monitoring & Analytics

### System Monitoring
- ML model performance tracking
- API response time monitoring
- Error rate and failure tracking

### User Analytics
- Health assessment completion rates
- User engagement with recommendations
- Popular health metrics tracking

## Future Enhancements

### Planned Features
- Integration with wearable device data
- Advanced ML models (neural networks, deep learning)
- Real-time health monitoring alerts
- Integration with electronic health records (EHR)
- Multi-language support for global users

### Research Integration
- Latest medical research incorporation
- Clinical trial data integration
- Evidence-based recommendation engine

## Support & Documentation

### API Documentation
- Complete REST API documentation available
- Interactive API testing interface
- Code examples in multiple programming languages

### User Guides
- Healthcare provider integration guide
- Patient user manual
- System administration documentation

## Contributing

### Development Setup
1. Fork the repository
2. Create feature branch
3. Implement changes with tests
4. Submit pull request with documentation

### Code Standards
- ESLint and Prettier configuration
- Unit and integration tests required
- Documentation updates mandatory

## License

This ML health analytics system is part of the Swasthyalink platform and is licensed under the MIT License.

## Contact

For technical support or questions about the ML system:
- Email: ml-support@swasthyalink.com
- Documentation: https://docs.swasthyalink.com/ml-system
- GitHub Issues: https://github.com/swasthyalink/ml-system/issues

---

**Note**: This system is designed to assist healthcare decisions but should not replace professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare providers for medical concerns.
