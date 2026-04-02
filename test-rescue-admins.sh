#!/bin/bash
# Test script for rescue admins feature
# Run this after applying the migration to verify everything works

set -e

echo "==================================="
echo "Testing Rescue Admins Feature"
echo "==================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run SQL and check result
run_test() {
    local test_name=$1
    local sql_query=$2
    local expected_result=$3
    
    echo -e "\n${YELLOW}Test: ${test_name}${NC}"
    
    result=$(docker exec supabase_db_dog-adopt psql -U postgres -d postgres -t -c "$sql_query" 2>&1 || echo "ERROR")
    
    if echo "$result" | grep -q "$expected_result"; then
        echo -e "${GREEN}✓ PASSED${NC}"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        echo "Expected: $expected_result"
        echo "Got: $result"
        ((TESTS_FAILED++))
        return 1
    fi
}

# Test 1: Check rescue_admins table exists
run_test "rescue_admins table exists" \
    "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='dogadopt' AND table_name='rescue_admins';" \
    "1"

# Test 2: Check rescue_admins has correct columns
run_test "rescue_admins has required columns" \
    "SELECT COUNT(*) FROM information_schema.columns WHERE table_schema='dogadopt' AND table_name='rescue_admins' AND column_name IN ('id', 'user_id', 'rescue_id', 'granted_at', 'granted_by', 'notes');" \
    "6"

# Test 3: Check is_rescue_admin function exists
run_test "is_rescue_admin function exists" \
    "SELECT COUNT(*) FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE n.nspname = 'dogadopt' AND p.proname = 'is_rescue_admin';" \
    "1"

# Test 4: Check RLS is enabled on rescue_admins
run_test "RLS enabled on rescue_admins" \
    "SELECT relrowsecurity FROM pg_class WHERE relname = 'rescue_admins';" \
    "t"

# Test 5: Check rescue admin policies on rescues table
run_test "Rescue admin policy exists on rescues" \
    "SELECT COUNT(*) FROM pg_policies WHERE schemaname='dogadopt' AND tablename='rescues' AND policyname LIKE '%Rescue admin%';" \
    "1"

# Test 6: Check rescue admin policies on dogs table
run_test "Rescue admin policies exist on dogs" \
    "SELECT COUNT(*) FROM pg_policies WHERE schemaname='dogadopt' AND tablename='dogs' AND policyname LIKE '%Rescue admin%';" \
    "3"

# Test 7: Check indexes exist
run_test "Indexes exist on rescue_admins" \
    "SELECT COUNT(*) FROM pg_indexes WHERE schemaname='dogadopt' AND tablename='rescue_admins';" \
    "2"

# Test 8: Check rescues with emails
echo -e "\n${YELLOW}Info: Rescues with contact emails${NC}"
docker exec supabase_db_dog-adopt psql -U postgres -d postgres -c \
    "SELECT COUNT(*) as rescues_with_email FROM dogadopt.rescues WHERE email IS NOT NULL;"

# Test 9: Check rescue_admins populated
echo -e "\n${YELLOW}Info: Rescue admins created${NC}"
docker exec supabase_db_dog-adopt psql -U postgres -d postgres -c \
    "SELECT COUNT(*) as rescue_admin_count FROM dogadopt.rescue_admins;"

# Test 10: Sample rescue admin records
echo -e "\n${YELLOW}Info: Sample rescue admin records${NC}"
docker exec supabase_db_dog-adopt psql -U postgres -d postgres -c \
    "SELECT r.name, u.email FROM dogadopt.rescue_admins ra JOIN dogadopt.rescues r ON ra.rescue_id = r.id JOIN auth.users u ON ra.user_id = u.id LIMIT 5;"

echo ""
echo "==================================="
echo "Test Summary"
echo "==================================="
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}All tests passed! ✓${NC}"
    exit 0
else
    echo -e "\n${RED}Some tests failed! ✗${NC}"
    exit 1
fi
