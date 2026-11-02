async function testCppBatch() {
  const code = `
#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <unordered_map>
#include <algorithm>
using namespace std;

int main() {
    cout << "[0,1]" << endl;
    return 0;
}
`;

  console.log('Sending 10 submissions in batches of 2...');
  const t0 = Date.now();
  const allResults = [];

  for (let i = 0; i < 10; i += 2) {
    const batch = [i, i + 1].map(() =>
      fetch('http://127.0.0.1:2358/submissions?base64_encoded=true&wait=true', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language_id: 54,
          source_code: Buffer.from(code).toString('base64'),
          stdin: '',
          compiler_options: '-O0 -std=c++17',
        }),
      }).then((r) => r.json()),
    );
    const res = await Promise.all(batch);
    allResults.push(...res);
  }

  console.log('Finished 10 submissions in ' + (Date.now() - t0) + 'ms');
  console.log('Statuses:', allResults.map((r) => r.status?.description));
}

testCppBatch();
