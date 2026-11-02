const test = async () => {
  const code = `
import java.util.*;

class Solution {
    public boolean isValid(String s) {
        Deque<Character> stack = new ArrayDeque<>();
        for (char c : s.toCharArray()) {
            if (c == '(') stack.push(')');
            else if (c == '{') stack.push('}');
            else if (c == '[') stack.push(']');
            else if (stack.isEmpty() || stack.pop() != c) return false;
        }
        return stack.isEmpty();
    }
}

class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        System.out.println(sol.isValid("()[]{}"));
    }
}
`;

  const payload = {
    language_id: 62,
    source_code: Buffer.from(code).toString('base64'),
    stdin: Buffer.from('').toString('base64'),
    cpu_time_limit: 5.0,
    memory_limit: 1048576,
    enable_per_process_and_thread_time_limit: true,
    enable_per_process_and_thread_memory_limit: true,
  };

  const res = await fetch('http://127.0.0.1:2358/submissions?base64_encoded=true&wait=false', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  console.log('Submitted token:', data.token);

  for (let i = 0; i < 30; i++) {
    await new Promise(r => setTimeout(r, 500));
    const poll = await fetch(`http://127.0.0.1:2358/submissions/${data.token}?base64_encoded=true`);
    const json = await poll.json();
    if (json.status.id >= 3) {
      console.log('Final Status:', json.status);
      if (json.stdout) console.log('Stdout:', Buffer.from(json.stdout, 'base64').toString());
      if (json.stderr) console.log('Stderr:', Buffer.from(json.stderr, 'base64').toString());
      if (json.compile_output) console.log('Compile:', Buffer.from(json.compile_output, 'base64').toString());
      break;
    }
  }
};

test().catch(console.error);
