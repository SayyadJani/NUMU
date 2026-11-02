import { Injectable, Logger } from '@nestjs/common';
import { ExecutionMode } from '@numu/types';

export interface PreparedCode {
  sourceCode: string;
  sourceFilename: string;
  compilerOptions?: string;
  executionMode: ExecutionMode;
}

@Injectable()
export class DriverRegistry {
  private readonly logger = new Logger(DriverRegistry.name);

  /**
   * Prepares and adapts the student source code based on language and execution mode.
   */
  prepareCode(
    language: string,
    rawCode: string,
    forcedMode?: ExecutionMode,
  ): PreparedCode {
    const lang = language.toLowerCase().trim();
    const mode = forcedMode ?? this.detectExecutionMode(lang, rawCode);

    if (mode === 'STANDALONE_IO') {
      return {
        sourceCode: rawCode,
        sourceFilename: this.getDefaultFilename(lang),
        executionMode: 'STANDALONE_IO',
      };
    }

    // Function harness mode
    switch (lang) {
      case 'python':
      case 'py':
      case 'python3':
        return {
          sourceCode: this.preparePythonHarness(rawCode),
          sourceFilename: 'solution.py',
          executionMode: 'FUNCTION_HARNESS',
        };

      case 'cpp':
      case 'c++':
      case 'cpp-gcc9':
      case 'cpp-gcc7':
        return {
          sourceCode: this.prepareCppHarness(rawCode),
          sourceFilename: 'main.cpp',
          compilerOptions: '-O0 -std=c++17',
          executionMode: 'FUNCTION_HARNESS',
        };

      case 'javascript':
      case 'js':
      case 'node':
        return {
          sourceCode: this.prepareJavaScriptHarness(rawCode),
          sourceFilename: 'solution.js',
          executionMode: 'FUNCTION_HARNESS',
        };

      case 'typescript':
      case 'ts':
        return {
          sourceCode: this.prepareJavaScriptHarness(rawCode),
          sourceFilename: 'solution.ts',
          executionMode: 'FUNCTION_HARNESS',
        };

      default:
        return {
          sourceCode: rawCode,
          sourceFilename: this.getDefaultFilename(lang),
          executionMode: 'STANDALONE_IO',
        };
    }
  }

  private detectExecutionMode(lang: string, code: string): ExecutionMode {
    if (
      code.includes('int main(') ||
      code.includes('int main (') ||
      code.includes('void main(') ||
      code.includes('public static void main') ||
      code.includes("if __name__ == '__main__':") ||
      code.includes('if __name__ == "__main__":') ||
      code.includes('package main')
    ) {
      return 'STANDALONE_IO';
    }

    return 'FUNCTION_HARNESS';
  }

  private getDefaultFilename(lang: string): string {
    switch (lang) {
      case 'python':
      case 'py':
        return 'solution.py';
      case 'cpp':
      case 'c++':
        return 'main.cpp';
      case 'javascript':
      case 'js':
        return 'solution.js';
      case 'typescript':
      case 'ts':
        return 'solution.ts';
      default:
        return 'source.txt';
    }
  }

  /**
   * Python Harness:
   * Handles type annotations, unpacks arguments, invokes Solution, prints JSON output.
   */
  private preparePythonHarness(code: string): string {
    let prepared = code;
    if (!prepared.includes('__future__')) {
      prepared = 'from __future__ import annotations\n' + prepared;
    }

    if (
      prepared.includes('class Solution') &&
      !prepared.includes('__main__') &&
      !prepared.includes('Solution().')
    ) {
      prepared += `\n
if __name__ == '__main__':
    import sys, json, inspect
    try:
        raw_in = sys.stdin.read().strip()
        if 'Solution' in globals():
            sol = Solution()
            methods = [m for m in dir(sol) if not m.startswith('_') and callable(getattr(sol, m))]
            if methods:
                method = getattr(sol, methods[0])
                scope = {}
                assignments = []
                current = ""
                depth = 0
                for ch in raw_in:
                    if ch in '([{': depth += 1
                    elif ch in ')]}': depth -= 1
                    if ch == ',' and depth == 0:
                        assignments.append(current.strip())
                        current = ""
                    else:
                        current += ch
                if current.strip():
                    assignments.append(current.strip())
                assign_code = "\\n".join(assignments)
                try:
                    exec(assign_code, scope)
                except Exception:
                    pass

                sig = inspect.signature(method)
                args = []
                for param_name in sig.parameters.keys():
                    if param_name in scope:
                        args.append(scope[param_name])

                if args:
                    res = method(*args)
                elif scope:
                    res = method(*scope.values())
                else:
                    res = method()

                if isinstance(res, (list, dict, int, float, str, bool)) or res is None:
                    print(json.dumps(res, separators=(',', ':')))
                else:
                    print(res)
    except Exception:
        import traceback
        traceback.print_exc()
`;
    }

    return prepared;
  }

  /**
   * C++ Universal Harness:
   * Provides STL headers, namespace, input deserialization, SFINAE method resolution, and JSON serialization.
   */
  private prepareCppHarness(code: string): string {
    const headers = `
#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <algorithm>
#include <unordered_map>
#include <map>
#include <unordered_set>
#include <set>
#include <queue>
#include <stack>
#include <deque>
#include <cctype>
#include <cmath>
#include <numeric>
#include <type_traits>
using namespace std;
`;
    let prepared = headers + '\n' + code;

    if (!code.includes('int main(') && !code.includes('int main (')) {
      prepared += `\n
// === Trusted Universal NUMU C++ Driver ===
template<typename T, typename = void>
struct has_twoSum : false_type {};
template<typename T>
struct has_twoSum<T, void_t<decltype(declval<T>().twoSum(declval<vector<int>&>(), declval<int>()))>> : true_type {};

template<typename T, typename = void>
struct has_isValid : false_type {};
template<typename T>
struct has_isValid<T, void_t<decltype(declval<T>().isValid(declval<string>()))>> : true_type {};

template<typename T, typename = void>
struct has_maxArea : false_type {};
template<typename T>
struct has_maxArea<T, void_t<decltype(declval<T>().maxArea(declval<vector<int>&>()))>> : true_type {};

template<typename T, typename = void>
struct has_climbStairs : false_type {};
template<typename T>
struct has_climbStairs<T, void_t<decltype(declval<T>().climbStairs(declval<int>()))>> : true_type {};

template<typename T, typename = void>
struct has_threeSum : false_type {};
template<typename T>
struct has_threeSum<T, void_t<decltype(declval<T>().threeSum(declval<vector<int>&>()))>> : true_type {};

static vector<string> numu_split_args(const string& raw) {
    vector<string> args;
    string cur;
    int depth = 0;
    for (char c : raw) {
        if (c == '[' || c == '{' || c == '(') depth++;
        else if (c == ']' || c == '}' || c == ')') depth--;
        if (c == ',' && depth == 0) {
            args.push_back(cur);
            cur.clear();
        } else {
            cur += c;
        }
    }
    if (!cur.empty()) args.push_back(cur);
    return args;
}

static string numu_clean_val(string s) {
    auto eq = s.find('=');
    if (eq != string::npos) s = s.substr(eq + 1);
    while (!s.empty() && isspace(s.front())) s.erase(s.begin());
    while (!s.empty() && isspace(s.back())) s.pop_back();
    return s;
}

static vector<int> numu_parse_vec_int(string s) {
    vector<int> res;
    auto l = s.find('[');
    auto r = s.rfind(']');
    if (l != string::npos && r != string::npos && r > l) {
        string inner = s.substr(l + 1, r - l - 1);
        stringstream ss(inner);
        string item;
        while (getline(ss, item, ',')) {
            while (!item.empty() && isspace(item.front())) item.erase(item.begin());
            while (!item.empty() && isspace(item.back())) item.pop_back();
            if (!item.empty()) res.push_back(stoi(item));
        }
    }
    return res;
}

static string numu_parse_str(string s) {
    while (!s.empty() && isspace(s.front())) s.erase(s.begin());
    while (!s.empty() && isspace(s.back())) s.pop_back();
    if (s.size() >= 2 && s.front() == '"' && s.back() == '"') {
        return s.substr(1, s.size() - 2);
    }
    return s;
}

template <typename SolType>
bool numu_execute_solution(SolType& sol, const vector<string>& rawArgs) {
    if constexpr (has_twoSum<SolType>::value) {
        if (rawArgs.size() >= 2) {
            auto nums = numu_parse_vec_int(numu_clean_val(rawArgs[0]));
            int target = stoi(numu_clean_val(rawArgs[1]));
            auto ans = sol.twoSum(nums, target);
            cout << "[";
            for (size_t i = 0; i < ans.size(); i++) {
                cout << ans[i] << (i + 1 < ans.size() ? "," : "");
            }
            cout << "]" << endl;
            return true;
        }
    } else if constexpr (has_isValid<SolType>::value) {
        if (!rawArgs.empty()) {
            string s = numu_parse_str(numu_clean_val(rawArgs[0]));
            bool ans = sol.isValid(s);
            cout << (ans ? "true" : "false") << endl;
            return true;
        }
    } else if constexpr (has_maxArea<SolType>::value) {
        if (!rawArgs.empty()) {
            auto height = numu_parse_vec_int(numu_clean_val(rawArgs[0]));
            int ans = sol.maxArea(height);
            cout << ans << endl;
            return true;
        }
    } else if constexpr (has_climbStairs<SolType>::value) {
        if (!rawArgs.empty()) {
            int n = stoi(numu_clean_val(rawArgs[0]));
            int ans = sol.climbStairs(n);
            cout << ans << endl;
            return true;
        }
    } else if constexpr (has_threeSum<SolType>::value) {
        if (!rawArgs.empty()) {
            auto nums = numu_parse_vec_int(numu_clean_val(rawArgs[0]));
            auto ans = sol.threeSum(nums);
            cout << "[";
            for (size_t i = 0; i < ans.size(); i++) {
                cout << "[";
                for (size_t j = 0; j < ans[i].size(); j++) {
                    cout << ans[i][j] << (j + 1 < ans[i].size() ? "," : "");
                }
                cout << "]" << (i + 1 < ans.size() ? "," : "");
            }
            cout << "]" << endl;
            return true;
        }
    }
    return false;
}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    string rawInput;
    string line;
    while (getline(cin, line)) {
        rawInput += line + " ";
    }

    auto rawArgs = numu_split_args(rawInput);
    Solution sol;
    numu_execute_solution(sol, rawArgs);
    return 0;
}
`;
    }

    return prepared;
  }

  /**
   * JavaScript Universal Harness:
   * Reads stdin, splits arguments, parses JSON or key=val, dynamically invokes target function or Solution, prints JSON.
   */
  private prepareJavaScriptHarness(code: string): string {
    let prepared = code;

    prepared += `\n
// === Trusted Universal JS Driver ===
(function() {
    try {
        const fs = require('fs');
        const rawIn = fs.readFileSync(0, 'utf-8').trim();
        if (!rawIn) return;

        const rawArgs = [];
        let cur = '';
        let depth = 0;
        for (let i = 0; i < rawIn.length; i++) {
            const ch = rawIn[i];
            if (ch === '[' || ch === '{' || ch === '(') depth++;
            else if (ch === ']' || ch === '}' || ch === ')') depth--;
            if (ch === ',' && depth === 0) {
                rawArgs.push(cur.trim());
                cur = '';
            } else {
                cur += ch;
            }
        }
        if (cur.trim()) rawArgs.push(cur.trim());

        const parsedArgs = rawArgs.map(arg => {
            const eqIdx = arg.indexOf('=');
            const valStr = eqIdx !== -1 ? arg.substring(eqIdx + 1).trim() : arg.trim();
            try {
                return JSON.parse(valStr);
            } catch {
                return valStr;
            }
        });

        let targetFn = null;
        if (typeof twoSum === 'function') targetFn = twoSum;
        else if (typeof isValid === 'function') targetFn = isValid;
        else if (typeof maxArea === 'function') targetFn = maxArea;
        else if (typeof climbStairs === 'function') targetFn = climbStairs;
        else if (typeof threeSum === 'function') targetFn = threeSum;
        else if (typeof Solution === 'function') {
            const sol = new Solution();
            const proto = Object.getPrototypeOf(sol);
            const methods = Object.getOwnPropertyNames(proto).filter(m => m !== 'constructor');
            if (methods.length > 0) targetFn = sol[methods[0]].bind(sol);
        }

        if (targetFn) {
            const result = targetFn(...parsedArgs);
            console.log(JSON.stringify(result));
        }
    } catch (err) {
        console.error(err);
    }
})();
`;

    return prepared;
  }
}
