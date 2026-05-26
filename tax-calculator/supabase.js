import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Gracefully handle missing env vars in development
const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export const saveLead = async ({ email, formData, results }) => {
  if (!supabase) {
    console.warn('Supabase not configured. Lead not saved.');
    return { error: null };
  }

  const { error } = await supabase.from('tax_calculator_leads').insert([{
    email:              email.trim().toLowerCase(),
    country:            formData.country,
    country_name:       formData.countryName,
    property_use:       formData.propertyUse,
    cadastral_value:    parseFloat(formData.cadastralValue) || null,
    rental_income:      parseFloat(formData.rentalIncome)   || null,
    filing_history:     formData.filingHistory,
    annual_tax:         results.annualTax,
    total_liability:    results.totalLiability,
    years_unfiled:      results.yearsUnfiled,
    is_eu_eea:          results.isEUEEA,
    status:             results.status,
    created_at:         new Date().toISOString()
  }]);

  if (error) {
    console.error('Supabase insert error:', error);
  }

  return { error };
};

// SQL to create the table in Supabase (run once in SQL editor):
/*
CREATE TABLE tax_calculator_leads (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email           TEXT NOT NULL,
  country         TEXT,
  country_name    TEXT,
  property_use    TEXT,
  cadastral_value NUMERIC,
  rental_income   NUMERIC,
  filing_history  TEXT,
  annual_tax      NUMERIC,
  total_liability NUMERIC,
  years_unfiled   INTEGER,
  is_eu_eea       BOOLEAN,
  status          TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE tax_calculator_leads ENABLE ROW LEVEL SECURITY;

-- Allow inserts from anon key (frontend can write, cannot read)
CREATE POLICY "Allow inserts" ON tax_calculator_leads
  FOR INSERT TO anon WITH CHECK (true);
*/
