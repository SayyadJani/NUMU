// Live verification of Python, C++, and JavaScript against NUMU API

const BASE_URL = 'http://localhost:4000/api/v1';

async function login() {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: 'alex.rivera@numu.io',
      password: 'Password123!',
    }),
  });

  const data = await res.json();
  if (res.status !== 200 || !data.data?.accessToken) {
    throw new Error(`Login failed: ${JSON.stringify(data)}`);
  }
  return data.data.accessToken;
}

async function testLanguage(token, lang, code, problemSlug = 'two-sum') {
  console.log(`\n========================================`);
  console.log(`Testing Language: ${lang.toUpperCase()} on Problem: ${problemSlug}`);
  console.log(`========================================`);

  try {
    // 1. Test Run
    console.log(`--- [1/2] RUN CODE ---`);
    const runRes = await fetch(`${BASE_URL}/submissions/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        problemSlug,
        language: lang,
        code,
      }),
    });

    const runData = await runRes.json();
    console.log(`Run HTTP Status:`, runRes.status);
    console.log(`Overall Verdict:`, runData.verdict);
    console.log(`Tests Passed:`, `${runData.testsPassed} / ${runData.totalTests}`);
    console.log(`Runtime:`, `${runData.runtimeMs}ms`);
    console.log(`Memory:`, `${runData.memoryKb}KB`);
    if (runData.compileError) console.log(`Compile Error:`, runData.compileError);
    if (runData.stderr) console.log(`Stderr:`, runData.stderr);

    if (runData.testCases && runData.testCases.length > 0) {
      console.log(`Sample Test Case 1:`);
      console.log(`  Input:`, runData.testCases[0].input);
      console.log(`  Expected:`, runData.testCases[0].expectedOutput);
      console.log(`  User Output:`, runData.testCases[0].userOutput);
      console.log(`  Verdict:`, runData.testCases[0].status);
    }

    const runSuccess = runData.verdict === 'ACCEPTED';

    // 2. Test Submit
    console.log(`--- [2/2] SUBMIT CODE ---`);
    const submitRes = await fetch(`${BASE_URL}/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        problemSlug,
        language: lang,
        code,
      }),
    });

    const submitData = await submitRes.json();
    console.log(`Submit HTTP Status:`, submitRes.status);
    console.log(`Overall Verdict:`, submitData.verdict);
    console.log(`Tests Passed:`, `${submitData.testsPassed} / ${submitData.totalTests}`);
    console.log(`Runtime:`, `${submitData.runtimeMs}ms`);
    console.log(`Memory:`, `${submitData.memoryKb}KB`);
    if (submitData.compileError) console.log(`Compile Error:`, submitData.compileError);
    if (submitData.stderr) console.log(`Stderr:`, submitData.stderr);

    const submitSuccess = submitData.verdict === 'ACCEPTED';

    return runSuccess && submitSuccess;
  } catch (err) {
    console.error(`Error testing ${lang}:`, err);
    return false;
  }
}

async function run() {
  console.log('Logging in as alex.rivera@numu.io...');
  const token = await login();
  console.log('Login successful! Access token obtained.');

  const pyCode = `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        seen = {}
        for i, num in enumerate(nums):
            diff = target - num
            if diff in seen:
                return [seen[diff], i]
            seen[num] = i
        return []`;

  const cppCode = `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> seen;
        for (int i = 0; i < (int)nums.size(); ++i) {
            int diff = target - nums[i];
            if (seen.count(diff)) return {seen[diff], i};
            seen[nums[i]] = i;
        }
        return {};
    }
};`;

  const jsCode = `function twoSum(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const diff = target - nums[i];
        if (map.has(diff)) return [map.get(diff), i];
        map.set(nums[i], i);
    }
    return [];
}`;

  const pyPassed = await testLanguage(token, 'python', pyCode);
  const cppPassed = await testLanguage(token, 'cpp', cppCode);
  const jsPassed = await testLanguage(token, 'javascript', jsCode);

  console.log(`\n========================================`);
  console.log(`SUMMARY RESULTS:`);
  console.log(`  Python:     ${pyPassed ? '✅ RUN & SUBMIT PASSED' : '❌ FAILED'}`);
  console.log(`  C++:        ${cppPassed ? '✅ RUN & SUBMIT PASSED' : '❌ FAILED'}`);
  console.log(`  JavaScript: ${jsPassed ? '✅ RUN & SUBMIT PASSED' : '❌ FAILED'}`);
  console.log(`========================================\n`);

  if (!pyPassed || !cppPassed || !jsPassed) {
    process.exit(1);
  }
}

run();
