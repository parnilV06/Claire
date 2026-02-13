import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { insertTherapistReferral } from '@/lib/supabaseData';

type Referral = {
  id: string;
  name: string;
  mobile: string;
  age?: string;
  message: string;
  createdAt: string;
};

export function TherapistReferral() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [age, setAge] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  function resetForm() {
    setName('');
    setMobile('');
    setAge('');
    setMessage('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!user?.id) {
      alert('Please log in to submit a referral request.');
      return;
    }

    const payload = {
      name,
      mobile,
      age,
      message,
      createdAt: Date.now()
    };

    try {
      // Save to Supabase
      const { error } = await insertTherapistReferral(user.id, payload);
      
      if (error) {
        console.error('[TherapistReferral] Database error:', error);
        // Fallback to localStorage
        const existing = JSON.parse(localStorage.getItem('therapist_referrals') || '[]');
        existing.push({ id: `ref_${Date.now()}`, ...payload, createdAt: new Date().toISOString() });
        localStorage.setItem('therapist_referrals', JSON.stringify(existing));
      } else {
        console.log('[TherapistReferral] Saved to database successfully');
      }
      
      setSubmitted(true);
      resetForm();
    } catch (err) {
      console.error('[TherapistReferral] Failed to save referral:', err);
      alert('Failed to save referral. Please try again.');
    }
  }

  return (
    <div className="rounded-lg border p-4 shadow-sm">
      <h3 className="text-lg font-semibold">Need a human therapist?</h3>
      <p className="mt-2 text-sm text-foreground/80">If you prefer professional help, we can connect you with a trained therapist or NGO partner.</p>
      <div className="mt-4 flex items-center gap-3">
        <button className="rounded-md bg-primary px-4 py-2 text-sm text-white" onClick={() => setOpen(true)}>
          Request a Referral
        </button>
        <div className="text-sm text-foreground/70">We will contact you to guide next steps.</div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg rounded bg-white p-6">
            <h4 className="mb-2 text-lg font-semibold">Therapist Referral</h4>
            {submitted ? (
              <div>
                <div className="mb-4 text-green-700">Thank you — your request was saved. We will follow up.</div>
                <div className="flex justify-end">
                  <button className="rounded-md border px-4 py-2" onClick={() => { setSubmitted(false); setOpen(false); }}>
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="text-sm">Full name</label>
                  <input className="mt-1 w-full rounded-md border px-3 py-2" value={name} onChange={e => setName(e.target.value)} required />
                </div>
                <div>
                  <label className="text-sm">Mobile number</label>
                  <input className="mt-1 w-full rounded-md border px-3 py-2" value={mobile} onChange={e => setMobile(e.target.value)} required />
                </div>
                <div>
                  <label className="text-sm">Age</label>
                  <input className="mt-1 w-full rounded-md border px-3 py-2" value={age} onChange={e => setAge(e.target.value)} />
                </div>
                <div>
                  <label className="text-sm">Message / brief description</label>
                  <textarea className="mt-1 w-full rounded-md border px-3 py-2" value={message} onChange={e => setMessage(e.target.value)} rows={4} required />
                </div>

                <div className="flex justify-end gap-2">
                  <button type="button" className="rounded-md border px-4 py-2" onClick={() => setOpen(false)}>Cancel</button>
                  <button type="submit" className="rounded-md bg-primary px-4 py-2 text-white">Send request</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default TherapistReferral;
