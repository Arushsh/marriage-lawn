import os
from django.core.management import call_command
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model


class Command(BaseCommand):
    help = "Run migrations, seed demo data, and ensure admin superuser exists non-interactively."

    def handle(self, *args, **options):
        self.stdout.write("1. Running database migrations...")
        call_command("migrate", interactive=False)

        self.stdout.write("2. Seeding venue demo data...")
        try:
            call_command("seed_demo")
        except Exception as e:
            self.stderr.write(f"Warning running seed_demo: {e}")

        self.stdout.write("3. Checking superuser...")
        User = get_user_model()
        username = os.environ.get("DJANGO_SUPERUSER_USERNAME", "admin")
        email = os.environ.get("DJANGO_SUPERUSER_EMAIL", "admin@marriagelawn.com")
        password = os.environ.get("DJANGO_SUPERUSER_PASSWORD", "Admin@123456")

        if not User.objects.filter(username=username).exists():
            User.objects.create_superuser(username=username, email=email, password=password)
            self.stdout.write(self.style.SUCCESS(f"Created superuser '{username}'."))
        else:
            self.stdout.write(f"Superuser '{username}' already exists.")

        self.stdout.write(self.style.SUCCESS("✓ Production setup complete."))
