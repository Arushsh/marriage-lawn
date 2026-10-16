#!/usr/bin/env bash
# Exit immediately if a command exits with a non-zero status
set -o errexit

if [ -d "backend" ]; then
  cd backend
fi

# Install production dependencies
pip install -r requirements.txt

# Collect static files for WhiteNoise
python manage.py collectstatic --noinput

# Run migrations, seed demo data, and ensure admin superuser exists
python manage.py setup_production
