import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Gracefully handle missing env vars in development
const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export const saveLead = async ({ email, formData, results }) => {
  if (!supabase) {
    console.warn('Supabase not configured. Lead not saved.');
    return { error: null };
  }

  const { error } = await supabase.from('mortgage_claim_leads').insert([{
    email:          email.trim().toLowerCase(),
    mortgage_year:  formData.year,
    mortgage_value: parseFloat(formData.mortgage) || null,
    claims:         (formData.unsure ? ['setup'] : (formData.claims || [])).join(','),
    unsure:         !!formData.unsure,
    estimate_total: results.total,
    estimate_low:   results.low,
    estimate_high:  results.high,
    created_at:     new Date().toISOString(),
  }]);

  if (error) {
    console.error('Supabase insert error:', error);
  }

  return { error };
};

// SQL to create the table in Supabase (run once in SQL editor):
/*
CREATE TABLE mortgage_claim_leads (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email           TEXT NOT NULL,
  mortgage_year   TEXT,
  mortgage_value  NUMERIC,
  claims          TEXT,
  unsure          BOOLEAN,
  estimate_total  NUMERIC,
  estimate_low    NUMERIC,
  estimate_high   NUMERIC,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE mortgage_claim_leads ENABLE ROW LEVEL SECURITY;

-- Allow inserts from anon key (frontend can write, cannot read)
CREATE POLICY "Allow inserts" ON mortgage_claim_leads
  FOR INSERT TO anon WITH CHECK (true);
*/
