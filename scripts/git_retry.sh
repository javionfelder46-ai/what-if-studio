#!/bin/bash
# Retry git add + commit until the disk fault clears enough to complete it.
# Git objects accumulate across attempts (already-written objects are reused),
# so repeated runs make progress. Exits 0 once the commit lands.
cd ~/workspace/what-if-studio || exit 1
LOG=/tmp/git_retry.log
echo "$(date +%H:%M:%S) git-retry loop started" >> "$LOG"
for i in $(seq 1 240); do
  if git add -A 2>>"$LOG"; then
    echo "$(date +%H:%M:%S) git add succeeded on attempt $i" >> "$LOG"
    if git commit -m "what-if-studio: zenn-006 render via GitHub Actions" 2>>"$LOG"; then
      echo "$(date +%H:%M:%S) COMMIT DONE" >> "$LOG"
      git log --oneline -1 >> "$LOG"
      git status --short | head -5 >> "$LOG"
      exit 0
    else
      echo "$(date +%H:%M:%S) commit failed on attempt $i" >> "$LOG"
    fi
  else
    echo "$(date +%H:%M:%S) git add failed attempt $i" >> "$LOG"
  fi
  sleep 60
done
echo "$(date +%H:%M:%S) git-retry loop gave up after 240 attempts" >> "$LOG"
exit 1
