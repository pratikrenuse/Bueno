#!/usr/bin/env node
// Who receives what, in the LinkedIn program.
//
// Two audiences that used to be one list:
//   APPROVERS  John and Pratik, who see a post BEFORE the team does. The approval preview
//              and the review reminder go here.
//   TEAM_CC    Pratik alone, copied on what the team actually receives. John is a team
//              member himself and does not want a copy of the five posts that go to Amina,
//              Izahbel, Monique, Petter and Yenna.
//
// Getting this wrong is not a crash, it is thirty unwanted emails a month landing on the
// founder, so it is pinned down here rather than left to a comment.

import { APPROVAL_TO, REVIEW_TO, REVIEW_CC, TEAM_CC, COPY } from './api/_email.js';

// The same expression api/_dispatch.js uses.
const ccFor = (memberEmail) =>
  TEAM_CC.filter(a => a.toLowerCase() !== String(memberEmail).toLowerCase());

let pass = 0, fail = 0;
const bad_reply = [];
const eq = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : (fail++, console.log(`FAIL ${name}\n  got  ${JSON.stringify(got)}\n  want ${JSON.stringify(want)}`));
};

eq('the approval preview goes to John and Pratik', APPROVAL_TO, ['john@getbueno.com', 'pratik.y.renuse@gmail.com']);
eq('the review reminder is addressed to John alone', REVIEW_TO, ['john@getbueno.com']);
eq('and Pratik is copied on it', REVIEW_CC, ['pratik.y.renuse@gmail.com']);
eq('John is the one asked to act, not one of two', REVIEW_TO.length, 1);
eq('the reminder never lands on the team', REVIEW_TO.concat(REVIEW_CC).some(a => /amina|izahbel|monique|petter|yenna/i.test(a)), false);
eq('the team copy line is Pratik alone', TEAM_CC, ['pratik.y.renuse@gmail.com']);
eq('John is NOT copied on what the team receives', TEAM_CC.some(a => /john/i.test(a)), false);

// The live roster, as it stands after John replaced Felix on English.
const ROSTER = [
  { name: 'Amina',   email: 'amina@getbueno.com',    lang: 'fr' },
  { name: 'Izahbel', email: 'izahbelle@getbueno.com', lang: 'sv' },
  { name: 'John',    email: 'john@getbueno.com',      lang: 'en' },
  { name: 'Monique', email: 'monique@getbueno.com',   lang: 'nl' },
  { name: 'Petter',  email: 'petter@getbueno.com',    lang: 'no' },
  { name: 'Yenna',   email: 'yenna@getbueno.com',     lang: 'es' },
];

for (const m of ROSTER) {
  const cc = ccFor(m.email);
  const ok = !cc.some(a => a.toLowerCase() === m.email.toLowerCase());
  ok ? pass++ : (fail++, console.log(`FAIL ${m.name} is on their own cc line`));
}

eq('every team member is copied to Pratik', ccFor('petter@getbueno.com'), ['pratik.y.renuse@gmail.com']);
eq('John gets his own post with nobody but Pratik copied', ccFor('john@getbueno.com'), ['pratik.y.renuse@gmail.com']);
eq('case does not matter', ccFor('PRATIK.Y.RENUSE@gmail.com'), []);
eq('a missing address changes nothing', ccFor(undefined), TEAM_CC);
eq('an empty address changes nothing', ccFor(''), TEAM_CC);

// What each of the six actually receives per send, and what John does NOT.
const johnCopies = ROSTER.filter(m => m.email !== 'john@getbueno.com')
  .filter(m => ccFor(m.email).some(a => a.toLowerCase() === 'john@getbueno.com')).length;
eq('John receives none of the other five members posts', johnCopies, 0);

const pratikCopies = ROSTER.filter(m => ccFor(m.email).some(a => /pratik/i.test(a))).length;
eq('Pratik is copied on all six', pratikCopies, 6);

// Felix is off the roster. If his address ever reappears in OVERSIGHT or the roster
// without a decision to put it there, this is the line that notices.
eq('felix is on no list at all', APPROVAL_TO.concat(REVIEW_TO, REVIEW_CC, TEAM_CC).some(a => /felix/i.test(a)), false);
eq('felix is not on the roster', ROSTER.some(m => /felix/i.test(m.email)), false);

// One English member, and it is John.
const english = ROSTER.filter(m => m.lang === 'en');
eq('exactly one English member', english.length, 1);
eq('and it is John', english[0].email, 'john@getbueno.com');

// --- the email must not name somebody who is not actually copied --------------------
// Every member email ends with a line telling the reader who is on copy. It said "Pratik
// and John" in all six languages, which stopped being true the moment John came off the
// team copy line. A promise about who can see a message is not a detail to leave stale.
const CC_NAMES = { pratik: /pratik/i, john: /john/i };
for (const [lang, pack] of Object.entries(COPY)) {
  const line = typeof pack.reply === 'string' ? pack.reply : '';
  eq(`${lang}: the reply line exists`, line.length > 0, true);
  for (const [who, re] of Object.entries(CC_NAMES)) {
    const named = re.test(line);
    const actuallyCopied = TEAM_CC.some(a => re.test(a));
    if (named && !actuallyCopied) {
      fail++; bad_reply.push(`${lang}: the email says ${who} is on copy, and ${who} is not`);
    } else pass++;
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
for (const b of bad_reply) console.log('  ' + b);
if (bad_reply.length) process.exitCode = 1;
process.exit(fail ? 1 : 0);
