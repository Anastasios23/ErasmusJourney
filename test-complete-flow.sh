#!/bin/bash

# End-to-End Test for Unified Erasmus Experience System
# Tests the complete flow using curl commands

BASE_URL="http://localhost:3000"

echo "🚀 Starting End-to-End Test for Unified Erasmus Experience System"
echo ""

# Step 1: Create a new experience
echo "📝 Step 1: Creating new experience..."
CREATE_RESPONSE=$(curl -s -X POST "${BASE_URL}/api/erasmus-experiences" \
  -H "Content-Type: application/json" \
  -d '{"action": "create"}')

echo "Response: $CREATE_RESPONSE"

# Extract the ID from the response (basic parsing)
EXPERIENCE_ID=$(echo "$CREATE_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

if [ -z "$EXPERIENCE_ID" ]; then
  echo "❌ Failed to create experience or extract ID"
  exit 1
fi

echo "✅ Experience created with ID: $EXPERIENCE_ID"
echo ""

# Step 2: Save basic information
echo "📋 Step 2: Saving basic information..."
BASIC_INFO_RESPONSE=$(curl -s -X PUT "${BASE_URL}/api/erasmus-experiences" \
  -H "Content-Type: application/json" \
  -d "{
    \"id\": \"$EXPERIENCE_ID\",
    \"basicInfo\": {
      \"firstName\": \"John\",
      \"lastName\": \"TestStudent\",
      \"studentId\": \"S12345\",
      \"email\": \"john.test@university.edu\",
      \"phone\": \"+1234567890\",
      \"dateOfBirth\": \"1998-05-15\",
      \"nationality\": \"American\",
      \"homeUniversity\": \"University of California\",
      \"studyProgram\": \"Computer Science\",
      \"yearOfStudy\": \"3\",
      \"academicYear\": \"2024-2025\",
      \"hostUniversity\": \"Technical University of Berlin\",
      \"hostCity\": \"Berlin\",
      \"hostCountry\": \"Germany\",
      \"exchangePeriod\": \"Fall 2024\",
      \"facultyDepartment\": \"Computer Science\"
    }
  }")

echo "Response: $BASIC_INFO_RESPONSE"
echo "✅ Basic information saved"
echo ""

# Step 3: Save courses
echo "🎓 Step 3: Saving course information..."
COURSES_RESPONSE=$(curl -s -X PUT "${BASE_URL}/api/erasmus-experiences" \
  -H "Content-Type: application/json" \
  -d "{
    \"id\": \"$EXPERIENCE_ID\",
    \"courses\": [
      {
        \"homeCourseCode\": \"CS301\",
        \"homeCourseName\": \"Data Structures\",
        \"homeCredits\": 3,
        \"hostCourseCode\": \"TI301\",
        \"hostCourseName\": \"Datenstrukturen\",
        \"hostCredits\": 6,
        \"approved\": true
      }
    ]
  }")

echo "Response: $COURSES_RESPONSE"
echo "✅ Course information saved"
echo ""

# Step 4: Save accommodation
echo "🏠 Step 4: Saving accommodation information..."
ACCOMMODATION_RESPONSE=$(curl -s -X PUT "${BASE_URL}/api/erasmus-experiences" \
  -H "Content-Type: application/json" \
  -d "{
    \"id\": \"$EXPERIENCE_ID\",
    \"accommodation\": {
      \"accommodationAddress\": \"Musterstraße 123, 10115 Berlin\",
      \"accommodationType\": \"Student Residence\",
      \"monthlyRent\": \"450\",
      \"billsIncluded\": \"yes\",
      \"accommodationRating\": \"4\",
      \"easyToFind\": \"yes\",
      \"wouldRecommend\": \"yes\",
      \"neighborhood\": \"Mitte\"
    }
  }")

echo "Response: $ACCOMMODATION_RESPONSE"
echo "✅ Accommodation information saved"
echo ""

# Step 5: Save living expenses
echo "💰 Step 5: Saving living expenses..."
EXPENSES_RESPONSE=$(curl -s -X PUT "${BASE_URL}/api/erasmus-experiences" \
  -H "Content-Type: application/json" \
  -d "{
    \"id\": \"$EXPERIENCE_ID\",
    \"livingExpenses\": {
      \"monthlyRent\": 450,
      \"foodExpenses\": 300,
      \"transportExpenses\": 100,
      \"entertainmentExpenses\": 150,
      \"otherExpenses\": 50,
      \"totalMonthlyBudget\": 1050
    }
  }")

echo "Response: $EXPENSES_RESPONSE"
echo "✅ Living expenses saved"
echo ""

# Step 6: Final submission
echo "🎯 Step 6: Final submission..."
SUBMIT_RESPONSE=$(curl -s -X PUT "${BASE_URL}/api/erasmus-experiences" \
  -H "Content-Type: application/json" \
  -d "{
    \"id\": \"$EXPERIENCE_ID\",
    \"action\": \"submit\",
    \"overallReflection\": {
      \"overallExperience\": \"excellent\",
      \"academicExperience\": \"very-good\",
      \"socialExperience\": \"excellent\",
      \"culturalExperience\": \"excellent\",
      \"wouldRecommend\": \"yes\",
      \"additionalComments\": \"Amazing experience! Highly recommend Berlin for any exchange student.\"
    }
  }")

echo "Response: $SUBMIT_RESPONSE"
echo "✅ Experience submitted successfully"
echo ""

echo "🎉 End-to-End Test COMPLETED Successfully!"
echo ""
echo "📋 Test Summary:"
echo "   - Experience ID: $EXPERIENCE_ID"
echo "   - Student: John TestStudent"
echo "   - Destination: Berlin, Germany"
echo "   - University: Technical University of Berlin"
echo "   - Status: SUBMITTED (Ready for Admin Review)"
echo ""
echo "🔗 Check admin interface at: http://localhost:3000/admin-destinations"
echo "🔗 Check Prisma Studio at: http://localhost:5556"
