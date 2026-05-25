module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { taxData } = req.body;
  if (!taxData) return res.status(400).json({ error: 'Tax data required' });

  const propertyUseLabel = {
    personal:     'personal use only (not rented)',
    short_rental: 'short-term / holiday rental',
    long_rental:  'long-term rental',
    mixed:        'mixed personal and rental use'
  }[taxData.propertyUse] || taxData.propertyUse;

  const filingLabel = {
    always:      'has filed every year correctly',
    missed_some: 'has missed some years',
    never:       'has never filed',
    unsure:      'is unsure whether they have filed'
  }[taxData.filingHistory] || taxData.filingHistory;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-20250514',
        max_tokens: 500,
        system: `You are a Spanish property tax expert writing a personalised summary for a foreign property owner in Spain.
Write in a warm, calm, professional tone. Be specific and concrete about their situation.
Use short paragraphs. Each sentence should earn its place.
NEVER use em dashes, emojis, bullet points, or words like "revolutionary" or "crucial".
Write exactly 3 short paragraphs. Do not add headers or labels.
End with one clear, calm sentence about what they should do next.`,
        messages: [{
          role:    'user',
          content: `Write a personalised tax summary for this property owner:
- Country of residence: ${taxData.countryName}
- Tax rate applied: ${taxData.taxRate}% (${taxData.isEUEEA ? 'EU/EEA resident rate' : 'non-EU resident rate'})
- Property use: ${propertyUseLabel}
- Annual tax obligation: EUR ${Number(taxData.annualTax).toFixed(0)}
- Filing history: ${filingLabel}
- Years potentially unfiled: ${taxData.yearsUnfiled}
- Total potential liability including outstanding years: EUR ${Number(taxData.totalLiability).toFixed(0)}

Paragraph 1: Explain their specific tax situation in plain terms.
Paragraph 2: Address their filing status honestly. If they have unfiled years, be direct but calm.
Paragraph 3: One clear recommendation for what they should do next.`
        }]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic error:', err);
      return res.status(500).json({ error: 'Failed to generate report' });
    }

    const data   = await response.json();
    const report = data.content[0].text;
    return res.status(200).json({ report });

  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};
