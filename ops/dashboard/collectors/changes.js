// Every add, edit, delete and move of a site page, from git history.
import { execFileSync } from 'node:child_process';
import { REPO, isTrackedRepoFile, fileToPath } from './lib/site.js';
import { diffKinds } from './lib/parse.js';

function git(args, opts = {}) {
  return execFileSync('git', args, { cwd: REPO, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, ...opts });
}

function show(sha, repoPath) {
  try { return git(['show', `${sha}:${repoPath}`], { stdio: ['ignore', 'pipe', 'ignore'] }); }
  catch { return null; }
}

const SEP = '\x1e'; // record separator between commits

// Returns one entry per (commit, page), oldest first.
export function readChanges() {
  const log = git(['log', '--reverse', '-M', '--name-status',
    `--format=${SEP}%H%x09%aI%x09%an%x09%s`, '--', 'src/public']);

  const out = [];
  for (const block of log.split(SEP).slice(1)) {
    const lines = block.split('\n');
    const [sha, date, author, ...subject] = lines[0].split('\t');
    const entries = [];
    for (const line of lines.slice(1)) {
      if (!line.trim()) continue;
      const cols = line.split('\t');
      const status = cols[0];
      if (status.startsWith('R')) entries.push({ status: 'R', oldFile: cols[1], file: cols[2] });
      else entries.push({ status: status[0], file: cols[1] });
    }

    for (const e of entries) {
      const tracked = isTrackedRepoFile(e.file);
      const oldTracked = e.oldFile && isTrackedRepoFile(e.oldFile);
      if (!tracked && !oldTracked) continue;
      const type = { A: 'added', M: 'modified', D: 'deleted', R: 'renamed' }[e.status] || 'modified';

      if (e.status === 'R' && !tracked) {
        // moved out of the tracked area: treat as a delete of the old page
        out.push({ sha, date, author, subject: subject.join('\t'), file: e.oldFile, path: fileToPath(e.oldFile), change_type: 'deleted' });
        continue;
      }
      out.push({
        sha, date, author, subject: subject.join('\t'),
        file: e.file, path: fileToPath(e.file),
        oldFile: e.status === 'R' ? e.oldFile : null,
        old_path: e.status === 'R' && oldTracked ? fileToPath(e.oldFile) : null,
        change_type: e.status === 'R' && !oldTracked ? 'added' : type
      });
      if (e.status === 'R' && oldTracked) {
        out.push({ sha, date, author, subject: subject.join('\t'), file: e.oldFile, path: fileToPath(e.oldFile), change_type: 'deleted', movedTo: fileToPath(e.file) });
      }
    }
  }
  return out;
}

// What changed in each edit, for commits not yet classified.
export function classify(entry) {
  if (entry.change_type === 'added') return ['new'];
  if (entry.change_type === 'deleted') return entry.movedTo ? ['moved to ' + entry.movedTo] : [];
  const before = show(`${entry.sha}^`, entry.oldFile || entry.file);
  const after = show(entry.sha, entry.file);
  if (before == null || after == null) return [];
  return diffKinds(before, after);
}
