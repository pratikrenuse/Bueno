#!/usr/bin/env node
// The weekly rhythm, pinned down.
//
// Monday 09:00 Barcelona   John gets the reminder, Pratik copied
// Tuesday 08:00 Barcelona  the team gets a post
// Wednesday 09:00          John gets the reminder again
// Thursday 08:00           the team gets a post
//
// The reminder has to land BEFORE the send it is reminding about, on the right days, with
// enough hours in between for a person to act. Vercel schedules crons in UTC and does not
// shift them for daylight saving, so the Barcelona times move by an hour twice a year and
// that is checked here rather than assumed.

import { readFileSync } from 'node:fs';

const crons = JSON.parse(readFileSync('vercel.json', 'utf8')).crons || [];
let pass = 0, fail = 0;
const eq = (name, got, want) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  ok ? pass++ : (fail++, console.log(`FAIL ${name}\n  got  ${JSON.stringify(got)}\n  want ${JSON.stringify(want)}`));
};
const ok_ = (name, cond, extra = '') => cond ? pass++ : (fail++, console.log(`FAIL ${name} ${extra}`));

const find = (p) => crons.find(c => c.path === p);
const parse = (s) => { const [m, h, , , dow] = s.split(/\s+/); return { minute: +m, hour: +h, days: dow.split(',').map(Number) }; };

const remind = find('/api/linkedin-remind');
const dispatch = find('/api/linkedin-dispatch');
ok_('the reminder cron exists', !!remind);
ok_('the dispatch cron exists', !!dispatch);
eq('exactly two crons, which is what the plan allows', crons.length, 2);

const R = parse(remind.schedule);
const D = parse(dispatch.schedule);

// Cron day numbers: 0 Sunday, 1 Monday ... 6 Saturday.
eq('the reminder runs Monday and Wednesday', R.days, [1, 3]);
eq('the team send runs Tuesday and Thursday', D.days, [2, 4]);
eq('the reminder fires on the hour', R.minute, 0);
eq('the team send fires on the hour', D.minute, 0);

// Barcelona is UTC+2 in summer (CEST) and UTC+1 in winter (CET).
const local = (utcHour, offset) => (utcHour + offset) % 24;
eq('reminder is 09:00 Barcelona in summer', local(R.hour, 2), 9);
eq('reminder is 08:00 Barcelona in winter', local(R.hour, 1), 8);
eq('team send is 08:00 Barcelona in summer', local(D.hour, 2), 8);
eq('team send is 07:00 Barcelona in winter', local(D.hour, 1), 7);

// An hour early in winter is acceptable for a reminder. An hour LATE would not be, because
// it would start crowding the send that follows it.
ok_('the reminder never drifts later than the hour asked for', local(R.hour, 2) <= 9 && local(R.hour, 1) <= 9);

// Each reminder must precede its send, with a working day in between.
for (const [remindDay, sendDay] of [[1, 2], [3, 4]]) {
  ok_(`day ${remindDay} reminder comes before the day ${sendDay} send`, remindDay < sendDay);
  const gapHours = (sendDay - remindDay) * 24 - R.hour + D.hour;
  ok_(`there are ${gapHours} hours to act before the day ${sendDay} send`, gapHours >= 12, `only ${gapHours}`);
}

// The reminder must not land on a posting day: the point is the day before.
ok_('the reminder never runs on a posting day', !R.days.some(d => D.days.includes(d)));

// Confirming the real timezone maths rather than trusting the offsets above.
const hourIn = (iso, tz) => Number(new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', hour12: false }).format(new Date(iso)));
eq('a July reminder really is 09:00 in Barcelona', hourIn(`2026-07-06T0${R.hour}:00:00Z`, 'Europe/Madrid'), 9);
eq('a January reminder really is 08:00 in Barcelona', hourIn(`2026-01-05T0${R.hour}:00:00Z`, 'Europe/Madrid'), 8);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
