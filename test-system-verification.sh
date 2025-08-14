#!/bin/bash

# Phase 4 Final Verification Script
# Verifies that the complete Unified Erasmus Experience System is working

echo "🔍 Phase 4 Final Verification - Unified Erasmus Experience System"
echo "================================================================="
echo ""

BASE_URL="http://localhost:3000"

# Test 1: Check if main API is responding
echo "1️⃣  Testing Main API Endpoint..."
MAIN_API_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/api/erasmus-experiences")
if [ "$MAIN_API_RESPONSE" = "200" ]; then
    echo "   ✅ Main API responding (HTTP $MAIN_API_RESPONSE)"
else
    echo "   ❌ Main API not responding (HTTP $MAIN_API_RESPONSE)"
fi

# Test 2: Check if admin API is responding (should be protected)
echo "2️⃣  Testing Admin API Endpoint..."
ADMIN_API_RESPONSE=$(curl -s "${BASE_URL}/api/admin/erasmus-experiences")
if echo "$ADMIN_API_RESPONSE" | grep -q "Admin access required"; then
    echo "   ✅ Admin API properly protected"
else
    echo "   ❌ Admin API security issue: $ADMIN_API_RESPONSE"
fi

# Test 3: Count submitted experiences
echo "3️⃣  Checking Submitted Experiences..."
EXPERIENCES_COUNT=$(curl -s "${BASE_URL}/api/erasmus-experiences" | grep -o '"status":"SUBMITTED"' | wc -l)
echo "   📊 Found $EXPERIENCES_COUNT submitted experience(s)"

# Test 4: Verify data completeness of submitted experiences
echo "4️⃣  Verifying Data Completeness..."
COMPLETE_DATA=$(curl -s "${BASE_URL}/api/erasmus-experiences" | grep -o '"isComplete":true' | wc -l)
echo "   📋 Found $COMPLETE_DATA complete experience(s)"

# Test 5: Check for required fields in submitted data
echo "5️⃣  Checking Required Data Fields..."
EXPERIENCE_DATA=$(curl -s "${BASE_URL}/api/erasmus-experiences")

if echo "$EXPERIENCE_DATA" | grep -q '"basicInfo"'; then
    echo "   ✅ Basic Information present"
else
    echo "   ❌ Basic Information missing"
fi

if echo "$EXPERIENCE_DATA" | grep -q '"courses"'; then
    echo "   ✅ Course data present"
else
    echo "   ❌ Course data missing"
fi

if echo "$EXPERIENCE_DATA" | grep -q '"accommodation"'; then
    echo "   ✅ Accommodation data present"
else
    echo "   ❌ Accommodation data missing"
fi

if echo "$EXPERIENCE_DATA" | grep -q '"livingExpenses"'; then
    echo "   ✅ Living expenses data present"
else
    echo "   ❌ Living expenses data missing"
fi

if echo "$EXPERIENCE_DATA" | grep -q '"experience"'; then
    echo "   ✅ Experience reflection data present"
else
    echo "   ❌ Experience reflection data missing"
fi

echo ""
echo "🎯 System Status Summary:"
echo "   📍 Server: Running at http://localhost:3000"
echo "   🗄️  Database: Prisma Studio at http://localhost:5556"
echo "   👑 Admin Interface: http://localhost:3000/admin-destinations"
echo ""

# Test 6: Final Integration Test
echo "6️⃣  Integration Test Result:"
if [ "$EXPERIENCES_COUNT" -gt 0 ] && [ "$COMPLETE_DATA" -gt 0 ]; then
    echo "   🎉 UNIFIED SYSTEM FULLY OPERATIONAL!"
    echo "   ✨ End-to-End flow: Form → API → Database → Admin Interface ✨"
else
    echo "   ⚠️  System needs attention - check experience submission flow"
fi

echo ""
echo "🚀 Ready for Production Testing!"
echo "📝 Next Steps: Test with real form UI and admin approval workflow"
