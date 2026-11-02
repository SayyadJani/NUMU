const BASE_URL = 'http://localhost:4000/api/v1';

async function runTests() {
  console.log('🧪 Starting NUMU Phase 3 End-to-End DSA Problems & Topics API Tests...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} - ${details}`);
      failed++;
    }
  }

  // ─── TEST 1: Topics Catalog & Syllabus ───
  console.log('1. Topics Catalog & Syllabus Endpoints');
  const topicsRes = await fetch(`${BASE_URL}/topics`);
  const topicsData = await topicsRes.json();
  assert(topicsRes.status === 200, 'GET /topics returns 200');
  assert(Array.isArray(topicsData) && topicsData.length >= 8, 'Returns array of at least 8 topics');
  const arraysTopic = topicsData.find((t) => t.slug === 'arrays');
  assert(arraysTopic !== undefined, 'Contains arrays topic');
  assert(typeof arraysTopic.problemCount === 'number' && arraysTopic.problemCount >= 1, 'Topic includes problemCount');

  const topicDetailRes = await fetch(`${BASE_URL}/topics/arrays`);
  const topicDetail = await topicDetailRes.json();
  assert(topicDetailRes.status === 200, 'GET /topics/arrays returns 200');
  assert(topicDetail.slug === 'arrays', 'Returns arrays topic details');
  assert(Array.isArray(topicDetail.problems) && topicDetail.problems.length >= 1, 'Includes topic problem syllabus');

  // ─── TEST 2: Public Problem Catalog & Pagination ───
  console.log('\n2. Public Problem Catalog & Pagination');
  const problemsRes = await fetch(`${BASE_URL}/problems?page=1&limit=10`);
  const problemsData = await problemsRes.json();
  assert(problemsRes.status === 200, 'GET /problems returns 200');
  assert(Array.isArray(problemsData.items), 'Returns items array');
  assert(problemsData.limit === 10, 'Enforces limit parameter');
  assert(problemsData.page === 1, 'Enforces page parameter');
  assert(typeof problemsData.total === 'number', 'Returns exact total count');

  // Verify Draft isolation in public list
  const containsDraft = problemsData.items.some((p) => p.slug === 'draft-advanced-graph-cut');
  assert(!containsDraft, 'Public catalog strictly excludes draft problems (Draft Isolation enforced)');

  // ─── TEST 3: Multi-factor Filtering & Search ───
  console.log('\n3. Multi-factor Filtering & Search');
  // Difficulty filter
  const easyRes = await fetch(`${BASE_URL}/problems?difficulty=EASY`);
  const easyData = await easyRes.json();
  assert(easyRes.status === 200, 'Filter by difficulty=EASY returns 200');
  const allEasy = easyData.items.every((p) => p.difficulty === 'EASY');
  assert(allEasy && easyData.items.length >= 2, 'All returned items have difficulty EASY');

  // Topic filter
  const topicFilterRes = await fetch(`${BASE_URL}/problems?topic=arrays`);
  const topicFilterData = await topicFilterRes.json();
  assert(topicFilterRes.status === 200, 'Filter by topic=arrays returns 200');
  const hasArrays = topicFilterData.items.every((p) =>
    p.topics.some((t) => t.slug === 'arrays'),
  );
  assert(hasArrays && topicFilterData.items.length >= 1, 'All returned items belong to topic arrays');

  // Search filter
  const searchRes = await fetch(`${BASE_URL}/problems?search=water`);
  const searchData = await searchRes.json();
  assert(searchRes.status === 200, 'Search by keyword "water" returns 200');
  assert(
    searchData.items.some((p) => p.slug === 'container-with-most-water'),
    'Search matches "Container With Most Water"',
  );

  // ─── TEST 4: Single Problem Detail Contract ───
  console.log('\n4. Problem Detail Contract & Field Projection');
  const detailRes = await fetch(`${BASE_URL}/problems/two-sum`);
  const detailData = await detailRes.json();
  assert(detailRes.status === 200, 'GET /problems/two-sum returns 200');
  assert(detailData.title === 'Two Sum', 'Returns correct problem title');
  assert(typeof detailData.description === 'string' && detailData.description.length > 20, 'Returns full Markdown statement');
  assert(Array.isArray(detailData.constraints) && detailData.constraints.length >= 1, 'Returns constraints array');
  assert(Array.isArray(detailData.hints) && detailData.hints.length >= 1, 'Returns hints array');
  assert(typeof detailData.boilerplate === 'object' && detailData.boilerplate.python !== undefined, 'Returns multi-language boilerplate');
  assert(Array.isArray(detailData.examples) && detailData.examples.length >= 2, 'Returns structured examples');
  assert(detailData.examples[0].input.includes('nums = [2,7,11,15]'), 'Example input formatted cleanly');
  assert(detailData.author && typeof detailData.author.name === 'string', 'Returns author attribution');

  // Public trying to view Draft problem by slug
  const draftRes = await fetch(`${BASE_URL}/problems/draft-advanced-graph-cut`);
  assert(draftRes.status === 404, 'Unauthenticated lookup of DRAFT problem returns 404 Not Found');

  // ─── TEST 5: RBAC Security & Authorization ───
  console.log('\n5. RBAC Security & Content Management Authorization');

  // Login as Student (Elena)
  const studentLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'elena.rostova@numu.io', password: 'Password123!' }),
  });
  const studentLoginData = await studentLoginRes.json();
  const studentToken = studentLoginData.data.accessToken;

  // Student attempts to create problem
  const studentCreateRes = await fetch(`${BASE_URL}/problems`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentToken}`,
    },
    body: JSON.stringify({
      title: 'Hacked Problem',
      difficulty: 'EASY',
      description: 'Unauthorized creation',
      topicSlugs: ['arrays'],
    }),
  });
  assert(studentCreateRes.status === 403, 'Student cannot create problems (403 Forbidden enforced)');

  // Login as Trainer (Sarah Chen)
  const trainerLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'sarah.chen@numu.io', password: 'Password123!' }),
  });
  const trainerLoginData = await trainerLoginRes.json();
  const trainerToken = trainerLoginData.data.accessToken;

  // Trainer views draft problem by slug
  const trainerDraftRes = await fetch(`${BASE_URL}/problems/draft-advanced-graph-cut`, {
    headers: { Authorization: `Bearer ${trainerToken}` },
  });
  assert(trainerDraftRes.status === 200, 'Trainer can view DRAFT problem details (200 OK)');

  // Trainer creates a new problem
  const newProblemSlug = `test-problem-${Date.now()}`;
  const trainerCreateRes = await fetch(`${BASE_URL}/problems`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${trainerToken}`,
    },
    body: JSON.stringify({
      title: 'Invert Binary Tree',
      slug: newProblemSlug,
      difficulty: 'EASY',
      status: 'PUBLISHED',
      description: 'Given the root of a binary tree, invert the tree, and return its root.',
      constraints: ['The number of nodes in the tree is in the range [0, 100].'],
      topicSlugs: ['trees'],
      examples: [
        { input: 'root = [4,2,7,1,3,6,9]', output: '[4,7,2,9,6,3,1]', order: 1 },
      ],
    }),
  });
  const trainerCreateRaw = await trainerCreateRes.text();
  let trainerCreateData;
  try {
    trainerCreateData = JSON.parse(trainerCreateRaw);
  } catch (err) {
    console.error('Failed to parse trainerCreate response as JSON. Status:', trainerCreateRes.status, 'Body:', trainerCreateRaw);
    throw err;
  }
  if (trainerCreateRes.status !== 201) {
    console.error('DEBUG: trainerCreateRes failed:', trainerCreateRes.status, trainerCreateData);
  }
  assert(trainerCreateRes.status === 201, 'Trainer creates problem with 201 Created');
  assert(trainerCreateData.slug === newProblemSlug, 'New problem created with custom slug');
  assert(trainerCreateData.examples.length === 1, 'Examples persisted on creation');

  // Verify the newly created problem appears in public catalog
  const verifyRes = await fetch(`${BASE_URL}/problems/${newProblemSlug}`);
  assert(verifyRes.status === 200, 'Newly created PUBLISHED problem immediately queryable');

  // Trainer updates own problem
  const updateRes = await fetch(`${BASE_URL}/problems/${trainerCreateData.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${trainerToken}`,
    },
    body: JSON.stringify({
      title: 'Invert Binary Tree (Updated)',
    }),
  });
  const updateData = await updateRes.json();
  assert(updateRes.status === 200, 'Trainer updates own problem with 200 OK');
  assert(updateData.title === 'Invert Binary Tree (Updated)', 'Title updated successfully');

  // Student attempts to edit the problem
  const studentEditRes = await fetch(`${BASE_URL}/problems/${trainerCreateData.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentToken}`,
    },
    body: JSON.stringify({ title: 'Student Defaced' }),
  });
  assert(studentEditRes.status === 403, 'Student cannot edit existing problems (403 Forbidden enforced)');

  console.log('\n========================================');
  console.log(`Test Results: ${passed} passed, ${failed} failed (${Math.round((passed / (passed + failed)) * 100)}%)`);
  console.log('========================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
