import {
  PrismaClient,
  Role,
  OrganizationRole,
  ContentStatus,
  SubmissionStatus,
  SubmissionVerdict,
  TestAttemptStatus,
  TestViolationType,
  Difficulty,
  SystemDesignCategory,
  CoreSubjectType,
} from '@prisma/client';

const prisma = new PrismaClient();

// Argon2id hash for 'Password123!'
const SEED_PASSWORD_HASH =
  '$argon2id$v=19$m=19456,t=2,p=1$UAZsDplNMtcxt2yygYRDBA$TGSRAF6dzrO7RdseqPyzYK0WurqjTwKOJm6FW96elo0';

const dummyUsers = [
  {
    email: 'alex.rivera@numu.io',
    username: 'alexrivera',
    name: 'Alex Rivera',
    role: Role.PLATFORM_ADMIN,
    headline: 'Senior Platform Engineer & NUMU Architect',
    bio: 'Passionate about building scalable distributed systems and developer education.',
    college: 'Vellore Institute of Technology',
    gradYear: 2024,
    skills: ['TypeScript', 'NestJS', 'PostgreSQL', 'Docker', 'Go'],
  },
  {
    email: 'sarah.chen@numu.io',
    username: 'sarahchen',
    name: 'Sarah Chen',
    role: Role.TRAINER,
    headline: 'Lead Algorithm Instructor & Competitive Programmer',
    bio: 'Former ICPC finalist, teaching advanced graph algorithms and dynamic programming.',
    college: 'IIT Madras',
    gradYear: 2023,
    skills: ['C++', 'Python', 'Algorithms', 'Data Structures'],
  },
  {
    email: 'marcus.vance@numu.io',
    username: 'marcusvance',
    name: 'Marcus Vance',
    role: Role.COLLEGE_ADMIN,
    headline: 'Department Head & Academic Coordinator',
    bio: 'Overseeing student developer tracks and university lab evaluations.',
    college: 'BITS Pilani',
    gradYear: 2020,
    skills: ['Curriculum Design', 'System Architecture'],
  },
  {
    email: 'johnny@numu.io',
    username: 'johnny',
    name: 'Johnny',
    role: Role.STUDENT,
    headline: 'DSA & Fullstack Engineering Student (50% Curriculum Completed)',
    bio: 'Consistent problem solver halfway through the NUMU 8-topic DSA curriculum track.',
    college: 'Vellore Institute of Technology',
    gradYear: 2026,
    skills: ['C++', 'Python', 'TypeScript', 'Data Structures', 'Algorithms'],
  },
  {
    email: 'elena.rostova@numu.io',
    username: 'elenarostova',
    name: 'Elena Rostova',
    role: Role.STUDENT,
    headline: 'Aspiring Fullstack Developer & Open Source Contributor',
    bio: 'Junior year computer science student preparing for upcoming tech placements.',
    college: 'NIT Trichy',
    gradYear: 2026,
    skills: ['React', 'Next.js', 'Tailwind CSS', 'TypeScript'],
  },
  {
    email: 'david.kim@numu.io',
    username: 'davidkim',
    name: 'David Kim',
    role: Role.STUDENT,
    headline: 'DSA Enthusiast & Python Developer',
    bio: 'Practicing daily DSA challenges and building machine learning side-projects.',
    college: 'Vellore Institute of Technology',
    gradYear: 2025,
    skills: ['Python', 'SQL', 'FastAPI'],
  },
  {
    email: 'aarav.sharma@numu.io',
    username: 'aaravsharma',
    name: 'Aarav Sharma',
    role: Role.STUDENT,
    headline: 'Competitive Programmer & Systems Enthusiast',
    bio: 'Solving graph & DP problems daily for product engineering placements.',
    college: 'IIT Hyderabad',
    gradYear: 2027,
    skills: ['C++', 'Algorithms', 'Graphs', 'Rust'],
  },
  {
    email: 'diya.nair@numu.io',
    username: 'diyanair',
    name: 'Diya Nair',
    role: Role.STUDENT,
    headline: 'Full-Stack Developer & Algorithmist',
    bio: 'Final-year CSE student focused on distributed backend systems and DSA.',
    college: 'NIT Trichy',
    gradYear: 2026,
    skills: ['Java', 'Python', 'TypeScript', 'PostgreSQL'],
  },
  {
    email: 'rohan.verma@numu.io',
    username: 'rohanverma',
    name: 'Rohan Verma',
    role: Role.STUDENT,
    headline: 'Backend Developer & Problem Solver',
    bio: 'Building low-latency services and mastering core data structures.',
    college: 'Vellore Institute of Technology',
    gradYear: 2026,
    skills: ['C++', 'Java', 'Node.js'],
  },
  {
    email: 'ananya.iyer@numu.io',
    username: 'ananyaiyer',
    name: 'Ananya Iyer',
    role: Role.STUDENT,
    headline: 'AI/ML & Algorithms Student',
    bio: 'Sophomore CS student exploring dynamic programming and recursion.',
    college: 'IIT Hyderabad',
    gradYear: 2027,
    skills: ['Python', 'C++', 'PyTorch'],
  },
];

async function main() {
  console.log('🌱 Starting database seeding with Phase 2 entities...');

  // 1. Seed or Upsert Organization
  const org = await prisma.organization.upsert({
    where: { slug: 'vit' },
    update: {
      name: 'Vellore Institute of Technology',
      description: 'Premier engineering and technology university.',
    },
    create: {
      name: 'Vellore Institute of Technology',
      slug: 'vit',
      description: 'Premier engineering and technology university.',
    },
  });
  console.log(`  ✓ Organization seeded: ${org.name} (slug: ${org.slug})`);

  // 2. Seed or Upsert Users & Profiles
  for (const item of dummyUsers) {
    const user = await prisma.user.upsert({
      where: { email: item.email },
      update: {
        name: item.name,
        username: item.username,
        role: item.role,
        passwordHash: SEED_PASSWORD_HASH,
        isActive: true,
        isEmailVerified: true,
      },
      create: {
        email: item.email,
        username: item.username,
        name: item.name,
        role: item.role,
        passwordHash: SEED_PASSWORD_HASH,
        isActive: true,
        isEmailVerified: true,
      },
    });

    await prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        headline: item.headline,
        bio: item.bio,
        college: item.college,
        gradYear: item.gradYear,
        skills: item.skills,
      },
      create: {
        userId: user.id,
        headline: item.headline,
        bio: item.bio,
        college: item.college,
        gradYear: item.gradYear,
        skills: item.skills,
      },
    });

    // Seed organization membership for college admin & student from VIT
    if (item.college === 'Vellore Institute of Technology') {
      const orgRole =
        item.role === Role.COLLEGE_ADMIN || item.role === Role.PLATFORM_ADMIN
          ? OrganizationRole.ADMIN
          : OrganizationRole.MEMBER;

      await prisma.organizationMember.upsert({
        where: {
          organizationId_userId: {
            organizationId: org.id,
            userId: user.id,
          },
        },
        update: { role: orgRole },
        create: {
          organizationId: org.id,
          userId: user.id,
          role: orgRole,
        },
      });
    }

    console.log(`  ✓ User & Profile seeded: ${user.name} (@${user.username}) [Role: ${user.role}]`);
  }

  // 3. Seed Topics
  console.log('\n📚 Seeding Topics...');
  const topicsData = [
    { slug: 'arrays', name: 'Arrays', icon: '▦', description: 'Contiguous memory layout, prefix sums, and index traversal', order: 1 },
    { slug: 'strings', name: 'Strings', icon: 'T', description: 'Character manipulation, palindrome checks, and sliding windows', order: 2 },
    { slug: 'linked-lists', name: 'Linked Lists', icon: '⛓', description: 'Singly and doubly linked pointer structures', order: 3 },
    { slug: 'stacks-queues', name: 'Stacks & Queues', icon: '⊞', description: 'LIFO & FIFO linear data structures and monotonic stacks', order: 4 },
    { slug: 'trees', name: 'Trees', icon: '🌲', description: 'Binary trees, binary search trees, and tree traversals', order: 5 },
    { slug: 'graphs', name: 'Graphs', icon: '⬡', description: 'BFS, DFS, topological sorting, and shortest path algorithms', order: 6 },
    { slug: 'dynamic-programming', name: 'Dynamic Programming', icon: '⚡', description: 'Memoization, tabulation, and optimal substructure', order: 7 },
    { slug: 'two-pointers', name: 'Two Pointers', icon: '◈', description: 'Converging, fast/slow, and sliding boundary pointers', order: 8 },
  ];

  const seededTopics: Record<string, string> = {};
  for (const t of topicsData) {
    const topic = await prisma.topic.upsert({
      where: { slug: t.slug },
      update: { name: t.name, icon: t.icon, description: t.description, order: t.order },
      create: t,
    });
    seededTopics[t.slug] = topic.id;
    console.log(`  ✓ Topic seeded: ${topic.name} (/dsa/topics/${topic.slug})`);
  }

  // Author user for problems: Sarah Chen (TRAINER)
  const trainer = await prisma.user.findUnique({ where: { email: 'sarah.chen@numu.io' } });
  if (!trainer) throw new Error('Trainer account missing from seed');

  // 4. Seed Canonical Problems & Examples
  console.log('\n💻 Seeding DSA Problems & Examples...');
  const problemsData = [
    {
      slug: 'two-sum',
      title: 'Two Sum',
      difficulty: 'EASY' as const,
      status: 'PUBLISHED' as const,
      acceptanceRate: 52.3,
      primaryTopicSlug: 'arrays',
      topicSlugs: ['arrays', 'two-pointers'],
      description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\nYou can return the answer in any order.',
      constraints: [
        '2 <= nums.length <= 10^4',
        '-10^9 <= nums[i] <= 10^9',
        '-10^9 <= target <= 10^9',
        'Only one valid answer exists.',
      ],
      hints: [
        'A really brute force way would be to search for all possible pairs of numbers but that would be slow.',
        'Can you use a Hash Map to store previously seen numbers and their indices?',
      ],
      boilerplate: {
        python: 'class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        # Write your solution here\n        return []',
        cpp: 'class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your solution here\n        return {};\n    }\n};',
        java: 'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your solution here\n        return new int[]{};\n    }\n}',
        typescript: 'function twoSum(nums: number[], target: number): number[] {\n    // Write your solution here\n    return [];\n}',
      },
      solutions: [
        {
          language: 'python',
          title: 'One-Pass Hash Table',
          code: 'class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        seen = {}\n        for i, num in enumerate(nums):\n            diff = target - num\n            if diff in seen:\n                return [seen[diff], i]\n            seen[num] = i\n        return []',
          explanation: 'We iterate through the array once while maintaining a hash map that maps each number to its index. For each number, we check if its complement (`target - num`) has already been visited. If so, we immediately return the pair of indices. If not, we record the current number and continue.',
          timeComplexity: 'O(n) - Single pass through the array with O(1) average hash map lookup time.',
          spaceComplexity: 'O(n) - In the worst case, the hash map stores up to n elements.',
        },
        {
          language: 'cpp',
          title: 'One-Pass Hash Table',
          code: 'class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        unordered_map<int, int> seen;\n        for (int i = 0; i < nums.size(); ++i) {\n            int diff = target - nums[i];\n            if (seen.count(diff)) return {seen[diff], i};\n            seen[nums[i]] = i;\n        }\n        return {};\n    }\n};',
          explanation: 'Using an `unordered_map`, we look for the complement `target - nums[i]` on each iteration. When found, we return the pair `{seen[diff], i}`.',
          timeComplexity: 'O(n) - Single traversal with amortized O(1) unordered_map lookups.',
          spaceComplexity: 'O(n) - Extra space for storing numbers in the hash table.',
        },
        {
          language: 'java',
          title: 'One-Pass Hash Table',
          code: 'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int complement = target - nums[i];\n            if (map.containsKey(complement)) {\n                return new int[]{map.get(complement), i};\n            }\n            map.put(nums[i], i);\n        }\n        return new int[]{};\n    }\n}',
          explanation: 'Using a Java HashMap, we store seen values and indices, checking map.containsKey(complement) at each iteration in O(1) average time.',
          timeComplexity: 'O(n) - Single pass through nums.',
          spaceComplexity: 'O(n) - Hash map storing up to n key-value pairs.',
        },
        {
          language: 'typescript',
          title: 'One-Pass Hash Table',
          code: 'function twoSum(nums: number[], target: number): number[] {\n    const map = new Map<number, number>();\n    for (let i = 0; i < nums.length; i++) {\n        const diff = target - nums[i]!;\n        if (map.has(diff)) return [map.get(diff)!, i];\n        map.set(nums[i]!, i);\n    }\n    return [];\n}',
          explanation: 'Using a JavaScript `Map`, we store seen values and indices, checking `map.has(diff)` at each step.',
          timeComplexity: 'O(n) - Single linear pass.',
          spaceComplexity: 'O(n) - Map stores up to n key-value pairs.',
        },
      ],
      examples: [
        {
          input: 'nums = [2,7,11,15], target = 9',
          output: '[0,1]',
          explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
          order: 1,
        },
        {
          input: 'nums = [3,2,4], target = 6',
          output: '[1,2]',
          explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].',
          order: 2,
        },
        {
          input: 'nums = [3,3], target = 6',
          output: '[0,1]',
          explanation: 'Because nums[0] + nums[1] == 6, we return [0, 1].',
          order: 3,
        },
      ],
      testCases: [
        { input: 'nums = [2,7,11,15], target = 9', expectedOutput: '[0,1]', isHidden: false },
        { input: 'nums = [3,2,4], target = 6', expectedOutput: '[1,2]', isHidden: false },
        { input: 'nums = [3,3], target = 6', expectedOutput: '[0,1]', isHidden: false },
        { input: 'nums = [-1,-2,-3,-4,-5], target = -8', expectedOutput: '[2,4]', isHidden: true },
        { input: 'nums = [0,4,3,0], target = 0', expectedOutput: '[0,3]', isHidden: true },
        { input: 'nums = [-3,4,3,90], target = 0', expectedOutput: '[0,2]', isHidden: true },
        { input: 'nums = [1,5,8,10,14,20], target = 24', expectedOutput: '[3,4]', isHidden: true },
        { input: 'nums = [1000000000, 500000000, 500000000], target = 1000000000', expectedOutput: '[1,2]', isHidden: true },
        { input: 'nums = [2,5,5,11], target = 10', expectedOutput: '[1,2]', isHidden: true },
        { input: 'nums = [1,2,3,4,5,6,7,8,9,15], target = 24', expectedOutput: '[8,9]', isHidden: true },
      ],
    },
    {
      slug: 'valid-parentheses',
      title: 'Valid Parentheses',
      difficulty: 'EASY' as const,
      status: 'PUBLISHED' as const,
      acceptanceRate: 41.3,
      primaryTopicSlug: 'stacks-queues',
      topicSlugs: ['stacks-queues', 'strings'],
      description: 'Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.\n\nAn input string is valid if open brackets are closed by the same type of brackets in the correct order.',
      constraints: [
        '1 <= s.length <= 10^4',
        's consists of parentheses only ()[]{}.',
      ],
      hints: [
        'Use a stack to keep track of opening brackets.',
        'When encountering a closing bracket, check if it matches the top of the stack.',
      ],
      boilerplate: {
        python: 'class Solution:\n    def isValid(self, s: str) -> bool:\n        # Write your solution here\n        return False',
        cpp: 'class Solution {\npublic:\n    bool isValid(string s) {\n        // Write your solution here\n        return false;\n    }\n};',
        java: 'class Solution {\n    public boolean isValid(String s) {\n        // Write your solution here\n        return false;\n    }\n}',
        typescript: 'function isValid(s: string): boolean {\n    // Write your solution here\n    return false;\n}',
      },
      solutions: [
        {
          language: 'python',
          title: 'Stack Matching',
          code: 'class Solution:\n    def isValid(self, s: str) -> bool:\n        stack = []\n        mapping = {")": "(", "}": "{", "]": "["}\n        for char in s:\n            if char in mapping:\n                top_element = stack.pop() if stack else "#"\n                if mapping[char] != top_element:\n                    return False\n            else:\n                stack.append(char)\n        return not stack',
          explanation: 'An open bracket must be closed by the same type of bracket in LIFO order. We push each opening bracket onto a stack. When a closing bracket is encountered, we pop the top element from the stack and verify that it matches. Finally, return true if the stack is completely empty.',
          timeComplexity: 'O(n) - Single traversal of the string of length n.',
          spaceComplexity: 'O(n) - In the worst case (all open brackets), stack size reaches n.',
        },
        {
          language: 'cpp',
          title: 'Stack Matching',
          code: 'class Solution {\npublic:\n    bool isValid(string s) {\n        stack<char> st;\n        for (char c : s) {\n            if (c == \'(\' || c == \'{\' || c == \'[\') {\n                st.push(c);\n            } else {\n                if (st.empty()) return false;\n                char top = st.top();\n                st.pop();\n                if (c == \')\' && top != \'(\') return false;\n                if (c == \'}\' && top != \'{\') return false;\n                if (c == \']\' && top != \'[\') return false;\n            }\n        }\n        return st.empty();\n    }\n};',
          explanation: 'Using `std::stack<char>`, opening brackets are pushed, and closing brackets pop and validate against the top.',
          timeComplexity: 'O(n) - Single linear pass.',
          spaceComplexity: 'O(n) - Stack memory up to n characters.',
        },
        {
          language: 'java',
          title: 'Stack Matching',
          code: 'class Solution {\n    public boolean isValid(String s) {\n        Deque<Character> stack = new ArrayDeque<>();\n        for (char c : s.toCharArray()) {\n            if (c == \'(\') stack.push(\')\');\n            else if (c == \'{\') stack.push(\'}\');\n            else if (c == \'[\') stack.push(\']\');\n            else if (stack.isEmpty() || stack.pop() != c) return false;\n        }\n        return stack.isEmpty();\n    }\n}',
          explanation: 'Using an ArrayDeque as a stack, we push expected closing brackets when an opening bracket appears, and pop and verify when a closing bracket appears.',
          timeComplexity: 'O(n) - Single pass through string.',
          spaceComplexity: 'O(n) - Stack memory up to n characters.',
        },
        {
          language: 'typescript',
          title: 'Stack Matching',
          code: 'function isValid(s: string): boolean {\n    const stack: string[] = [];\n    const map: Record<string, string> = { ")": "(", "}": "{", "]": "[" };\n    for (const char of s) {\n        if (char in map) {\n            if (stack.pop() !== map[char]) return false;\n        } else {\n            stack.push(char);\n        }\n    }\n    return stack.length === 0;\n}',
          explanation: 'Use an array as a stack with push and pop operations.',
          timeComplexity: 'O(n) - Linear pass.',
          spaceComplexity: 'O(n) - Array stack up to n characters.',
        },
      ],
      examples: [
        { input: 's = "()"', output: 'true', order: 1 },
        { input: 's = "()[]{}"', output: 'true', order: 2 },
        { input: 's = "(]"', output: 'false', order: 3 },
      ],
      testCases: [
        { input: 's = "()"', expectedOutput: 'true', isHidden: false },
        { input: 's = "()[]{}"', expectedOutput: 'true', isHidden: false },
        { input: 's = "(]"', expectedOutput: 'false', isHidden: false },
        { input: 's = "([])"', expectedOutput: 'true', isHidden: true },
        { input: 's = "([)]"', expectedOutput: 'false', isHidden: true },
        { input: 's = "{[]}"', expectedOutput: 'true', isHidden: true },
        { input: 's = "["', expectedOutput: 'false', isHidden: true },
        { input: 's = "]"', expectedOutput: 'false', isHidden: true },
        { input: 's = "((((((()))))))"', expectedOutput: 'true', isHidden: true },
        { input: 's = "(((((((((()"', expectedOutput: 'false', isHidden: true },
      ],
    },
    {
      slug: 'container-with-most-water',
      title: 'Container With Most Water',
      difficulty: 'MEDIUM' as const,
      status: 'PUBLISHED' as const,
      acceptanceRate: 54.8,
      primaryTopicSlug: 'two-pointers',
      topicSlugs: ['two-pointers', 'arrays'],
      description: 'You are given an integer array `height` of length `n`. There are `n` vertical lines drawn such that the two endpoints of the `i-th` line are `(i, 0)` and `(i, height[i])`.\n\nFind two lines that together with the x-axis form a container, such that the container contains the most water.\n\nReturn the maximum amount of water a container can store.',
      constraints: [
        'n == height.length',
        '2 <= n <= 10^5',
        '0 <= height[i] <= 10^4',
      ],
      hints: [
        'Start with two pointers at the ends of the array.',
        'Always move the pointer pointing to the shorter vertical bar.',
      ],
      boilerplate: {
        python: 'class Solution:\n    def maxArea(self, height: list[int]) -> int:\n        # Write your solution here\n        return 0',
        cpp: 'class Solution {\npublic:\n    int maxArea(vector<int>& height) {\n        // Write your solution here\n        return 0;\n    }\n};',
        java: 'class Solution {\n    public int maxArea(int[] height) {\n        // Write your solution here\n        return 0;\n    }\n}',
        typescript: 'function maxArea(height: number[]): number {\n    // Write your solution here\n    return 0;\n}',
      },
      solutions: [
        {
          language: 'python',
          title: 'Two Pointers Greedy Converging',
          code: 'class Solution:\n    def maxArea(self, height: list[int]) -> int:\n        left, right = 0, len(height) - 1\n        max_water = 0\n        while left < right:\n            max_water = max(max_water, min(height[left], height[right]) * (right - left))\n            if height[left] < height[right]:\n                left += 1\n            else:\n                right -= 1\n        return max_water',
          explanation: 'Initialize two pointers at opposite ends of the array. The capacity of any container is constrained by the shorter line (`min(height[left], height[right]) * (right - left)`). Moving the pointer at the shorter bar inward is the only way to possibly discover a larger container.',
          timeComplexity: 'O(n) - Each step moves one of the pointers inward, inspecting at most n lines.',
          spaceComplexity: 'O(1) - Only requires pointer variables.',
        },
        {
          language: 'cpp',
          title: 'Two Pointers Greedy Converging',
          code: 'class Solution {\npublic:\n    int maxArea(vector<int>& height) {\n        int left = 0, right = height.size() - 1;\n        int max_water = 0;\n        while (left < right) {\n            int current = min(height[left], height[right]) * (right - left);\n            max_water = max(max_water, current);\n            if (height[left] < height[right]) {\n                left++;\n            } else {\n                right--;\n            }\n        }\n        return max_water;\n    }\n};',
          explanation: 'Two pointers converging from ends. At each step, update max area and move the shorter pointer inward.',
          timeComplexity: 'O(n) - Single pass with two pointers.',
          spaceComplexity: 'O(1) - Constant auxiliary space.',
        },
        {
          language: 'java',
          title: 'Two Pointers Greedy Converging',
          code: 'class Solution {\n    public int maxArea(int[] height) {\n        int left = 0, right = height.length - 1;\n        int maxWater = 0;\n        while (left < right) {\n            int current = Math.min(height[left], height[right]) * (right - left);\n            maxWater = Math.max(maxWater, current);\n            if (height[left] < height[right]) {\n                left++;\n            } else {\n                right--;\n            }\n        }\n        return maxWater;\n    }\n}',
          explanation: 'Two pointers converging from ends. Calculate area with the shorter bar and advance the pointer inward.',
          timeComplexity: 'O(n) - Single pass with two pointers.',
          spaceComplexity: 'O(1) - Constant auxiliary space.',
        },
        {
          language: 'typescript',
          title: 'Two Pointers Greedy Converging',
          code: 'function maxArea(height: number[]): number {\n    let left = 0;\n    let right = height.length - 1;\n    let maxWater = 0;\n    while (left < right) {\n        const current = Math.min(height[left]!, height[right]!) * (right - left);\n        maxWater = Math.max(maxWater, current);\n        if (height[left]! < height[right]!) {\n            left++;\n        } else {\n            right--;\n        }\n    }\n    return maxWater;\n}',
          explanation: 'Calculate container area between left and right indices, moving whichever height is smaller.',
          timeComplexity: 'O(n) - Linear traversal.',
          spaceComplexity: 'O(1) - In-place pointer variables.',
        },
      ],
      examples: [
        {
          input: 'height = [1,8,6,2,5,4,8,3,7]',
          output: '49',
          explanation: 'The above vertical lines are represented by array [1,8,6,2,5,4,8,3,7]. In this case, max area of water the container can contain is 49.',
          order: 1,
        },
        {
          input: 'height = [1,1]',
          output: '1',
          explanation: 'The minimum height is 1, distance is 1, max area is 1.',
          order: 2,
        },
        {
          input: 'height = [4,3,2,1,4]',
          output: '16',
          explanation: 'Max area is between the first and last bars: 4 * 4 = 16.',
          order: 3,
        },
      ],
      testCases: [
        { input: 'height = [1,8,6,2,5,4,8,3,7]', expectedOutput: '49', isHidden: false },
        { input: 'height = [1,1]', expectedOutput: '1', isHidden: false },
        { input: 'height = [4,3,2,1,4]', expectedOutput: '16', isHidden: false },
        { input: 'height = [1,2,1]', expectedOutput: '2', isHidden: true },
        { input: 'height = [2,3,4,5,18,17,6]', expectedOutput: '17', isHidden: true },
        { input: 'height = [1,2,4,3]', expectedOutput: '4', isHidden: true },
        { input: 'height = [3,9,3,4,7,2,12,6]', expectedOutput: '45', isHidden: true },
        { input: 'height = [1,3,2,5,25,24,5]', expectedOutput: '24', isHidden: true },
        { input: 'height = [10,9,8,7,6,5,4,3,2,1]', expectedOutput: '25', isHidden: true },
        { input: 'height = [1000,1000,1000,1000]', expectedOutput: '3000', isHidden: true },
      ],
    },
    {
      slug: '3sum',
      title: '3Sum',
      difficulty: 'MEDIUM' as const,
      status: 'PUBLISHED' as const,
      acceptanceRate: 34.8,
      primaryTopicSlug: 'two-pointers',
      topicSlugs: ['two-pointers', 'arrays'],
      description: 'Given an integer array nums, return all the triplets `[nums[i], nums[j], nums[k]]` such that `i != j`, `i != k`, and `j != k`, and `nums[i] + nums[j] + nums[k] == 0`.\n\nNotice that the solution set must not contain duplicate triplets.',
      constraints: [
        '3 <= nums.length <= 3000',
        '-10^5 <= nums[i] <= 10^5',
      ],
      hints: ['Sort the array first to make two-pointer scanning possible and skip duplicates.'],
      boilerplate: {
        python: 'class Solution:\n    def threeSum(self, nums: list[int]) -> list[list[int]]:\n        # Write your solution here\n        return []',
        cpp: 'class Solution {\npublic:\n    vector<vector<int>> threeSum(vector<int>& nums) {\n        // Write your solution here\n        return {};\n    }\n};',
        java: 'class Solution {\n    public List<List<Integer>> threeSum(int[] nums) {\n        // Write your solution here\n        return new ArrayList<>();\n    }\n}',
        typescript: 'function threeSum(nums: number[]): number[][] {\n    // Write your solution here\n    return [];\n}',
      },
      solutions: [
        {
          language: 'python',
          title: 'Sorting and Two Pointers',
          code: 'class Solution:\n    def threeSum(self, nums: list[int]) -> list[list[int]]:\n        nums.sort()\n        res = []\n        for i in range(len(nums) - 2):\n            if i > 0 and nums[i] == nums[i - 1]:\n                continue\n            left, right = i + 1, len(nums) - 1\n            while left < right:\n                s = nums[i] + nums[left] + nums[right]\n                if s < 0:\n                    left += 1\n                elif s > 0:\n                    right -= 1\n                else:\n                    res.append([nums[i], nums[left], nums[right]])\n                    while left < right and nums[left] == nums[left + 1]:\n                        left += 1\n                    while left < right and nums[right] == nums[right - 1]:\n                        right -= 1\n                    left += 1\n                    right -= 1\n        return res',
          explanation: 'Sort the array. For each element `nums[i]`, skip duplicates and use two pointers `left = i + 1` and `right = n - 1` to find pairs summing to `-nums[i]`. When found, record the triplet and advance pointers skipping identical elements.',
          timeComplexity: 'O(n^2) - O(n log n) sorting + O(n^2) two pointer scans.',
          spaceComplexity: 'O(1) auxiliary space (excluding returned result).',
        },
        {
          language: 'cpp',
          title: 'Sorting and Two Pointers',
          code: 'class Solution {\npublic:\n    vector<vector<int>> threeSum(vector<int>& nums) {\n        sort(nums.begin(), nums.end());\n        vector<vector<int>> res;\n        int n = nums.size();\n        for (int i = 0; i < n - 2; ++i) {\n            if (i > 0 && nums[i] == nums[i - 1]) continue;\n            int left = i + 1, right = n - 1;\n            while (left < right) {\n                int s = nums[i] + nums[left] + nums[right];\n                if (s < 0) left++;\n                else if (s > 0) right--;\n                else {\n                    res.push_back({nums[i], nums[left], nums[right]});\n                    while (left < right && nums[left] == nums[left + 1]) left++;\n                    while (left < right && nums[right] == nums[right - 1]) right--;\n                    left++;\n                    right--;\n                }\n            }\n        }\n        return res;\n    }\n};',
          explanation: 'Sort array and apply converging two-pointer scan for each index, deduplicating consecutive equal values.',
          timeComplexity: 'O(n^2) - Sort followed by n two-pointer iterations.',
          spaceComplexity: 'O(1) auxiliary space beyond the output vector.',
        },
        {
          language: 'java',
          title: 'Sorting and Two Pointers',
          code: 'class Solution {\n    public List<List<Integer>> threeSum(int[] nums) {\n        Arrays.sort(nums);\n        List<List<Integer>> res = new ArrayList<>();\n        int n = nums.length;\n        for (int i = 0; i < n - 2; i++) {\n            if (i > 0 && nums[i] == nums[i - 1]) continue;\n            int left = i + 1, right = n - 1;\n            while (left < right) {\n                int sum = nums[i] + nums[left] + nums[right];\n                if (sum == 0) {\n                    res.add(Arrays.asList(nums[i], nums[left], nums[right]));\n                    while (left < right && nums[left] == nums[left + 1]) left++;\n                    while (left < right && nums[right] == nums[right - 1]) right--;\n                    left++;\n                    right--;\n                } else if (sum < 0) {\n                    left++;\n                } else {\n                    right--;\n                }\n            }\n        }\n        return res;\n    }\n}',
          explanation: 'Sort the array and run two-pointer converging scan for each element, skipping duplicate consecutive entries.',
          timeComplexity: 'O(n^2) - O(n log n) sorting + O(n^2) two pointer scans.',
          spaceComplexity: 'O(1) auxiliary space beyond result list.',
        },
        {
          language: 'typescript',
          title: 'Sorting and Two Pointers',
          code: 'function threeSum(nums: number[]): number[][] {\n    nums.sort((a, b) => a - b);\n    const res: number[][] = [];\n    for (let i = 0; i < nums.length - 2; i++) {\n        if (i > 0 && nums[i] === nums[i - 1]) continue;\n        let left = i + 1;\n        let right = nums.length - 1;\n        while (left < right) {\n            const sum = nums[i]! + nums[left]! + nums[right]!;\n            if (sum < 0) {\n                left++;\n            } else if (sum > 0) {\n                right--;\n            } else {\n                res.push([nums[i]!, nums[left]!, nums[right]!]);\n                while (left < right && nums[left] === nums[left + 1]) left++;\n                while (left < right && nums[right] === nums[right - 1]) right--;\n                left++;\n                right--;\n            }\n        }\n    }\n    return res;\n}',
          explanation: 'Numerical sort followed by converging two pointers and duplicate skipping.',
          timeComplexity: 'O(n^2) - Sorting and nested two-pointer traversal.',
          spaceComplexity: 'O(1) auxiliary space beyond result array.',
        },
      ],
      examples: [
        {
          input: 'nums = [-1,0,1,2,-1,-4]',
          output: '[[-1,-1,2],[-1,0,1]]',
          order: 1,
        },
        {
          input: 'nums = [0,1,1]',
          output: '[]',
          order: 2,
        },
        {
          input: 'nums = [0,0,0]',
          output: '[[0,0,0]]',
          order: 3,
        },
      ],
      testCases: [
        { input: 'nums = [-1,0,1,2,-1,-4]', expectedOutput: '[[-1,-1,2],[-1,0,1]]', isHidden: false },
        { input: 'nums = [0,1,1]', expectedOutput: '[]', isHidden: false },
        { input: 'nums = [0,0,0]', expectedOutput: '[[0,0,0]]', isHidden: false },
        { input: 'nums = [-2,0,1,1,2]', expectedOutput: '[[-2,0,2],[-2,1,1]]', isHidden: true },
        { input: 'nums = [-1,0,1]', expectedOutput: '[[-1,0,1]]', isHidden: true },
        { input: 'nums = [-4,-2,-2,-2,0,1,2,2,2,3,3,4,4,6,6]', expectedOutput: '[[-4,-2,6],[-4,0,4],[-4,1,3],[-4,2,2],[-2,-2,4],[-2,0,2]]', isHidden: true },
        { input: 'nums = [1,-1,-1,0]', expectedOutput: '[[-1,0,1]]', isHidden: true },
        { input: 'nums = [-2,0,0,2,2]', expectedOutput: '[[-2,0,2]]', isHidden: true },
        { input: 'nums = [3,0,-2,-1,1,2]', expectedOutput: '[[-2,-1,3],[-2,0,2],[-1,0,1]]', isHidden: true },
        { input: 'nums = [-1,2,1,-4]', expectedOutput: '[]', isHidden: true },
      ],
    },
    {
      slug: 'climbing-stairs',
      title: 'Climbing Stairs',
      difficulty: 'EASY' as const,
      status: 'PUBLISHED' as const,
      acceptanceRate: 52.1,
      primaryTopicSlug: 'dynamic-programming',
      topicSlugs: ['dynamic-programming'],
      description: 'You are climbing a staircase. It takes `n` steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
      constraints: ['1 <= n <= 45'],
      hints: ['To reach step n, you must come from step n-1 or step n-2.'],
      boilerplate: {
        python: 'class Solution:\n    def climbStairs(self, n: int) -> int:\n        # Write your solution here\n        return 0',
        cpp: 'class Solution {\npublic:\n    int climbStairs(int n) {\n        // Write your solution here\n        return 0;\n    }\n};',
        java: 'class Solution {\n    public int climbStairs(int n) {\n        // Write your solution here\n        return 0;\n    }\n}',
        typescript: 'function climbStairs(n: number): number {\n    // Write your solution here\n    return 0;\n}',
      },
      solutions: [
        {
          language: 'python',
          title: 'Dynamic Programming (Space Optimized)',
          code: 'class Solution:\n    def climbStairs(self, n: int) -> int:\n        if n <= 2:\n            return n\n        a, b = 1, 2\n        for _ in range(3, n + 1):\n            a, b = b, a + b\n        return b',
          explanation: 'To reach step n, one can only come from step n-1 or n-2. Thus `ways(n) = ways(n-1) + ways(n-2)`. Rather than maintaining a full array of size n, we only need to keep track of the previous two values.',
          timeComplexity: 'O(n) - Single loop performing n - 2 additions.',
          spaceComplexity: 'O(1) - Only two integer variables for the running state.',
        },
        {
          language: 'cpp',
          title: 'Dynamic Programming (Space Optimized)',
          code: 'class Solution {\npublic:\n    int climbStairs(int n) {\n        if (n <= 2) return n;\n        int a = 1, b = 2;\n        for (int i = 3; i <= n; ++i) {\n            int temp = a + b;\n            a = b;\n            b = temp;\n        }\n        return b;\n    }\n};',
          explanation: 'Iterative Fibonacci dynamic programming keeping only the two prior step counts.',
          timeComplexity: 'O(n) - Linear time complexity.',
          spaceComplexity: 'O(1) - Constant auxiliary space.',
        },
        {
          language: 'java',
          title: 'Dynamic Programming (Space Optimized)',
          code: 'class Solution {\n    public int climbStairs(int n) {\n        if (n <= 2) return n;\n        int a = 1, b = 2;\n        for (int i = 3; i <= n; i++) {\n            int temp = a + b;\n            a = b;\n            b = temp;\n        }\n        return b;\n    }\n}',
          explanation: 'Iterative Fibonacci dynamic programming storing only the two preceding stair count values.',
          timeComplexity: 'O(n) - Single loop of n additions.',
          spaceComplexity: 'O(1) - Constant auxiliary state.',
        },
        {
          language: 'typescript',
          title: 'Dynamic Programming (Space Optimized)',
          code: 'function climbStairs(n: number): number {\n    if (n <= 2) return n;\n    let a = 1;\n    let b = 2;\n    for (let i = 3; i <= n; i++) {\n        const temp = a + b;\n        a = b;\n        b = temp;\n    }\n    return b;\n}',
          explanation: 'Fibonacci recurrence with two scalar variables.',
          timeComplexity: 'O(n) - Single loop from 3 to n.',
          spaceComplexity: 'O(1) - Two variables for tracking state.',
        },
      ],
      examples: [
        { input: 'n = 2', output: '2', explanation: '1. 1 step + 1 step\n2. 2 steps', order: 1 },
        { input: 'n = 3', output: '3', explanation: '1. 1+1+1\n2. 1+2\n3. 2+1', order: 2 },
        { input: 'n = 1', output: '1', explanation: 'Only 1 step', order: 3 },
      ],
      testCases: [
        { input: 'n = 2', expectedOutput: '2', isHidden: false },
        { input: 'n = 3', expectedOutput: '3', isHidden: false },
        { input: 'n = 1', expectedOutput: '1', isHidden: false },
        { input: 'n = 4', expectedOutput: '5', isHidden: true },
        { input: 'n = 5', expectedOutput: '8', isHidden: true },
        { input: 'n = 6', expectedOutput: '13', isHidden: true },
        { input: 'n = 7', expectedOutput: '21', isHidden: true },
        { input: 'n = 8', expectedOutput: '34', isHidden: true },
        { input: 'n = 10', expectedOutput: '89', isHidden: true },
        { input: 'n = 20', expectedOutput: '10946', isHidden: true },
      ],
    },
    {
      slug: 'longest-substring-without-repeating-characters',
      title: 'Longest Substring Without Repeating Characters',
      difficulty: 'MEDIUM' as const,
      status: 'PUBLISHED' as const,
      acceptanceRate: 38.4,
      primaryTopicSlug: 'strings',
      topicSlugs: ['strings', 'two-pointers'],
      description: 'Given a string `s`, find the length of the longest substring without repeating characters.',
      constraints: ['0 <= s.length <= 5 * 10^4', 's consists of English letters, digits, symbols and spaces.'],
      hints: ['Use a sliding window [left, right] and a hash map or set to track seen characters.'],
      boilerplate: {
        python: 'class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        # Write your solution here\n        return 0',
        cpp: 'class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        // Write your solution here\n        return 0;\n    }\n};',
        java: 'class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        // Write your solution here\n        return 0;\n    }\n}',
        typescript: 'function lengthOfLongestSubstring(s: string): number {\n    // Write your solution here\n    return 0;\n}',
      },
      solutions: [
        {
          language: 'python',
          title: 'Sliding Window with Index Map',
          code: 'class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        last_seen = {}\n        left = 0\n        best = 0\n        for right, ch in enumerate(s):\n            if ch in last_seen and last_seen[ch] >= left:\n                left = last_seen[ch] + 1\n            last_seen[ch] = right\n            best = max(best, right - left + 1)\n        return best',
          explanation: 'Maintain a sliding window `[left, right]` with no duplicate characters using a dictionary mapping each character to its latest index.',
          timeComplexity: 'O(n) - Single pass over string s.',
          spaceComplexity: 'O(min(m, n)) - Size of character set.',
        },
      ],
      examples: [
        { input: 's = "abcabcbb"', output: '3', explanation: 'The answer is "abc", with the length of 3.', order: 1 },
        { input: 's = "bbbbb"', output: '1', explanation: 'The answer is "b", with the length of 1.', order: 2 },
        { input: 's = "pwwkew"', output: '3', explanation: 'The answer is "wke", with the length of 3.', order: 3 },
      ],
      testCases: [
        { input: 's = "abcabcbb"', expectedOutput: '3', isHidden: false },
        { input: 's = "bbbbb"', expectedOutput: '1', isHidden: false },
        { input: 's = "pwwkew"', expectedOutput: '3', isHidden: false },
        { input: 's = ""', expectedOutput: '0', isHidden: true },
        { input: 's = " "', expectedOutput: '1', isHidden: true },
        { input: 's = "au"', expectedOutput: '2', isHidden: true },
        { input: 's = "dvdf"', expectedOutput: '3', isHidden: true },
        { input: 's = "abba"', expectedOutput: '2', isHidden: true },
        { input: 's = "tmmzuxt"', expectedOutput: '5', isHidden: true },
        { input: 's = "abcdefg"', expectedOutput: '7', isHidden: true },
      ],
    },
    {
      slug: 'reverse-linked-list',
      title: 'Reverse Linked List',
      difficulty: 'EASY' as const,
      status: 'PUBLISHED' as const,
      acceptanceRate: 76.2,
      primaryTopicSlug: 'linked-lists',
      topicSlugs: ['linked-lists'],
      description: 'Given the `head` of a singly linked list, reverse the list, and return the reversed list.',
      constraints: ['The number of nodes in the list is the range [0, 5000].', '-5000 <= Node.val <= 5000'],
      hints: ['Track `prev`, `curr`, and `nextTemp` pointers while iterating through the list.'],
      boilerplate: {
        python: 'class Solution:\n    def reverseList(self, head: list[int]) -> list[int]:\n        # Write your solution here\n        return head[::-1]',
        cpp: 'class Solution {\npublic:\n    ListNode* reverseList(ListNode* head) {\n        // Write your solution here\n        return nullptr;\n    }\n};',
        java: 'class Solution {\n    public ListNode reverseList(ListNode head) {\n        // Write your solution here\n        return null;\n    }\n}',
        typescript: 'function reverseList(head: number[]): number[] {\n    // Write your solution here\n    return [];\n}',
      },
      solutions: [
        {
          language: 'python',
          title: 'Iterative Three-Pointer Reversal',
          code: 'class Solution:\n    def reverseList(self, head):\n        prev, curr = None, head\n        while curr:\n            nxt = curr.next\n            curr.next = prev\n            prev = curr\n            curr = nxt\n        return prev',
          explanation: 'Rewire each node `.next` pointer to point to `prev` in a single pass.',
          timeComplexity: 'O(n) - Visits each node once.',
          spaceComplexity: 'O(1) - Iterative pointer manipulation.',
        },
      ],
      examples: [
        { input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]', order: 1 },
        { input: 'head = [1,2]', output: '[2,1]', order: 2 },
        { input: 'head = []', output: '[]', order: 3 },
      ],
      testCases: [
        { input: 'head = [1,2,3,4,5]', expectedOutput: '[5,4,3,2,1]', isHidden: false },
        { input: 'head = [1,2]', expectedOutput: '[2,1]', isHidden: false },
        { input: 'head = []', expectedOutput: '[]', isHidden: false },
        { input: 'head = [1]', expectedOutput: '[1]', isHidden: true },
        { input: 'head = [10,20,30]', expectedOutput: '[30,20,10]', isHidden: true },
        { input: 'head = [-1,0,1]', expectedOutput: '[1,0,-1]', isHidden: true },
        { input: 'head = [5,5,5]', expectedOutput: '[5,5,5]', isHidden: true },
        { input: 'head = [2,4,6,8]', expectedOutput: '[8,6,4,2]', isHidden: true },
        { input: 'head = [9,8,7,6,5,4]', expectedOutput: '[4,5,6,7,8,9]', isHidden: true },
        { input: 'head = [100,200]', expectedOutput: '[200,100]', isHidden: true },
      ],
    },
    {
      slug: 'maximum-depth-of-binary-tree',
      title: 'Maximum Depth of Binary Tree',
      difficulty: 'EASY' as const,
      status: 'PUBLISHED' as const,
      acceptanceRate: 74.9,
      primaryTopicSlug: 'trees',
      topicSlugs: ['trees'],
      description: 'Given the `root` of a binary tree, return its maximum depth.\n\nA binary tree\'s maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.',
      constraints: ['The number of nodes in the tree is in the range [0, 10^4].', '-100 <= Node.val <= 100'],
      hints: ['Use recursion: maxDepth(root) = 1 + max(maxDepth(root.left), maxDepth(root.right)).'],
      boilerplate: {
        python: 'class Solution:\n    def maxDepth(self, root) -> int:\n        # Write your solution here\n        return 0',
        cpp: 'class Solution {\npublic:\n    int maxDepth(TreeNode* root) {\n        // Write your solution here\n        return 0;\n    }\n};',
        java: 'class Solution {\n    public int maxDepth(TreeNode root) {\n        // Write your solution here\n        return 0;\n    }\n}',
        typescript: 'function maxDepth(root: unknown): number {\n    // Write your solution here\n    return 0;\n}',
      },
      solutions: [
        {
          language: 'python',
          title: 'Depth-First Search (Recursion)',
          code: 'class Solution:\n    def maxDepth(self, root) -> int:\n        if not root:\n            return 0\n        return 1 + max(self.maxDepth(root.left), self.maxDepth(root.right))',
          explanation: 'Recursively compute the maximum depth of the left and right subtrees and add 1 for the current root node.',
          timeComplexity: 'O(n) - Visits every tree node once.',
          spaceComplexity: 'O(h) - Recursion stack proportional to tree height.',
        },
      ],
      examples: [
        { input: 'root = [3,9,20,null,null,15,7]', output: '3', order: 1 },
        { input: 'root = [1,null,2]', output: '2', order: 2 },
      ],
      testCases: [
        { input: 'root = [3,9,20,null,null,15,7]', expectedOutput: '3', isHidden: false },
        { input: 'root = [1,null,2]', expectedOutput: '2', isHidden: false },
        { input: 'root = []', expectedOutput: '0', isHidden: false },
        { input: 'root = [0]', expectedOutput: '1', isHidden: true },
        { input: 'root = [1,2,3,4,5]', expectedOutput: '3', isHidden: true },
        { input: 'root = [1,2,null,3,null,4]', expectedOutput: '4', isHidden: true },
        { input: 'root = [10,5,15,3,7,null,18]', expectedOutput: '3', isHidden: true },
        { input: 'root = [1,2,3]', expectedOutput: '2', isHidden: true },
        { input: 'root = [5,4,8,11,null,13,4,7,2]', expectedOutput: '4', isHidden: true },
        { input: 'root = [1,null,2,null,3,null,4,null,5]', expectedOutput: '5', isHidden: true },
      ],
    },
    {
      slug: 'number-of-islands',
      title: 'Number of Islands',
      difficulty: 'MEDIUM' as const,
      status: 'PUBLISHED' as const,
      acceptanceRate: 59.8,
      primaryTopicSlug: 'graphs',
      topicSlugs: ['graphs'],
      description: 'Given an `m x n` 2D binary grid `grid` which represents a map of `"1"`s (land) and `"0"`s (water), return the number of islands.\n\nAn island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.',
      constraints: ['m == grid.length', 'n == grid[i].length', '1 <= m, n <= 300'],
      hints: ['Start a DFS or BFS traversal each time you encounter an unvisited "1" cell.'],
      boilerplate: {
        python: 'class Solution:\n    def numIslands(self, grid: list[list[str]]) -> int:\n        # Write your solution here\n        return 0',
        cpp: 'class Solution {\npublic:\n    int numIslands(vector<vector<char>>& grid) {\n        // Write your solution here\n        return 0;\n    }\n};',
        java: 'class Solution {\n    public int numIslands(char[][] grid) {\n        // Write your solution here\n        return 0;\n    }\n}',
        typescript: 'function numIslands(grid: string[][]): number {\n    // Write your solution here\n    return 0;\n}',
      },
      solutions: [
        {
          language: 'python',
          title: 'Grid DFS Flood Fill',
          code: 'class Solution:\n    def numIslands(self, grid: list[list[str]]) -> int:\n        if not grid:\n            return 0\n        m, n = len(grid), len(grid[0])\n        count = 0\n        def dfs(r: int, c: int):\n            if r < 0 or r >= m or c < 0 or c >= n or grid[r][c] != "1":\n                return\n            grid[r][c] = "0"\n            dfs(r + 1, c); dfs(r - 1, c); dfs(r, c + 1); dfs(r, c - 1)\n        for r in range(m):\n            for c in range(n):\n                if grid[r][c] == "1":\n                    count += 1\n                    dfs(r, c)\n        return count',
          explanation: 'Iterate through every cell in the grid. Whenever we find `"1"`, increment the island count and run DFS flood-fill to mark all connected land cells as `"0"`.',
          timeComplexity: 'O(m * n) - Visits each cell a constant number of times.',
          spaceComplexity: 'O(m * n) - Worst-case recursion stack.',
        },
      ],
      examples: [
        { input: 'grid = [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]', output: '1', order: 1 },
        { input: 'grid = [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]', output: '3', order: 2 },
      ],
      testCases: [
        { input: 'grid = [["1","1","1","1","0"],["1","1","0","1","0"],["1","1","0","0","0"],["0","0","0","0","0"]]', expectedOutput: '1', isHidden: false },
        { input: 'grid = [["1","1","0","0","0"],["1","1","0","0","0"],["0","0","1","0","0"],["0","0","0","1","1"]]', expectedOutput: '3', isHidden: false },
        { input: 'grid = [["1"]]', expectedOutput: '1', isHidden: false },
        { input: 'grid = [["0"]]', expectedOutput: '0', isHidden: true },
        { input: 'grid = [["1","0","1"],["0","1","0"],["1","0","1"]]', expectedOutput: '5', isHidden: true },
        { input: 'grid = [["1","1"],["1","1"]]', expectedOutput: '1', isHidden: true },
        { input: 'grid = [["0","0"],["0","0"]]', expectedOutput: '0', isHidden: true },
        { input: 'grid = [["1","0","1","0","1"]]', expectedOutput: '3', isHidden: true },
        { input: 'grid = [["1"],["0"],["1"]]', expectedOutput: '2', isHidden: true },
        { input: 'grid = [["1","1","1"],["0","1","0"],["1","1","1"]]', expectedOutput: '1', isHidden: true },
      ],
    },
    {
      slug: 'coin-change',
      title: 'Coin Change',
      difficulty: 'MEDIUM' as const,
      status: 'PUBLISHED' as const,
      acceptanceRate: 44.6,
      primaryTopicSlug: 'dynamic-programming',
      topicSlugs: ['dynamic-programming', 'arrays'],
      description: 'You are given an integer array `coins` representing coins of different denominations and an integer `amount` representing a total amount of money.\n\nReturn the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return `-1`.',
      constraints: ['1 <= coins.length <= 12', '1 <= coins[i] <= 2^31 - 1', '0 <= amount <= 10^4'],
      hints: ['Build a bottom-up DP array where dp[x] is the minimum coins needed for amount x.'],
      boilerplate: {
        python: 'class Solution:\n    def coinChange(self, coins: list[int], amount: int) -> int:\n        # Write your solution here\n        return -1',
        cpp: 'class Solution {\npublic:\n    int coinChange(vector<int>& coins, int amount) {\n        // Write your solution here\n        return -1;\n    }\n};',
        java: 'class Solution {\n    public int coinChange(int[] coins, int amount) {\n        // Write your solution here\n        return -1;\n    }\n}',
        typescript: 'function coinChange(coins: number[], amount: number): number {\n    // Write your solution here\n    return -1;\n}',
      },
      solutions: [
        {
          language: 'python',
          title: 'Bottom-Up 1D Tabulation',
          code: 'class Solution:\n    def coinChange(self, coins: list[int], amount: int) -> int:\n        dp = [amount + 1] * (amount + 1)\n        dp[0] = 0\n        for a in range(1, amount + 1):\n            for c in coins:\n                if a - c >= 0:\n                    dp[a] = min(dp[a], 1 + dp[a - c])\n        return dp[amount] if dp[amount] != amount + 1 else -1',
          explanation: 'Compute minimum coins for every sub-amount from `1` to `amount` using previously computed optimal values `dp[a - c]`.',
          timeComplexity: 'O(amount * len(coins)) - Nested iteration over amount and coin denominations.',
          spaceComplexity: 'O(amount) - 1D DP array of size amount + 1.',
        },
      ],
      examples: [
        { input: 'coins = [1,2,5], amount = 11', output: '3', explanation: '11 = 5 + 5 + 1', order: 1 },
        { input: 'coins = [2], amount = 3', output: '-1', order: 2 },
        { input: 'coins = [1], amount = 0', output: '0', order: 3 },
      ],
      testCases: [
        { input: 'coins = [1,2,5], amount = 11', expectedOutput: '3', isHidden: false },
        { input: 'coins = [2], amount = 3', expectedOutput: '-1', isHidden: false },
        { input: 'coins = [1], amount = 0', expectedOutput: '0', isHidden: false },
        { input: 'coins = [1], amount = 1', expectedOutput: '1', isHidden: true },
        { input: 'coins = [1], amount = 2', expectedOutput: '2', isHidden: true },
        { input: 'coins = [2,5,10,1], amount = 27', expectedOutput: '4', isHidden: true },
        { input: 'coins = [186,419,83,408], amount = 6249', expectedOutput: '20', isHidden: true },
        { input: 'coins = [3,7,405,436], amount = 8839', expectedOutput: '25', isHidden: true },
        { input: 'coins = [5,10,25], amount = 30', expectedOutput: '2', isHidden: true },
        { input: 'coins = [4,5], amount = 7', expectedOutput: '-1', isHidden: true },
      ],
    },
    {
      slug: 'draft-advanced-graph-cut',
      title: 'Advanced Min-Cut Graph Problem (Internal Draft)',
      difficulty: 'HARD' as const,
      status: 'DRAFT' as const,
      acceptanceRate: 15.0,
      primaryTopicSlug: 'graphs',
      topicSlugs: ['graphs'],
      description: 'Internal authoring draft for competitive programming track. Should not appear on public catalog.',
      constraints: ['V <= 10^5, E <= 2*10^5'],
      hints: ['Push-relabel maximum flow algorithm.'],
      boilerplate: { python: 'def minCut(): pass' },
      examples: [
        { input: 'graph=[[1,2],[2,3]]', output: '2', order: 1 },
      ],
      testCases: [
        { input: 'graph=[[1,2],[2,3]]', expectedOutput: '2', isHidden: false },
        { input: 'graph=[[1,2]]', expectedOutput: '1', isHidden: false },
        { input: 'graph=[[1,2],[1,3],[2,3]]', expectedOutput: '2', isHidden: false },
        { input: 'graph=[[1,2],[2,3],[3,4]]', expectedOutput: '2', isHidden: true },
        { input: 'graph=[[1,2],[1,3],[1,4]]', expectedOutput: '3', isHidden: true },
        { input: 'graph=[[1,2],[3,4]]', expectedOutput: '0', isHidden: true },
        { input: 'graph=[[1,2],[2,1]]', expectedOutput: '1', isHidden: true },
        { input: 'graph=[[1,2],[2,3],[3,1]]', expectedOutput: '2', isHidden: true },
        { input: 'graph=[[1,2],[2,3],[3,4],[4,1]]', expectedOutput: '2', isHidden: true },
        { input: 'graph=[[1,5],[2,5],[3,5],[4,5]]', expectedOutput: '4', isHidden: true },
      ],
    },
  ];

  for (const p of problemsData) {
    const { primaryTopicSlug, topicSlugs, examples, testCases, solutions, ...problemFields } = p;
    const problem = await prisma.problem.upsert({
      where: { slug: p.slug },
      update: {
        ...problemFields,
        authorId: trainer.id,
      },
      create: {
        ...problemFields,
        authorId: trainer.id,
      },
    });

    // Seed ProblemTopic relations
    await prisma.problemTopic.deleteMany({ where: { problemId: problem.id } });
    for (const tSlug of topicSlugs) {
      const topicId = seededTopics[tSlug];
      if (topicId) {
        await prisma.problemTopic.create({
          data: {
            problemId: problem.id,
            topicId,
            isPrimary: tSlug === primaryTopicSlug,
          },
        });
      }
    }

    // Seed Examples
    await prisma.problemExample.deleteMany({ where: { problemId: problem.id } });
    for (const ex of examples) {
      await prisma.problemExample.create({
        data: {
          problemId: problem.id,
          input: ex.input,
          output: ex.output,
          explanation: (ex as { explanation?: string }).explanation || null,
          order: ex.order,
        },
      });
    }

    // Seed exactly 10 ProblemTestCases (sample + hidden test cases for grading)
    await prisma.problemTestCase.deleteMany({ where: { problemId: problem.id } });
    for (let i = 0; i < testCases.length; i++) {
      const tc = testCases[i]!;
      await prisma.problemTestCase.create({
        data: {
          problemId: problem.id,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          isHidden: tc.isHidden,
          orderIndex: i,
          timeLimitMs: 2000,
          memoryLimitKb: 262144,
        },
      });
    }

    // Seed Official Reference Solutions
    await prisma.problemSolution.deleteMany({ where: { problemId: problem.id } });
    if (solutions && Array.isArray(solutions)) {
      for (const sol of solutions) {
        await prisma.problemSolution.create({
          data: {
            problemId: problem.id,
            language: sol.language,
            code: sol.code,
            title: sol.title || 'Official Solution',
            explanation: sol.explanation || null,
            timeComplexity: sol.timeComplexity || null,
            spaceComplexity: sol.spaceComplexity || null,
          },
        });
      }
    }

    console.log(`  ✓ Problem seeded: ${problem.title} [${problem.difficulty}, ${problem.status}] with ${testCases.length} test cases and ${(solutions || []).length} solutions`);
  }

  // 5. Seed or Upsert Gamification Badge Definitions
  const initialBadges = [
    {
      slug: 'first-solve',
      name: 'First Problem',
      description: 'Submitted and accepted your very first problem solution.',
      icon: '🛡️',
      category: 'Milestone',
      rarity: 'Common',
      criteriaType: 'PROBLEMS_SOLVED',
      criteriaThreshold: 1,
    },
    {
      slug: 'problem-solver',
      name: '10 Problems Solver',
      description: 'Successfully cracked 10 competitive DSA problems.',
      icon: '💯',
      category: 'Milestone',
      rarity: 'Rare',
      criteriaType: 'PROBLEMS_SOLVED',
      criteriaThreshold: 10,
    },
    {
      slug: 'dedicated-coder',
      name: 'Dedicated Coder',
      description: 'Reach a milestone of 25 solved problems.',
      icon: '🏆',
      category: 'Milestone',
      rarity: 'Epic',
      criteriaType: 'PROBLEMS_SOLVED',
      criteriaThreshold: 25,
    },
    {
      slug: 'streak-warrior',
      name: '7-Day Streak Warrior',
      description: 'Practice consistently every single day for a week.',
      icon: '🔥',
      category: 'Streak',
      rarity: 'Rare',
      criteriaType: 'STREAK_DAYS',
      criteriaThreshold: 7,
    },
    {
      slug: 'centurion-streak',
      name: 'Centurion Streak (30 Days)',
      description: 'Solve problems consecutively for 30 days in a row.',
      icon: '⚡',
      category: 'Streak',
      rarity: 'Legendary',
      criteriaType: 'STREAK_DAYS',
      criteriaThreshold: 30,
    },
    {
      slug: 'dsa-explorer',
      name: 'DSA Explorer',
      description: 'Solve problems across at least 3 distinct DSA topics.',
      icon: '🌟',
      category: 'Topic',
      rarity: 'Rare',
      criteriaType: 'TOPICS_COVERED',
      criteriaThreshold: 3,
    },
  ];

  for (const b of initialBadges) {
    await prisma.badgeDefinition.upsert({
      where: { slug: b.slug },
      update: {
        name: b.name,
        description: b.description,
        icon: b.icon,
        category: b.category,
        rarity: b.rarity,
        criteriaType: b.criteriaType,
        criteriaThreshold: b.criteriaThreshold,
      },
      create: b,
    });
  }
  console.log(`  ✓ Gamification badges seeded: ${initialBadges.length} definitions`);

  // 6. Seed Additional Cohort Batches & Assign Members
  console.log('\n🏫 Seeding Additional Batches (Organizations) & Cohort Rosters...');
  const batchIith = await prisma.organization.upsert({
    where: { slug: 'iith-elite-2026' },
    update: {
      name: 'IIT Hyderabad — Elite DSA Batch A',
      description: 'Flagship competitive programming, graph algorithms, and weekly proctored tests.',
    },
    create: {
      name: 'IIT Hyderabad — Elite DSA Batch A',
      slug: 'iith-elite-2026',
      description: 'Flagship competitive programming, graph algorithms, and weekly proctored tests.',
    },
  });

  const batchNitt = await prisma.organization.upsert({
    where: { slug: 'nitt-spring-2026' },
    update: {
      name: 'NIT Trichy — Spring Placement Cohort',
      description: 'Core DSA mastery, sliding window, trees, and placement readiness.',
    },
    create: {
      name: 'NIT Trichy — Spring Placement Cohort',
      slug: 'nitt-spring-2026',
      description: 'Core DSA mastery, sliding window, trees, and placement readiness.',
    },
  });

  const allSeededUsers = await prisma.user.findMany();
  const userByEmail = new Map(allSeededUsers.map((u) => [u.email, u]));
  const trainerUser = userByEmail.get('sarah.chen@numu.io');

  if (trainerUser) {
    for (const targetOrg of [org, batchIith, batchNitt]) {
      await prisma.organizationMember.upsert({
        where: {
          organizationId_userId: { organizationId: targetOrg.id, userId: trainerUser.id },
        },
        update: { role: OrganizationRole.TRAINER },
        create: {
          organizationId: targetOrg.id,
          userId: trainerUser.id,
          role: OrganizationRole.TRAINER,
        },
      });
    }
  }

  const batchAssignments: { email: string; orgId: string }[] = [
    { email: 'johnny@numu.io', orgId: org.id },
    { email: 'david.kim@numu.io', orgId: org.id },
    { email: 'rohan.verma@numu.io', orgId: org.id },
    { email: 'aarav.sharma@numu.io', orgId: batchIith.id },
    { email: 'ananya.iyer@numu.io', orgId: batchIith.id },
    { email: 'elena.rostova@numu.io', orgId: batchNitt.id },
    { email: 'diya.nair@numu.io', orgId: batchNitt.id },
  ];

  for (const assign of batchAssignments) {
    const stu = userByEmail.get(assign.email);
    if (!stu) continue;
    await prisma.organizationMember.upsert({
      where: {
        organizationId_userId: { organizationId: assign.orgId, userId: stu.id },
      },
      update: { role: OrganizationRole.MEMBER },
      create: {
        organizationId: assign.orgId,
        userId: stu.id,
        role: OrganizationRole.MEMBER,
      },
    });
  }
  console.log('  ✓ Assigned students and trainers across 3 Cohort Batches');

  // 7. Seed Judge0 Code Submissions, XP, Badges, and Problem Acceptance Rates
  console.log('\n⚡ Seeding Student Code Submissions, 50% Curriculum Progress & XP Ledger...');
  const allProblems = await prisma.problem.findMany();
  const problemBySlug = new Map(allProblems.map((p) => [p.slug, p]));

  const twoSumProb = problemBySlug.get('two-sum');
  const validParensProb = problemBySlug.get('valid-parentheses');
  const containerProb = problemBySlug.get('container-with-most-water');
  const threeSumProb = problemBySlug.get('3sum');
  const climbingStairsProb = problemBySlug.get('climbing-stairs');
  const longestSubstrProb = problemBySlug.get('longest-substring-without-repeating-characters');
  const reverseListProb = problemBySlug.get('reverse-linked-list');
  const maxDepthTreeProb = problemBySlug.get('maximum-depth-of-binary-tree');
  const numIslandsProb = problemBySlug.get('number-of-islands');
  const coinChangeProb = problemBySlug.get('coin-change');

  await prisma.submission.deleteMany({});
  await prisma.xpTransaction.deleteMany({});
  await prisma.userBadge.deleteMany({});

  // Find ALL accounts matching Johnny (e.g. johnny@numu.io plus any custom registered Johnny user)
  const johnnyUsers = allSeededUsers.filter(
    (u) =>
      u.email.toLowerCase().includes('johnny') ||
      (u.username && u.username.toLowerCase().includes('johnny')) ||
      (u.name && u.name.toLowerCase().includes('johnny')),
  );
  const halfProgressEmails = Array.from(
    new Set(['johnny@numu.io', 'elena.rostova@numu.io', ...johnnyUsers.map((u) => u.email)]),
  );

  const daysAgo = (d: number, hoursOffset = 2) =>
    new Date(Date.now() - d * 86400_000 - hoursOffset * 3600_000);

  // Build 50% curriculum progress (5 of 10 published problems solved across 5 topics + 1 attempted in-progress)
  const halfProgressSubmissions = halfProgressEmails.flatMap((email) => [
    {
      email,
      problem: twoSumProb,
      language: 'cpp',
      verdict: SubmissionVerdict.ACCEPTED,
      status: SubmissionStatus.COMPLETED,
      runtimeMs: 4,
      memoryKb: 8420,
      testsPassed: 10,
      totalTests: 10,
      createdAt: daysAgo(4, 3),
      code: '#include <bits/stdc++.h>\nusing namespace std;\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        unordered_map<int, int> seen;\n        for (int i = 0; i < (int)nums.size(); ++i) {\n            if (seen.count(target - nums[i])) return {seen[target - nums[i]], i};\n            seen[nums[i]] = i;\n        }\n        return {};\n    }\n};',
    },
    {
      email,
      problem: validParensProb,
      language: 'python',
      verdict: SubmissionVerdict.ACCEPTED,
      status: SubmissionStatus.COMPLETED,
      runtimeMs: 18,
      memoryKb: 13800,
      testsPassed: 10,
      totalTests: 10,
      createdAt: daysAgo(3, 4),
      code: 'class Solution:\n    def isValid(self, s: str) -> bool:\n        stack = []\n        mapping = {")": "(", "}": "{", "]": "["}\n        for ch in s:\n            if ch in mapping:\n                if not stack or stack.pop() != mapping[ch]:\n                    return False\n            else:\n                stack.append(ch)\n        return not stack',
    },
    {
      email,
      problem: longestSubstrProb,
      language: 'python',
      verdict: SubmissionVerdict.ACCEPTED,
      status: SubmissionStatus.COMPLETED,
      runtimeMs: 36,
      memoryKb: 14100,
      testsPassed: 10,
      totalTests: 10,
      createdAt: daysAgo(2, 2),
      code: 'class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        seen = {}\n        left = best = 0\n        for r, ch in enumerate(s):\n            if ch in seen and seen[ch] >= left:\n                left = seen[ch] + 1\n            seen[ch] = r\n            best = max(best, r - left + 1)\n        return best',
    },
    {
      email,
      problem: reverseListProb,
      language: 'cpp',
      verdict: SubmissionVerdict.ACCEPTED,
      status: SubmissionStatus.COMPLETED,
      runtimeMs: 6,
      memoryKb: 9200,
      testsPassed: 10,
      totalTests: 10,
      createdAt: daysAgo(1, 5),
      code: 'class Solution {\npublic:\n    ListNode* reverseList(ListNode* head) {\n        ListNode *prev = nullptr, *curr = head;\n        while (curr) {\n            ListNode* nxt = curr->next;\n            curr->next = prev;\n            prev = curr;\n            curr = nxt;\n        }\n        return prev;\n    }\n};',
    },
    {
      email,
      problem: containerProb,
      language: 'cpp',
      verdict: SubmissionVerdict.ACCEPTED,
      status: SubmissionStatus.COMPLETED,
      runtimeMs: 12,
      memoryKb: 11200,
      testsPassed: 10,
      totalTests: 10,
      createdAt: daysAgo(0, 1),
      code: 'class Solution {\npublic:\n    int maxArea(vector<int>& height) {\n        int l = 0, r = (int)height.size() - 1, best = 0;\n        while (l < r) {\n            best = max(best, min(height[l], height[r]) * (r - l));\n            if (height[l] < height[r]) ++l; else --r;\n        }\n        return best;\n    }\n};',
    },
    {
      email,
      problem: maxDepthTreeProb,
      language: 'python',
      verdict: SubmissionVerdict.WRONG_ANSWER,
      status: SubmissionStatus.COMPLETED,
      runtimeMs: 25,
      memoryKb: 14200,
      testsPassed: 7,
      totalTests: 10,
      createdAt: daysAgo(0, 0),
      stderr: 'Expected depth 4 on skewed tree, got 3.',
      code: 'class Solution:\n    def maxDepth(self, root) -> int:\n        # In progress solution\n        return 0',
    },
  ]);

  const sampleSubmissions = [
    ...halfProgressSubmissions,
    {
      email: 'diya.nair@numu.io',
      problem: twoSumProb,
      language: 'java',
      verdict: SubmissionVerdict.ACCEPTED,
      status: SubmissionStatus.COMPLETED,
      runtimeMs: 2,
      memoryKb: 41200,
      testsPassed: 10,
      totalTests: 10,
      createdAt: daysAgo(6, 2),
      code: 'import java.util.*;\nclass Solution {\n    public int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            if (map.containsKey(target - nums[i])) return new int[]{map.get(target - nums[i]), i};\n            map.put(nums[i], i);\n        }\n        return new int[0];\n    }\n}',
    },
    {
      email: 'diya.nair@numu.io',
      problem: validParensProb,
      language: 'java',
      verdict: SubmissionVerdict.ACCEPTED,
      status: SubmissionStatus.COMPLETED,
      runtimeMs: 3,
      memoryKb: 40500,
      testsPassed: 10,
      totalTests: 10,
      createdAt: daysAgo(5, 2),
      code: 'import java.util.*;\nclass Solution {\n    public boolean isValid(String s) {\n        Deque<Character> st = new ArrayDeque<>();\n        for (char c : s.toCharArray()) {\n            if (c == \'(\') st.push(\')\');\n            else if (c == \'{\') st.push(\'}\');\n            else if (c == \'[\') st.push(\']\');\n            else if (st.isEmpty() || st.pop() != c) return false;\n        }\n        return st.isEmpty();\n    }\n}',
    },
    {
      email: 'diya.nair@numu.io',
      problem: threeSumProb,
      language: 'python',
      verdict: SubmissionVerdict.ACCEPTED,
      status: SubmissionStatus.COMPLETED,
      runtimeMs: 410,
      memoryKb: 18400,
      testsPassed: 10,
      totalTests: 10,
      createdAt: daysAgo(4, 2),
      code: 'class Solution:\n    def threeSum(self, nums: list[int]) -> list[list[int]]:\n        nums.sort()\n        res = []\n        return res',
    },
    {
      email: 'diya.nair@numu.io',
      problem: reverseListProb,
      language: 'java',
      verdict: SubmissionVerdict.ACCEPTED,
      status: SubmissionStatus.COMPLETED,
      runtimeMs: 1,
      memoryKb: 39800,
      testsPassed: 10,
      totalTests: 10,
      createdAt: daysAgo(3, 2),
      code: 'class Solution { public ListNode reverseList(ListNode head) { return head; } }',
    },
    {
      email: 'diya.nair@numu.io',
      problem: maxDepthTreeProb,
      language: 'java',
      verdict: SubmissionVerdict.ACCEPTED,
      status: SubmissionStatus.COMPLETED,
      runtimeMs: 1,
      memoryKb: 39500,
      testsPassed: 10,
      totalTests: 10,
      createdAt: daysAgo(2, 2),
      code: 'class Solution { public int maxDepth(TreeNode root) { return root == null ? 0 : 1 + Math.max(maxDepth(root.left), maxDepth(root.right)); } }',
    },
    {
      email: 'diya.nair@numu.io',
      problem: numIslandsProb,
      language: 'java',
      verdict: SubmissionVerdict.ACCEPTED,
      status: SubmissionStatus.COMPLETED,
      runtimeMs: 5,
      memoryKb: 44100,
      testsPassed: 10,
      totalTests: 10,
      createdAt: daysAgo(1, 2),
      code: 'class Solution { public int numIslands(char[][] grid) { return 1; } }',
    },
    {
      email: 'diya.nair@numu.io',
      problem: climbingStairsProb,
      language: 'python',
      verdict: SubmissionVerdict.ACCEPTED,
      status: SubmissionStatus.COMPLETED,
      runtimeMs: 21,
      memoryKb: 13600,
      testsPassed: 10,
      totalTests: 10,
      createdAt: daysAgo(0, 2),
      code: 'class Solution:\n    def climbStairs(self, n: int) -> int:\n        return n',
    },
    {
      email: 'aarav.sharma@numu.io',
      problem: twoSumProb,
      language: 'cpp',
      verdict: SubmissionVerdict.ACCEPTED,
      status: SubmissionStatus.COMPLETED,
      runtimeMs: 3,
      memoryKb: 8300,
      testsPassed: 10,
      totalTests: 10,
      createdAt: daysAgo(2, 3),
      code: '// Optimal hash map solution in C++\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) { return {0, 1}; }\n};',
    },
    {
      email: 'aarav.sharma@numu.io',
      problem: coinChangeProb,
      language: 'cpp',
      verdict: SubmissionVerdict.ACCEPTED,
      status: SubmissionStatus.COMPLETED,
      runtimeMs: 16,
      memoryKb: 12400,
      testsPassed: 10,
      totalTests: 10,
      createdAt: daysAgo(1, 3),
      code: 'class Solution {\npublic:\n    int coinChange(vector<int>& coins, int amount) { return 3; }\n};',
    },
    {
      email: 'aarav.sharma@numu.io',
      problem: threeSumProb,
      language: 'cpp',
      verdict: SubmissionVerdict.WRONG_ANSWER,
      status: SubmissionStatus.COMPLETED,
      runtimeMs: 42,
      memoryKb: 14100,
      testsPassed: 6,
      totalTests: 10,
      createdAt: daysAgo(0, 4),
      stderr: 'Test case #7 failed: Duplicate triplet [-1, 0, 1] found in output.',
      code: 'class Solution {\npublic:\n    vector<vector<int>> threeSum(vector<int>& nums) {\n        // Missing duplicate skip condition\n        return {};\n    }\n};',
    },
    {
      email: 'aarav.sharma@numu.io',
      problem: threeSumProb,
      language: 'cpp',
      verdict: SubmissionVerdict.TIME_LIMIT_EXCEEDED,
      status: SubmissionStatus.COMPLETED,
      runtimeMs: 2000,
      memoryKb: 14500,
      testsPassed: 8,
      totalTests: 10,
      createdAt: daysAgo(0, 2),
      stderr: 'Execution timed out after 2000ms on N=3000 input.',
      code: '// O(N^3) brute-force approach\nclass Solution {};',
    },
    {
      email: 'rohan.verma@numu.io',
      problem: validParensProb,
      language: 'python',
      verdict: SubmissionVerdict.ACCEPTED,
      status: SubmissionStatus.COMPLETED,
      runtimeMs: 24,
      memoryKb: 13900,
      testsPassed: 10,
      totalTests: 10,
      createdAt: daysAgo(1, 4),
      code: 'class Solution:\n    def isValid(self, s: str) -> bool:\n        return True',
    },
    {
      email: 'rohan.verma@numu.io',
      problem: climbingStairsProb,
      language: 'python',
      verdict: SubmissionVerdict.ACCEPTED,
      status: SubmissionStatus.COMPLETED,
      runtimeMs: 20,
      memoryKb: 13700,
      testsPassed: 10,
      totalTests: 10,
      createdAt: daysAgo(0, 3),
      code: 'class Solution:\n    def climbStairs(self, n: int) -> int:\n        return n',
    },
    {
      email: 'rohan.verma@numu.io',
      problem: containerProb,
      language: 'cpp',
      verdict: SubmissionVerdict.COMPILATION_ERROR,
      status: SubmissionStatus.COMPLETED,
      runtimeMs: 0,
      memoryKb: 0,
      testsPassed: 0,
      totalTests: 10,
      createdAt: daysAgo(0, 1),
      compileError: 'solution.cpp:8:19: error: expected \';\' before \'return\'\n    8 |         best = max(best, area)\n      |                   ^',
      code: 'class Solution {\npublic:\n    int maxArea(vector<int>& height) {\n        return 0\n    }\n};',
    },
    {
      email: 'david.kim@numu.io',
      problem: twoSumProb,
      language: 'python',
      verdict: SubmissionVerdict.ACCEPTED,
      status: SubmissionStatus.COMPLETED,
      runtimeMs: 31,
      memoryKb: 14200,
      testsPassed: 10,
      totalTests: 10,
      createdAt: daysAgo(1, 2),
      code: 'class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        seen = {}\n        for i, v in enumerate(nums):\n            if target - v in seen:\n                return [seen[target - v], i]\n            seen[v] = i\n        return []',
    },
    {
      email: 'david.kim@numu.io',
      problem: climbingStairsProb,
      language: 'python',
      verdict: SubmissionVerdict.WRONG_ANSWER,
      status: SubmissionStatus.COMPLETED,
      runtimeMs: 22,
      memoryKb: 13600,
      testsPassed: 4,
      totalTests: 10,
      createdAt: daysAgo(0, 2),
      stderr: 'Expected 3 for n=3, received 2.',
      code: 'class Solution:\n    def climbStairs(self, n: int) -> int:\n        return n - 1',
    },
    {
      email: 'ananya.iyer@numu.io',
      problem: twoSumProb,
      language: 'python',
      verdict: SubmissionVerdict.ACCEPTED,
      status: SubmissionStatus.COMPLETED,
      runtimeMs: 29,
      memoryKb: 14100,
      testsPassed: 10,
      totalTests: 10,
      createdAt: daysAgo(0, 5),
      code: 'class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        return [0, 1]',
    },
  ];

  const xpRewardByDiff: Record<string, number> = {
    EASY: 30,
    MEDIUM: 50,
    HARD: 100,
  };

  for (const sub of sampleSubmissions) {
    const stu = userByEmail.get(sub.email);
    if (!stu || !sub.problem) continue;
    await prisma.submission.create({
      data: {
        userId: stu.id,
        problemId: sub.problem.id,
        language: sub.language,
        code: sub.code,
        status: sub.status,
        verdict: sub.verdict,
        runtimeMs: sub.runtimeMs,
        memoryKb: sub.memoryKb,
        testsPassed: sub.testsPassed,
        totalTests: sub.totalTests,
        compileError: (sub as { compileError?: string }).compileError || null,
        stderr: (sub as { stderr?: string }).stderr || null,
        createdAt: sub.createdAt,
      },
    });

    if (sub.verdict === SubmissionVerdict.ACCEPTED) {
      const idempotencyKey = `solve:${stu.id}:${sub.problem.id}`;
      const amount = xpRewardByDiff[sub.problem.difficulty] ?? 30;
      await prisma.xpTransaction.upsert({
        where: { idempotencyKey },
        update: { amount, createdAt: sub.createdAt },
        create: {
          userId: stu.id,
          amount,
          eventType: 'PROBLEM_SOLVED',
          sourceType: 'PROBLEM',
          sourceId: sub.problem.id,
          idempotencyKey,
          policyVersion: 'v1',
          createdAt: sub.createdAt,
        },
      });
    }
  }

  // Award badges for seeded students based on their solved counts
  const firstSolveBadge = await prisma.badgeDefinition.findUnique({ where: { slug: 'first-solve' } });
  const explorerBadge = await prisma.badgeDefinition.findUnique({ where: { slug: 'dsa-explorer' } });
  const streakWarriorBadge = await prisma.badgeDefinition.findUnique({ where: { slug: 'streak-warrior' } });

  for (const email of halfProgressEmails) {
    const stu = userByEmail.get(email);
    if (!stu) continue;
    if (firstSolveBadge) {
      await prisma.userBadge.upsert({
        where: { userId_badgeId: { userId: stu.id, badgeId: firstSolveBadge.id } },
        update: {},
        create: { userId: stu.id, badgeId: firstSolveBadge.id, awardedAt: daysAgo(4, 3) },
      });
    }
    if (explorerBadge) {
      await prisma.userBadge.upsert({
        where: { userId_badgeId: { userId: stu.id, badgeId: explorerBadge.id } },
        update: {},
        create: { userId: stu.id, badgeId: explorerBadge.id, awardedAt: daysAgo(1, 5) },
      });
    }
  }

  const diyaUser = userByEmail.get('diya.nair@numu.io');
  if (diyaUser && firstSolveBadge && explorerBadge && streakWarriorBadge) {
    for (const b of [firstSolveBadge, explorerBadge, streakWarriorBadge]) {
      await prisma.userBadge.upsert({
        where: { userId_badgeId: { userId: diyaUser.id, badgeId: b.id } },
        update: {},
        create: { userId: diyaUser.id, badgeId: b.id },
      });
    }
  }

  // Update problem acceptance rates
  if (twoSumProb) await prisma.problem.update({ where: { id: twoSumProb.id }, data: { acceptanceRate: 88.5 } });
  if (validParensProb) await prisma.problem.update({ where: { id: validParensProb.id }, data: { acceptanceRate: 82.0 } });
  if (containerProb) await prisma.problem.update({ where: { id: containerProb.id }, data: { acceptanceRate: 68.4 } });
  if (threeSumProb) await prisma.problem.update({ where: { id: threeSumProb.id }, data: { acceptanceRate: 54.2 } });
  if (climbingStairsProb) await prisma.problem.update({ where: { id: climbingStairsProb.id }, data: { acceptanceRate: 75.0 } });
  console.log(`  ✓ Seeded ${sampleSubmissions.length} Judge0 code submissions, XP ledger & badges`);

  // 8. Seed Weekly Proctored Assessments (Tests), Questions, and Student Attempts
  console.log('\n🛡️ Seeding Proctored Assessments & Student Test Attempts...');
  const authorAdmin = userByEmail.get('alex.rivera@numu.io');

  if (twoSumProb && validParensProb && containerProb && threeSumProb && climbingStairsProb) {
    const test1 = await prisma.test.upsert({
      where: { slug: 'weekly-dsa-assessment-1' },
      update: {
        title: 'Weekly DSA Assessment #1 — Arrays & Two Pointers',
        description: 'Proctored coding evaluation covering hash maps, two pointers, and stack validation.',
        weekNumber: 1,
        durationMinutes: 60,
        passPercentage: 60,
        totalMarks: 100,
        status: ContentStatus.PUBLISHED,
        maxTabSwitches: 3,
        requireFullscreen: true,
        disableCopyPaste: true,
      },
      create: {
        slug: 'weekly-dsa-assessment-1',
        title: 'Weekly DSA Assessment #1 — Arrays & Two Pointers',
        description: 'Proctored coding evaluation covering hash maps, two pointers, and stack validation.',
        weekNumber: 1,
        instructions:
          '1. Fullscreen mode is mandatory throughout the assessment.\n2. Copy and Paste are disabled inside the coding editor.\n3. Switching tabs more than 3 times will automatically submit your exam.',
        durationMinutes: 60,
        passPercentage: 60,
        totalMarks: 100,
        status: ContentStatus.PUBLISHED,
        maxTabSwitches: 3,
        requireFullscreen: true,
        disableCopyPaste: true,
        authorId: authorAdmin?.id ?? null,
      },
    });

    await prisma.testQuestionAssignment.deleteMany({ where: { testId: test1.id } });
    await prisma.testQuestionAssignment.createMany({
      data: [
        { testId: test1.id, problemId: twoSumProb.id, orderIndex: 1, marks: 30 },
        { testId: test1.id, problemId: validParensProb.id, orderIndex: 2, marks: 30 },
        { testId: test1.id, problemId: containerProb.id, orderIndex: 3, marks: 40 },
      ],
    });

    const test2 = await prisma.test.upsert({
      where: { slug: 'weekly-dsa-assessment-2' },
      update: {
        title: 'Weekly DSA Assessment #2 — 3Sum & Dynamic Programming',
        description: 'Mid-cohort proctored assessment on sorting, triplets, and 1D dynamic programming.',
        weekNumber: 2,
        durationMinutes: 90,
        passPercentage: 60,
        totalMarks: 100,
        status: ContentStatus.PUBLISHED,
        maxTabSwitches: 3,
        requireFullscreen: true,
        disableCopyPaste: true,
      },
      create: {
        slug: 'weekly-dsa-assessment-2',
        title: 'Weekly DSA Assessment #2 — 3Sum & Dynamic Programming',
        description: 'Mid-cohort proctored assessment on sorting, triplets, and 1D dynamic programming.',
        weekNumber: 2,
        instructions:
          '1. Fullscreen lock and copy-paste restriction are active.\n2. Exceeding 3 tab switches triggers automatic submission.',
        durationMinutes: 90,
        passPercentage: 60,
        totalMarks: 100,
        status: ContentStatus.PUBLISHED,
        maxTabSwitches: 3,
        requireFullscreen: true,
        disableCopyPaste: true,
        authorId: authorAdmin?.id ?? null,
      },
    });

    await prisma.testQuestionAssignment.deleteMany({ where: { testId: test2.id } });
    await prisma.testQuestionAssignment.createMany({
      data: [
        { testId: test2.id, problemId: climbingStairsProb.id, orderIndex: 1, marks: 40 },
        { testId: test2.id, problemId: threeSumProb.id, orderIndex: 2, marks: 60 },
      ],
    });

    // Seed Student Attempts on Test 1 & Test 2 (including Auto-Submitted Proctoring Violations!)
    await prisma.testAttempt.deleteMany({});

    const diya = userByEmail.get('diya.nair@numu.io');
    const aarav = userByEmail.get('aarav.sharma@numu.io');
    const david = userByEmail.get('david.kim@numu.io');
    const rohan = userByEmail.get('rohan.verma@numu.io');

    for (const email of halfProgressEmails) {
      const halfUser = userByEmail.get(email);
      if (!halfUser) continue;
      await prisma.testAttempt.create({
        data: {
          testId: test1.id,
          userId: halfUser.id,
          startedAt: new Date(Date.now() - 2 * 86400_000),
          expiresAt: new Date(Date.now() - 2 * 86400_000 + 3600_000),
          submittedAt: new Date(Date.now() - 2 * 86400_000 + 2700_000),
          status: TestAttemptStatus.SUBMITTED,
          score: 88,
          percentage: 88,
          passed: true,
          tabSwitchCount: 0,
          fullscreenExitCount: 0,
          autoSubmitted: false,
          answers: {
            create: [
              {
                problemId: twoSumProb.id,
                language: 'cpp',
                code: '// Two Sum AC Solution',
                isSubmitted: true,
                status: 'solved',
                verdict: SubmissionVerdict.ACCEPTED,
                testsPassed: 10,
                totalTests: 10,
                marksAwarded: 30,
              },
              {
                problemId: validParensProb.id,
                language: 'python',
                code: '// Valid Parentheses AC Solution',
                isSubmitted: true,
                status: 'solved',
                verdict: SubmissionVerdict.ACCEPTED,
                testsPassed: 10,
                totalTests: 10,
                marksAwarded: 30,
              },
              {
                problemId: containerProb.id,
                language: 'cpp',
                code: '// Container With Most Water Solution',
                isSubmitted: true,
                status: 'solved',
                verdict: SubmissionVerdict.ACCEPTED,
                testsPassed: 7,
                totalTests: 10,
                marksAwarded: 28,
              },
            ],
          },
        },
      });
    }

    if (diya) {
      await prisma.testAttempt.create({
        data: {
          testId: test1.id,
          userId: diya.id,
          startedAt: new Date(Date.now() - 2 * 86400_000),
          expiresAt: new Date(Date.now() - 2 * 86400_000 + 3600_000),
          submittedAt: new Date(Date.now() - 2 * 86400_000 + 3100_000),
          status: TestAttemptStatus.SUBMITTED,
          score: 76,
          percentage: 76,
          passed: true,
          tabSwitchCount: 1,
          fullscreenExitCount: 0,
          autoSubmitted: false,
          answers: {
            create: [
              {
                problemId: twoSumProb.id,
                language: 'java',
                code: '// Diya Two Sum AC Solution',
                isSubmitted: true,
                status: 'solved',
                verdict: SubmissionVerdict.ACCEPTED,
                testsPassed: 10,
                totalTests: 10,
                marksAwarded: 30,
              },
              {
                problemId: validParensProb.id,
                language: 'java',
                code: '// Diya Valid Parentheses AC Solution',
                isSubmitted: true,
                status: 'solved',
                verdict: SubmissionVerdict.ACCEPTED,
                testsPassed: 10,
                totalTests: 10,
                marksAwarded: 30,
              },
              {
                problemId: containerProb.id,
                language: 'java',
                code: '// Partial solution (4/10 cases)',
                isSubmitted: true,
                status: 'attempted',
                verdict: SubmissionVerdict.WRONG_ANSWER,
                testsPassed: 4,
                totalTests: 10,
                marksAwarded: 16,
              },
            ],
          },
        },
      });
    }

    if (aarav) {
      // Accidentally Auto-Submitted due to >3 Tab Switches — ready to test Reassign Attempt!
      await prisma.testAttempt.create({
        data: {
          testId: test1.id,
          userId: aarav.id,
          startedAt: new Date(Date.now() - 86400_000),
          expiresAt: new Date(Date.now() - 86400_000 + 3600_000),
          submittedAt: new Date(Date.now() - 86400_000 + 1400_000),
          status: TestAttemptStatus.SUBMITTED,
          score: 30,
          percentage: 30,
          passed: false,
          tabSwitchCount: 4,
          fullscreenExitCount: 2,
          autoSubmitted: true,
          terminationReason: 'Auto-submitted: Exceeded maximum allowed tab switches (3)',
          violations: {
            create: [
              { type: TestViolationType.TAB_SWITCH },
              { type: TestViolationType.FULLSCREEN_EXIT },
              { type: TestViolationType.TAB_SWITCH },
              { type: TestViolationType.TAB_SWITCH },
              { type: TestViolationType.TAB_SWITCH },
            ],
          },
          answers: {
            create: [
              {
                problemId: twoSumProb.id,
                language: 'cpp',
                code: '// Solved Q1 before accidental tab switch lock',
                isSubmitted: true,
                status: 'solved',
                verdict: SubmissionVerdict.ACCEPTED,
                testsPassed: 10,
                totalTests: 10,
                marksAwarded: 30,
              },
            ],
          },
        },
      });
    }

    if (rohan) {
      await prisma.testAttempt.create({
        data: {
          testId: test2.id,
          userId: rohan.id,
          startedAt: new Date(Date.now() - 43200_000),
          expiresAt: new Date(Date.now() - 43200_000 + 5400_000),
          submittedAt: new Date(Date.now() - 43200_000 + 4200_000),
          status: TestAttemptStatus.SUBMITTED,
          score: 82,
          percentage: 82,
          passed: true,
          tabSwitchCount: 0,
          fullscreenExitCount: 0,
          autoSubmitted: false,
        },
      });
    }

    if (david) {
      await prisma.testAttempt.create({
        data: {
          testId: test2.id,
          userId: david.id,
          startedAt: new Date(Date.now() - 36000_000),
          expiresAt: new Date(Date.now() - 36000_000 + 5400_000),
          submittedAt: new Date(Date.now() - 36000_000 + 1800_000),
          status: TestAttemptStatus.SUBMITTED,
          score: 40,
          percentage: 40,
          passed: false,
          tabSwitchCount: 4,
          fullscreenExitCount: 1,
          autoSubmitted: true,
          terminationReason: 'Auto-submitted: Exceeded maximum allowed tab switches (3)',
        },
      });
    }
    console.log('  ✓ Seeded 2 Weekly Proctored Tests & 5 Student Test Attempts (including Auto-Submitted violations)');
  }

  // ─────────────────────────────────────────────
  // 10. Seed Practice Tracks & DSA Hub Curation
  // ─────────────────────────────────────────────
  console.log('\n--- Seeding Practice Tracks (Dev, System Design, Core CS) & DSA Hub Curation ---');

  // Featured Test on Dashboard
  const firstTest = await prisma.test.findFirst();
  if (firstTest) {
    await prisma.test.update({
      where: { id: firstTest.id },
      data: { isFeaturedOnDashboard: true },
    });
    console.log(`  ✓ Marked test "${firstTest.title}" as featured on Dashboard`);
  }

  // Daily Challenge & Curated Practice Problems
  const dsaHubProblems = await prisma.problem.findMany({ take: 10, orderBy: { createdAt: 'asc' } });
  if (dsaHubProblems.length > 0) {
    // Seed Daily Challenge for today and adjacent days
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    for (let offset = -2; offset <= 7; offset++) {
      const targetDate = new Date(today);
      targetDate.setUTCDate(today.getUTCDate() + offset);
      const probIndex = Math.abs(offset + 3) % dsaHubProblems.length;
      const prob = dsaHubProblems[probIndex]!;

      await prisma.dailyChallengeSchedule.upsert({
        where: { date: targetDate },
        update: {},
        create: {
          date: targetDate,
          problemId: prob.id,
          xpBonus: prob.difficulty === Difficulty.HARD ? 100 : prob.difficulty === Difficulty.MEDIUM ? 50 : 30,
          instructions: 'Complete daily challenge to sustain your consistency streak and earn bonus platform XP!',
          isActive: true,
        },
      });
    }

    // Seed Curated Practice Problems ("Today's Practice")
    for (let i = 0; i < Math.min(5, dsaHubProblems.length); i++) {
      const prob = dsaHubProblems[i]!;
      await prisma.curatedPracticeProblem.upsert({
        where: { id: `seed-curated-${i + 1}` },
        update: { problemId: prob.id, orderIndex: i, isPinned: i === 0 },
        create: {
          id: `seed-curated-${i + 1}`,
          problemId: prob.id,
          orderIndex: i,
          isPinned: i === 0,
        },
      });
    }
    console.log('  ✓ Seeded 10 Daily Challenge schedules and 5 curated practice problems');
  }

  // Development Tracks & Capstone Projects
  const devTracksData = [
    {
      slug: 'frontend-engineering',
      title: 'Frontend & UI Engineering',
      description: 'React 19, Next.js 15, TypeScript, state management, accessibility & Tailwind CSS architecture.',
      icon: 'Monitor',
      colorTone: 'blue',
      order: 1,
    },
    {
      slug: 'backend-and-apis',
      title: 'Backend & Distributed APIs',
      description: 'Node.js, NestJS, REST, GraphQL, auth flows, caching, and microservices.',
      icon: 'Server',
      colorTone: 'emerald',
      order: 2,
    },
    {
      slug: 'database-engineering',
      title: 'Database Architecture & SQL',
      description: 'PostgreSQL, Prisma ORM, Redis caching, indexing strategies & transaction management.',
      icon: 'Database',
      colorTone: 'purple',
      order: 3,
    },
    {
      slug: 'cloud-and-devops',
      title: 'DevOps & Cloud Infrastructure',
      description: 'Docker containerization, CI/CD pipelines, Kubernetes, monitoring & production deployment.',
      icon: 'Cloud',
      colorTone: 'orange',
      order: 4,
    },
    {
      slug: 'system-design-track',
      title: 'System Design & Scalability',
      description: 'High-level architectures, load balancing, message queues & horizontal partitioning.',
      icon: 'GitBranch',
      colorTone: 'rose',
      order: 5,
    },
  ];

  for (const t of devTracksData) {
    const track = await prisma.devTrack.upsert({
      where: { slug: t.slug },
      update: { title: t.title, description: t.description, icon: t.icon, colorTone: t.colorTone, order: t.order },
      create: t,
    });

    if (t.slug === 'frontend-engineering') {
      await prisma.devModule.upsert({
        where: { id: 'seed-mod-fe-1' },
        update: {},
        create: {
          id: 'seed-mod-fe-1',
          trackId: track.id,
          title: 'Advanced React Server Components & Action Architecture',
          duration: '60 min',
          difficulty: Difficulty.HARD,
          tags: ['React 19', 'Next.js 15', 'TypeScript'],
          totalLessons: 10,
          order: 1,
        },
      });
    } else if (t.slug === 'backend-and-apis') {
      await prisma.devModule.upsert({
        where: { id: 'seed-mod-be-1' },
        update: {},
        create: {
          id: 'seed-mod-be-1',
          trackId: track.id,
          title: 'JWT Auth & Refresh Token Rotation with HttpOnly Cookies',
          duration: '45 min',
          difficulty: Difficulty.MEDIUM,
          tags: ['NestJS', 'Security', 'Argon2'],
          totalLessons: 8,
          order: 1,
        },
      });

      // Seed Capstone Project
      const proj = await prisma.devProject.upsert({
        where: { slug: 'fullstack-expense-tracker' },
        update: {},
        create: {
          slug: 'fullstack-expense-tracker',
          title: 'Fullstack Expense & Budget SaaS',
          description: 'Production-grade Next.js 15 SaaS with Server Actions, PostgreSQL, Prisma ORM, Stripe billing, and JWT auth.',
          trackId: track.id,
          stage: 'building',
          totalSprints: 5,
          techStack: ['Next.js', 'TypeScript', 'PostgreSQL', 'Prisma', 'Stripe', 'Tailwind'],
          starterRepoUrl: 'https://github.com/numu-org/numu-expense-tracker-starter',
          demoUrl: 'https://expense-tracker-demo.vercel.app',
          xpReward: 500,
          isOfficial: true,
          status: ContentStatus.PUBLISHED,
        },
      });

      const milestones = [
        'Setup PostgreSQL schema with Prisma ORM & seed initial categories',
        'Build HttpOnly JWT authentication & refresh token rotation service',
        'Implement monthly budget analytics charts & transaction CRUD',
        'Integrate Stripe Checkout webhook for subscription billing',
        'Configure Docker container & GitHub Actions CI/CD pipeline',
      ];
      for (let mIdx = 0; mIdx < milestones.length; mIdx++) {
        await prisma.devMilestone.upsert({
          where: { id: `seed-mile-${mIdx + 1}` },
          update: {},
          create: {
            id: `seed-mile-${mIdx + 1}`,
            projectId: proj.id,
            title: milestones[mIdx]!,
            order: mIdx + 1,
          },
        });
      }
    }
  }
  console.log('  ✓ Seeded 5 DevTracks, 2 DevModules, 1 Capstone Project & 5 Milestones');

  // System Design Topics & Scenarios
  const sdTopicsData = [
    {
      slug: 'scalability-fundamentals',
      title: '1. Scalability, Load Balancing & Caching',
      category: SystemDesignCategory.FUNDAMENTALS,
      description: 'Stateless architecture, horizontal vs vertical scaling, consistent hashing & distributed caching.',
      order: 1,
      questions: [
        { title: 'Horizontal vs Vertical Scaling & Stateless Services', difficulty: Difficulty.EASY, duration: '15 min' },
        { title: 'Consistent Hashing & Load Balancer Algorithms (L4 vs L7)', difficulty: Difficulty.MEDIUM, duration: '25 min' },
        { title: 'Distributed Caching Strategies (Write-Through, Write-Back, Eviction)', difficulty: Difficulty.MEDIUM, duration: '20 min' },
      ],
    },
    {
      slug: 'databases-sharding-replication',
      title: '2. Database Sharding, Replication & CAP Theorem',
      category: SystemDesignCategory.FUNDAMENTALS,
      description: 'CAP Theorem, PACELC, leader-follower replication & range/hash based database sharding.',
      order: 2,
      questions: [
        { title: 'CAP Theorem, PACELC & Eventual Consistency', difficulty: Difficulty.EASY, duration: '15 min' },
        { title: 'Leader-Follower vs Multi-Leader Replication', difficulty: Difficulty.MEDIUM, duration: '20 min' },
        { title: 'Range-Based vs Hash-Based Database Sharding', difficulty: Difficulty.HARD, duration: '30 min' },
      ],
    },
    {
      slug: 'message-queues-event-driven',
      title: '3. Message Queues, Kafka & Event-Driven Architecture',
      category: SystemDesignCategory.HLD,
      description: 'Pub/Sub models, log-based messaging, dead letter queues, and consumer offset management.',
      order: 3,
      questions: [
        { title: 'Pub/Sub vs Point-to-Point Queues (Kafka vs RabbitMQ)', difficulty: Difficulty.MEDIUM, duration: '25 min' },
        { title: 'Idempotency, Dead Letter Queues & Exactly-Once Delivery', difficulty: Difficulty.HARD, duration: '30 min' },
      ],
    },
    {
      slug: 'lld-solid-design-patterns',
      title: '4. Low-Level Design (LLD): SOLID & GoF Design Patterns',
      category: SystemDesignCategory.LLD,
      description: 'Object-oriented design principles, behavioral/creational patterns, and parking lot/elevator design.',
      order: 4,
      questions: [
        { title: 'SOLID Principles with Production TypeScript/Java Examples', difficulty: Difficulty.EASY, duration: '20 min' },
        { title: 'Factory, Builder, Singleton & Strategy Patterns', difficulty: Difficulty.MEDIUM, duration: '25 min' },
        { title: 'Design a Parking Lot & Elevator Control System (LLD)', difficulty: Difficulty.HARD, duration: '40 min' },
      ],
    },
    {
      slug: 'real-world-hld-case-studies',
      title: '5. Real-World HLD Case Studies (URL Shortener, Chat, Feed)',
      category: SystemDesignCategory.CASE_STUDIES,
      description: 'End-to-end distributed system architectures for top tech product interview rounds.',
      order: 5,
      questions: [
        { title: 'Design a Distributed URL Shortener (TinyURL) at 100M DAU', difficulty: Difficulty.MEDIUM, duration: '35 min' },
        { title: 'Design WhatsApp / Real-Time WebSocket Chat System', difficulty: Difficulty.HARD, duration: '45 min' },
        { title: 'Design a Code Execution Engine (Judge0 / LeetCode Sandbox)', difficulty: Difficulty.HARD, duration: '45 min' },
      ],
    },
  ];

  for (const sdt of sdTopicsData) {
    const topic = await prisma.systemDesignTopic.upsert({
      where: { slug: sdt.slug },
      update: { title: sdt.title, category: sdt.category, description: sdt.description, order: sdt.order },
      create: { slug: sdt.slug, title: sdt.title, category: sdt.category, description: sdt.description, order: sdt.order },
    });

    for (let qIdx = 0; qIdx < sdt.questions.length; qIdx++) {
      const q = sdt.questions[qIdx]!;
      await prisma.systemDesignQuestion.upsert({
        where: { id: `seed-sdq-${sdt.slug}-${qIdx + 1}` },
        update: { title: q.title, difficulty: q.difficulty, duration: q.duration, order: qIdx + 1 },
        create: {
          id: `seed-sdq-${sdt.slug}-${qIdx + 1}`,
          topicId: topic.id,
          title: q.title,
          difficulty: q.difficulty,
          duration: q.duration,
          order: qIdx + 1,
        },
      });
    }
  }
  console.log('  ✓ Seeded 5 System Design Topics & 14 Architectural Scenarios');

  // Core CS Subjects, Topics & Questions
  const coreSubjectsData = [
    {
      slug: 'dbms',
      type: CoreSubjectType.DBMS,
      title: '1. DBMS & SQL (Indexing, ACID, Normalization & Joins)',
      description: 'Relational database concepts, SQL query execution, transaction properties, and indexing algorithms.',
      icon: 'Database',
      order: 1,
      topics: [
        {
          slug: 'dbms-fundamentals',
          title: 'Database Engines, Transactions & Storage',
          order: 1,
          questions: [
            { title: 'ACID Properties, Isolation Levels & Concurrency Control', difficulty: Difficulty.EASY },
            { title: 'B-Trees vs B+ Trees Indexing & Query Execution Plans', difficulty: Difficulty.MEDIUM },
            { title: '1NF, 2NF, 3NF & BCNF Database Normalization', difficulty: Difficulty.MEDIUM },
            { title: 'SQL Window Functions (ROW_NUMBER, RANK, DENSE_RANK)', difficulty: Difficulty.MEDIUM },
          ],
        },
      ],
    },
    {
      slug: 'os',
      type: CoreSubjectType.OS,
      title: '2. Operating Systems (Processes, Threads, Deadlocks & Memory)',
      description: 'Kernel internals, scheduling algorithms, thread synchronization, deadlocks, and virtual memory.',
      icon: 'Cpu',
      order: 2,
      topics: [
        {
          slug: 'os-core',
          title: 'Process Management & Memory Virtualization',
          order: 1,
          questions: [
            { title: 'Process vs Thread, Context Switching & PCB', difficulty: Difficulty.EASY },
            { title: 'CPU Scheduling Algorithms (FCFS, SJF, Round Robin, Priority)', difficulty: Difficulty.MEDIUM },
            { title: 'Deadlock Conditions, Banker’s Algorithm & Semaphores/Mutex', difficulty: Difficulty.HARD },
            { title: 'Virtual Memory, Paging, TLB & Page Replacement (LRU, Optimal)', difficulty: Difficulty.MEDIUM },
          ],
        },
      ],
    },
    {
      slug: 'cn',
      type: CoreSubjectType.CN,
      title: '3. Computer Networks (OSI, TCP/IP, HTTP/3, DNS & TLS)',
      description: 'Network protocol layers, routing, reliable transport, secure sockets, and HTTP lifecycle.',
      icon: 'Network',
      order: 3,
      topics: [
        {
          slug: 'cn-protocols',
          title: 'Protocol Suites, Transport & Security',
          order: 1,
          questions: [
            { title: 'OSI 7-Layer Model vs TCP/IP Protocol Suite', difficulty: Difficulty.EASY },
            { title: 'TCP 3-Way Handshake, Flow Control & Congestion Control', difficulty: Difficulty.MEDIUM },
            { title: 'What Happens When You Type a URL in the Browser (DNS + TLS + HTTP)', difficulty: Difficulty.MEDIUM },
          ],
        },
      ],
    },
    {
      slug: 'oops',
      type: CoreSubjectType.OOPS,
      title: '4. Object-Oriented Programming (Encapsulation, Polymorphism & VTables)',
      description: 'Core OOP pillars, virtual method dispatch tables, abstract interfaces, and design best practices.',
      icon: 'Code2',
      order: 4,
      topics: [
        {
          slug: 'oops-concepts',
          title: 'OOP Pillars, Dispatch & Clean Code',
          order: 1,
          questions: [
            { title: '4 Pillars of OOP: Encapsulation, Abstraction, Inheritance, Polymorphism', difficulty: Difficulty.EASY },
            { title: 'Compile-Time vs Run-Time Polymorphism & Virtual Tables (vtable)', difficulty: Difficulty.MEDIUM },
            { title: 'Abstract Classes vs Interfaces & Composition over Inheritance', difficulty: Difficulty.EASY },
          ],
        },
      ],
    },
  ];

  for (const cs of coreSubjectsData) {
    const subject = await prisma.coreSubject.upsert({
      where: { type: cs.type },
      update: { title: cs.title, description: cs.description, icon: cs.icon, order: cs.order },
      create: { slug: cs.slug, type: cs.type, title: cs.title, description: cs.description, icon: cs.icon, order: cs.order },
    });

    for (const ct of cs.topics) {
      const topic = await prisma.coreTopic.upsert({
        where: { slug: ct.slug },
        update: { title: ct.title, order: ct.order },
        create: { subjectId: subject.id, slug: ct.slug, title: ct.title, order: ct.order },
      });

      for (let qIdx = 0; qIdx < ct.questions.length; qIdx++) {
        const q = ct.questions[qIdx]!;
        await prisma.coreQuestion.upsert({
          where: { id: `seed-coreq-${ct.slug}-${qIdx + 1}` },
          update: { title: q.title, difficulty: q.difficulty, order: qIdx + 1 },
          create: {
            id: `seed-coreq-${ct.slug}-${qIdx + 1}`,
            topicId: topic.id,
            title: q.title,
            difficulty: q.difficulty,
            order: qIdx + 1,
          },
        });
      }
    }
  }
  console.log('  ✓ Seeded 4 Core CS Subjects, 4 Syllabi Topics & 14 Interview Questions');

  const totalUsers = await prisma.user.count();
  const totalProfiles = await prisma.profile.count();
  const totalOrgs = await prisma.organization.count();
  const totalTopics = await prisma.topic.count();
  const totalProblems = await prisma.problem.count();
  const totalBadges = await prisma.badgeDefinition.count();
  console.log(
    `\n✅ Seeding complete! Users: ${totalUsers}, Profiles: ${totalProfiles}, Orgs: ${totalOrgs}, Topics: ${totalTopics}, Problems: ${totalProblems}, Badges: ${totalBadges}`,
  );
  console.log(`🔑 All seeded users have password: "Password123!"`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
