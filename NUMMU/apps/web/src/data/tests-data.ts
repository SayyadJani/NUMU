import type { TestItem, TestQuestion } from '@/types/tests';

// ─── Generate 50 realistic questions for Weekly DSA Test - 12 ─────────────────
const SAMPLE_QUESTIONS: Partial<TestQuestion>[] = [
  {
    number: 1,
    title: 'Two Sum',
    difficulty: 'Easy',
    tags: ['Arrays', 'Hashing'],
    type: 'coding',
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.`,
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
      },
      {
        input: 'nums = [3,2,4], target = 6',
        output: '[1,2]',
      },
      {
        input: 'nums = [3,3], target = 6',
        output: '[0,1]',
      },
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.',
    ],
    boilerplate: {
      Python: `class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        # Write your code here\n        seen = {}\n        for i, n in enumerate(nums):\n            diff = target - n\n            if diff in seen:\n                return [seen[diff], i]\n            seen[n] = i\n        return []`,
      'C++': `class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your code here\n        unordered_map<int, int> seen;\n        for (int i = 0; i < nums.size(); i++) {\n            if (seen.count(target - nums[i])) return {seen[target - nums[i]], i};\n            seen[nums[i]] = i;\n        }\n        return {};\n    }\n};`,
      Java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your code here\n        return new int[]{};\n    }\n}`,
      JavaScript: `/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nvar twoSum = function(nums, target) {\n    // Write your code here\n};`,
      TypeScript: `function twoSum(nums: number[], target: number): number[] {\n    // Write your code here\n    return [];\n}`,
    },
    testCases: [
      { input: 'nums = [2,7,11,15], target = 9', expectedOutput: '[0,1]' },
      { input: 'nums = [3,2,4], target = 6', expectedOutput: '[1,2]' },
    ],
  },
  {
    number: 2,
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    tags: ['Stack', 'Strings'],
    type: 'coding',
    description: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if open brackets are closed by the same type of brackets in the correct order.`,
    examples: [
      { input: 's = "()"', output: 'true' },
      { input: 's = "()[]{}"', output: 'true' },
      { input: 's = "(]"', output: 'false' },
    ],
    constraints: ['1 <= s.length <= 10^4', 's consists of parentheses only ()[]{}.'],
    boilerplate: {
      Python: `class Solution:\n    def isValid(self, s: str) -> bool:\n        # Write your code here\n        pass`,
      'C++': `class Solution {\npublic:\n    bool isValid(string s) {\n        // Write your code here\n        return false;\n    }\n};`,
      Java: `class Solution {\n    public boolean isValid(String s) {\n        return false;\n    }\n}`,
      JavaScript: `var isValid = function(s) {\n    // Write your code here\n};`,
      TypeScript: `function isValid(s: string): boolean {\n    return false;\n}`,
    },
    testCases: [
      { input: 's = "()"', expectedOutput: 'true' },
      { input: 's = "([)]"', expectedOutput: 'false' },
    ],
  },
  {
    number: 3,
    title: 'Reverse Linked List',
    difficulty: 'Easy',
    tags: ['Linked List', 'Recursion'],
    type: 'coding',
    description: `Given the head of a singly linked list, reverse the list, and return the reversed list.`,
    examples: [
      { input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]' },
      { input: 'head = [1,2]', output: '[2,1]' },
    ],
    constraints: ['The number of nodes in the list is the range [0, 5000].', '-5000 <= Node.val <= 5000'],
    boilerplate: {
      Python: `class Solution:\n    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:\n        prev = None\n        curr = head\n        while curr:\n            nxt = curr.next\n            curr.next = prev\n            prev = curr\n            curr = nxt\n        return prev`,
      'C++': `class Solution {\npublic:\n    ListNode* reverseList(ListNode* head) {\n        // Write code here\n        return nullptr;\n    }\n};`,
      Java: `class Solution {\n    public ListNode reverseList(ListNode head) {\n        return null;\n    }\n}`,
      JavaScript: `var reverseList = function(head) {\n    // Write your code here\n};`,
      TypeScript: `function reverseList(head: ListNode | null): ListNode | null {\n    return null;\n}`,
    },
    testCases: [
      { input: 'head = [1,2,3,4,5]', expectedOutput: '[5,4,3,2,1]' },
    ],
  },
  {
    number: 4,
    title: 'Best Time to Buy and Sell Stock',
    difficulty: 'Easy',
    tags: ['Arrays', 'Dynamic Programming'],
    type: 'coding',
    description: `You are given an array prices where prices[i] is the price of a given stock on the ith day.\nYou want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.\nReturn the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.`,
    examples: [
      { input: 'prices = [7,1,5,3,6,4]', output: '5', explanation: 'Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.' },
      { input: 'prices = [7,6,4,3,1]', output: '0', explanation: 'In this case, no transactions are done and max profit = 0.' },
    ],
    constraints: ['1 <= prices.length <= 10^5', '0 <= prices[i] <= 10^4'],
    boilerplate: {
      Python: `class Solution:\n    def maxProfit(self, prices: list[int]) -> int:\n        min_price = float('inf')\n        max_profit = 0\n        for p in prices:\n            min_price = min(min_price, p)\n            max_profit = max(max_profit, p - min_price)\n        return max_profit`,
      'C++': `class Solution {\npublic:\n    int maxProfit(vector<int>& prices) {\n        return 0;\n    }\n};`,
      Java: `class Solution {\n    public int maxProfit(int[] prices) {\n        return 0;\n    }\n}`,
      JavaScript: `var maxProfit = function(prices) {\n    return 0;\n};`,
      TypeScript: `function maxProfit(prices: number[]): number {\n    return 0;\n}`,
    },
    testCases: [
      { input: 'prices = [7,1,5,3,6,4]', expectedOutput: '5' },
    ],
  },
  {
    number: 5,
    title: 'Maximum Subarray (Kadane)',
    difficulty: 'Medium',
    tags: ['Arrays', 'Dynamic Programming'],
    type: 'coding',
    description: `Given an integer array nums, find the subarray with the largest sum, and return its sum.`,
    examples: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'The subarray [4,-1,2,1] has the largest sum 6.' },
      { input: 'nums = [1]', output: '1' },
      { input: 'nums = [5,4,-1,7,8]', output: '23' },
    ],
    constraints: ['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
    boilerplate: {
      Python: `class Solution:\n    def maxSubArray(self, nums: list[int]) -> int:\n        max_so_far = nums[0]\n        current_max = nums[0]\n        for x in nums[1:]:\n            current_max = max(x, current_max + x)\n            max_so_far = max(max_so_far, current_max)\n        return max_so_far`,
      'C++': `class Solution {\npublic:\n    int maxSubArray(vector<int>& nums) {\n        return 0;\n    }\n};`,
      Java: `class Solution {\n    public int maxSubArray(int[] nums) {\n        return 0;\n    }\n}`,
      JavaScript: `var maxSubArray = function(nums) {\n    return 0;\n};`,
      TypeScript: `function maxSubArray(nums: number[]): number {\n    return 0;\n}`,
    },
    testCases: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', expectedOutput: '6' },
    ],
  },
];

// Helper to fill remaining questions 6 to 50
const TOPIC_NAMES = ['Binary Trees', 'Graphs', 'Dynamic Programming', 'Strings', 'Sliding Window', 'Two Pointers', 'Trie', 'Heap'];
export function generateTestQuestions(): TestQuestion[] {
  const list: TestQuestion[] = [];

  for (let i = 1; i <= 50; i++) {
    const predefined = SAMPLE_QUESTIONS.find((q) => q.number === i);
    if (predefined) {
      list.push({
        id: `q-${i}`,
        number: i,
        title: predefined.title!,
        difficulty: predefined.difficulty!,
        type: predefined.type!,
        tags: predefined.tags!,
        description: predefined.description!,
        examples: predefined.examples!,
        constraints: predefined.constraints!,
        boilerplate: predefined.boilerplate!,
        testCases: predefined.testCases!,
      });
    } else {
      const topic = TOPIC_NAMES[i % TOPIC_NAMES.length] ?? 'Algorithms';
      const diff: 'Easy' | 'Medium' | 'Hard' = i % 7 === 0 ? 'Hard' : i % 3 === 0 ? 'Medium' : 'Easy';
      const isMcq = i % 5 === 0;

      list.push({
        id: `q-${i}`,
        number: i,
        title: `${topic} Challenge #${i}`,
        difficulty: diff,
        type: isMcq ? 'mcq' : 'coding',
        tags: [topic, 'Algorithms'],
        description: isMcq
          ? `What is the worst-case time complexity of an optimal algorithm for ${topic.toLowerCase()} traversal?\n\nSelect the best option from below:`
          : `Given an input representing a ${topic.toLowerCase()} scenario, implement an efficient algorithmic solution to compute the target result.\n\nEnsure optimal time and space complexity.`,
        examples: [
          {
            input: 'nums = [1, 2, 3, 4]',
            output: '10',
            explanation: 'Aggregated result based on problem conditions.',
          },
        ],
        constraints: ['1 <= n <= 10^5', 'Runtime limit: 1.0s'],
        boilerplate: {
          Python: `class Solution:\n    def solve(self, data):\n        # Write your code here\n        pass`,
          'C++': `class Solution {\npublic:\n    int solve(vector<int>& data) {\n        return 0;\n    }\n};`,
          Java: `class Solution {\n    public int solve(int[] data) {\n        return 0;\n    }\n}`,
          JavaScript: `function solve(data) {\n    return 0;\n}`,
          TypeScript: `function solve(data: number[]): number {\n    return 0;\n}`,
        },
        testCases: [
          { input: 'nums = [1, 2, 3, 4]', expectedOutput: '10' },
        ],
        ...(isMcq
          ? {
              mcqOptions: [
                { id: 'opt-A', text: 'O(N log N) time and O(1) auxiliary space' },
                { id: 'opt-B', text: 'O(N) time and O(N) auxiliary space' },
                { id: 'opt-C', text: 'O(N^2) time with quadratic worst-case' },
                { id: 'opt-D', text: 'O(1) constant time' },
              ],
            }
          : {}),
      });
    }
  }

  return list;
}

export const DUMMY_TESTS: TestItem[] = [
  {
    id: 'weekly-dsa-12',
    title: 'Weekly DSA Test - 12',
    status: 'ongoing',
    dateBadge: 'SEP 18',
    fullDate: 'September 18, 2026',
    questionsCount: 50,
    durationMinutes: 90,
    typeBadge: 'Mixed',
    passPercentage: 60,
    syllabusTags: ['Arrays', 'Strings', 'Linked Lists', 'Trees', 'Graphs'],
    endsIn: '2h 14m',
    questions: generateTestQuestions(),
  },
  {
    id: 'binary-search-mastery',
    title: 'Binary Search Mastery',
    status: 'upcoming',
    dateBadge: 'SEP 20',
    fullDate: 'September 20, 2026',
    questionsCount: 25,
    durationMinutes: 45,
    typeBadge: 'Medium',
    passPercentage: 60,
    syllabusTags: ['Binary Search', 'Sorting', 'Lower/Upper Bound'],
    startsIn: '1 day',
    questions: [],
  },
  {
    id: 'dynamic-programming-test',
    title: 'Dynamic Programming Test',
    status: 'upcoming',
    dateBadge: 'SEP 22',
    fullDate: 'September 22, 2026',
    questionsCount: 40,
    durationMinutes: 75,
    typeBadge: 'Medium',
    passPercentage: 60,
    syllabusTags: ['DP', 'Recursion', 'Memoization', 'Knapsack'],
    startsIn: '3 days',
    questions: [],
  },
  {
    id: 'graph-algorithms',
    title: 'Graph Algorithms',
    status: 'upcoming',
    dateBadge: 'SEP 25',
    fullDate: 'September 25, 2026',
    questionsCount: 30,
    durationMinutes: 60,
    typeBadge: 'Medium',
    passPercentage: 60,
    syllabusTags: ['Graphs', 'BFS', 'DFS', 'Shortest Path', 'Dijkstra'],
    startsIn: '6 days',
    questions: [],
  },
  {
    id: 'full-length-mock',
    title: 'Full Length Mock Test',
    status: 'upcoming',
    dateBadge: 'SEP 28',
    fullDate: 'September 28, 2026',
    questionsCount: 100,
    durationMinutes: 180,
    typeBadge: 'Mixed',
    passPercentage: 60,
    syllabusTags: ['Complete DSA Syllabus', 'System Design Basics'],
    startsIn: '9 days',
    questions: [],
  },
  {
    id: 'weekly-dsa-11',
    title: 'Weekly DSA Test - 11',
    status: 'past',
    dateBadge: 'SEP 11',
    fullDate: 'September 11, 2026',
    questionsCount: 45,
    durationMinutes: 90,
    typeBadge: 'Mixed',
    passPercentage: 60,
    syllabusTags: ['Trees', 'Binary Search Trees', 'Tries'],
    score: 84,
    userRank: 18,
    questions: [],
  },
  {
    id: 'weekly-dsa-10',
    title: 'Weekly DSA Test - 10',
    status: 'past',
    dateBadge: 'SEP 04',
    fullDate: 'September 04, 2026',
    questionsCount: 40,
    durationMinutes: 80,
    typeBadge: 'Hard',
    passPercentage: 60,
    syllabusTags: ['Graph Theory', 'Topological Sort', 'Disjoint Sets'],
    score: 72,
    userRank: 32,
    questions: [],
  },
];
