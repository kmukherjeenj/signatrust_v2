#!/bin/bash
set -e

echo "Current working directory: $(pwd)"
echo "Listing contents of /var/task:"
ls -R /var/task

npm ci
npm run build

echo "Listing contents of circuits directory:"
ls -R circuits

echo "Listing contents of dist directory:"
ls -R dist