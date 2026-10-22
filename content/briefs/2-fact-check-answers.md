# Independent fact check of drafted answers (before translation)

Check every answer in <WORK>/answers_*.json (each {new:[{slug,q,a,rules,...}]}). For each answer,
load the cited rules from <REPO>/rules/*.json (any object with an "id" and "status"; use statement,
value and notes) and check every factual claim (numbers, dates, deadlines, percentages,
conditions, offices, legal effect) against those rule texts. Flag claims not supported by any
cited rule, overstatements that drop a condition or caveat, wrong arithmetic, a first sentence
that does not answer the question, and anything that reads as advice or promotion.
Do not edit files. Write <WORK>/factcheck.json: [{ "file", "slug", "severity":
"wrong"|"unsupported"|"overstated"|"minor", "claim", "rule_says", "fix" }] where "fix" is the full
replacement answer (35 to 110 words, no dashes, complete sentences). Then the coordinator applies
the fixes to the English before translation starts.
