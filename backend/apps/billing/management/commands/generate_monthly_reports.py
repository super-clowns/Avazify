from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.billing.services import generate_artist_reports


class Command(BaseCommand):
    help = "Generate or update monthly artist reports."

    def add_arguments(self, parser):
        now = timezone.localdate()
        parser.add_argument("--year", type=int, default=now.year)
        parser.add_argument("--month", type=int, default=now.month)

    def handle(self, *args, **options):
        reports = generate_artist_reports(options["year"], options["month"])
        self.stdout.write(self.style.SUCCESS(f"Generated {len(reports)} reports."))
