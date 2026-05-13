export async function postWebhook(url, data) {
  if (!url) throw new Error('Webhook URL není nastavená');
  const res = await fetch(url, {
    method: 'POST',
    mode: 'cors',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(data),
    redirect: 'follow',
  });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const txt = await res.text();
  try {
    const parsed = JSON.parse(txt);
    if (parsed.status && parsed.status !== 'ok') {
      throw new Error(parsed.message || 'Chyba serveru');
    }
  } catch (e) {
    if (e instanceof SyntaxError) {
      // Non-JSON response — treat as error only if it contains error keywords
      if (/error|exception/i.test(txt)) throw new Error(txt.slice(0, 200));
    } else {
      throw e;
    }
  }
  return true;
}
