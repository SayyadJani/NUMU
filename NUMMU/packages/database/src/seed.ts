import { PrismaClient, Role, OrganizationRole } from '@prisma/client';

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
