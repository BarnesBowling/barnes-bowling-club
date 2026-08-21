import fs from 'node:fs';

const file = 'app/admin/AdminLinkCard.tsx';
const source = fs.readFileSync(file, 'utf8');

const required = [
  "'Club Roster': 11",
  "'Member Management': 12",
  "'Member Accounts': 13",
  "'Committee Photos': 14",
  "'Home Page Images': 21",
  "'Newsletters': 22",
  "'Book a Match': 31",
  "'Results & Leaderboard': 32",
  "'Archive Season': 33",
  "'Gallery': 41",
  "'Photo Books': 42",
  "'Club Roster': { label: 'Members', order: 10 }",
  "'Home Page Images': { label: 'Homepage & Communications', order: 20 }",
  "'Book a Match': { label: 'Matches & Results', order: 30 }",
  "'Gallery': { label: 'Gallery & Photo Books', order: 40 }",
];

const missing = required.filter(item => !source.includes(item));

if (missing.length) {
  console.error('Admin navigation grouping protection failed. Missing expected grouped navigation entries:');
  for (const item of missing) console.error(`- ${item}`);
  process.exit(1);
}

console.log('Admin navigation grouping verified.');
