async function test() {
  const code = `print("Python OK")`;
  const payload = {
    language_id: 71,
    source_code: Buffer.from(code).toString('base64'),
  };

  const r = await fetch('http://127.0.0.1:2358/submissions?base64_encoded=true&wait=true', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const d = await r.json();
  console.log('RESPONSE:', d);
}

test();
