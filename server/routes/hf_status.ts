import { RequestHandler } from 'express';

export const handleHFStatus: RequestHandler = async (req, res) => {
  try {
    const hfKey = process.env.HF_API_KEY;
    const masked = hfKey ? `${String(hfKey).slice(0, 4)}...${String(hfKey).slice(-4)}` : null;

    // If query param probe=true, make a lightweight call to HF to check access
    const probe = req.query.probe === 'true';
    if (!probe) {
      return res.json({ ok: true, hfKeyPresent: Boolean(hfKey), masked });
    }

    if (!hfKey) {
      return res.status(500).json({ ok: false, hfKeyPresent: false, masked });
    }

    // Make a lightweight probe call
    try {
      const resp = await fetch('https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${hfKey}` },
        body: JSON.stringify({ inputs: 'Hello', options: { wait_for_model: false } })
      });

      const text = await resp.text();
      return res.status(resp.ok ? 200 : 502).json({ ok: resp.ok, status: resp.status, body: text, masked });
    } catch (err: any) {
      console.error('[HF Status] probe error', err);
      return res.status(500).json({ ok: false, error: err?.message || String(err), masked });
    }
  } catch (err: any) {
    console.error('[HF Status] unexpected', err);
    return res.status(500).json({ ok: false, error: err?.message || String(err) });
  }
};

export default handleHFStatus;
