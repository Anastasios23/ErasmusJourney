# Erasmus Journey - Dynamic Destination System

## Overview

This system generates dynamic destination cards based on real student form submissions collected through the platform. When students share their experiences via the enhanced forms, their data is aggregated to create compelling destination recommendations for future Erasmus students.

## How It Works

### 1. Data Collection

Students fill out three enhanced forms:

- **Basic Information** (`/basic-information`) - Personal details, university selection, exchange planning
- **Accommodation** (`/accommodation`) - Housing experiences, costs, contacts
- **Living Expenses** (`/living-expenses`) - Monthly costs, budget tips, lifestyle data

### 2. Data Aggregation

The destinations API (`/api/destinations`) processes all form submissions and:

- Groups data by city/country combinations
- Calculates average costs (rent + living expenses)
- Determines cost levels (low < €400, medium < €700, high ≥€700)
- Counts student experiences per destination
- Generates ratings and descriptions

### 3. Dynamic Display

The destinations page (`/destinations`) shows:

- **Real destination cards** based on actual student data
- **Cost information** averaged from real experiences
- **Student counts** showing how many students shared experiences
- **Smart empty states** when no data exists yet

## Key Features

### Enhanced Form Components

All forms use a comprehensive component library:

- `EnhancedInput` - Smart text inputs with validation
- `EnhancedSelect` - Cascading dropdowns with country/university relationships
- `EnhancedTextarea` - Rich text areas for experiences
- `FormField` - Consistent field layouts with labels and validation
- `FormSection` - Organized form sections with clear headers
- `FormGrid` - Responsive grid layouts for complex forms

### Testing & Development

- **Dev Tools Page** (`/dev-tools`) - Generate realistic fake data for testing
- **Fake Data Generator** (`/api/test-data/generate-fake-submissions`) - Creates sample submissions for 6 European cities
- **Sample Destinations**: Berlin, Barcelona, Prague, Amsterdam, Vienna, Lyon

### Visual Assets

Custom SVG illustrations for each destination featuring:

- **Berlin**: Brandenburg Gate and TV Tower
- **Barcelona**: Sagrada Familia spires
- **Prague**: Castle and Charles Bridge
- **Amsterdam**: Canal houses and windmill
- **Vienna**: St. Stephen's Cathedral and imperial architecture
- **Lyon**: Basilique Notre-Dame de Fourvière

## Database Schema

### FormSubmission Model

```typescript
{
  id: string;
  userId: string;
  formType: "basic-info" | "accommodation" | "living-expenses";
  data: JSON; // Contains all form fields
  createdAt: DateTime;
  updatedAt: DateTime;
}
```

### Key Data Fields

- **Basic Info**: City, country, university, exchange duration
- **Accommodation**: Rent, type, area, contact details
- **Living Expenses**: Monthly costs by category, budget tips

## API Endpoints

### GET /api/destinations

Returns aggregated destination data:

```typescript
{
  destinations: Array<{
    city: string;
    country: string;
    studentCount: number;
    avgRent: number;
    avgLivingExpenses: number;
    avgCostPerMonth: number;
    costLevel: "low" | "medium" | "high";
    rating: number;
    universities: string[];
    description: string;
    highlights: string[];
    image: string;
  }>;
}
```

### POST /api/test-data/generate-fake-submissions

Generates realistic test data for development:

```typescript
{
  message: string;
  results: {
    users: number;
    basicInfo: number;
    accommodations: number;
    livingExpenses: number;
    destinations: Array<{ city: string; students: number }>;
  }
}
```

## Getting Started

### 1. View Current State

Visit `/destinations` to see current destination data (likely empty initially)

### 2. Generate Test Data

1. Go to `/dev-tools`
2. Click "Generate Fake Submissions"
3. Wait for completion message
4. Return to `/destinations` to see generated destination cards

### 3. Add Real Data

Encourage students to fill out:

1. `/basic-information` - Start their journey
2. `/accommodation` - Share housing experiences
3. `/living-expenses` - Provide cost insights

## Technical Implementation

### Form Enhancement Progress

- ✅ **Basic Information**: Fully enhanced with cascading selects, validation
- ✅ **Accommodation**: Key sections enhanced, some legacy components remain
- ✅ **Living Expenses**: Enhanced monthly expenses and budget sections

### Data Processing

- Real-time aggregation of form submissions
- Intelligent cost level categorization
- Student count tracking per destination
- University list compilation

### User Experience

- **Loading states** with skeleton components
- **Empty states** with clear calls to action
- **Error handling** with fallback to static data
- **Search and filtering** for easy destination discovery

## Future Enhancements

- Photo uploads for destination galleries
- Student review system
- University-specific data breakdowns
- Seasonal cost variations
- Exchange program filtering
- Student contact matching

## Development Notes

- Uses Next.js with TypeScript
- Prisma ORM with SQLite database
- Tailwind CSS for styling
- Enhanced form components for consistency
- Custom SVG illustrations for visual appeal

This system creates a living, breathing destination guide that grows more valuable as more students share their experiences.
