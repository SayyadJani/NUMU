import { DriverRegistry } from './driver.registry';

describe('DriverRegistry', () => {
  let registry: DriverRegistry;

  beforeEach(() => {
    registry = new DriverRegistry();
  });

  describe('C++ Driver Preparation', () => {
    it('should inject standard STL headers and namespace into C++ code', () => {
      const userCode = `
class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        return {0, 1};
    }
};`;
      const prepared = registry.prepareCode('cpp', userCode);
      expect(prepared.executionMode).toBe('FUNCTION_HARNESS');
      expect(prepared.sourceCode).toContain('#include <vector>');
      expect(prepared.sourceCode).toContain('#include <iostream>');
      expect(prepared.sourceCode).toContain('using namespace std;');
      expect(prepared.sourceCode).toContain('int main()');
      expect(prepared.sourceFilename).toBe('main.cpp');
      expect(prepared.compilerOptions).toContain('-std=c++17');
    });

    it('should not inject duplicate main() if student provided a standalone program', () => {
      const standaloneCode = `
#include <iostream>
using namespace std;
int main() {
    cout << "hello\\n";
    return 0;
}`;
      const prepared = registry.prepareCode('cpp', standaloneCode);
      expect(prepared.executionMode).toBe('STANDALONE_IO');
      expect(prepared.sourceCode).toBe(standaloneCode);
    });
  });

  describe('JavaScript Driver Preparation', () => {
    it('should wrap JS function with stdin deserializer and JSON output', () => {
      const userCode = `
function twoSum(nums, target) {
    return [0, 1];
}`;
      const prepared = registry.prepareCode('javascript', userCode);
      expect(prepared.executionMode).toBe('FUNCTION_HARNESS');
      expect(prepared.sourceCode).toContain('fs.readFileSync(0, \'utf-8\')');
      expect(prepared.sourceCode).toContain('JSON.stringify(result)');
      expect(prepared.sourceFilename).toBe('solution.js');
    });
  });

  describe('Python Driver Preparation', () => {
    it('should inject annotations import and __main__ runner', () => {
      const userCode = `
class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        return [0, 1]`;
      const prepared = registry.prepareCode('python', userCode);
      expect(prepared.executionMode).toBe('FUNCTION_HARNESS');
      expect(prepared.sourceCode).toContain('from __future__ import annotations');
      expect(prepared.sourceCode).toContain('if __name__ == \'__main__\':');
      expect(prepared.sourceFilename).toBe('solution.py');
    });
  });
});
