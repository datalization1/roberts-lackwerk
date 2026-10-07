from django.contrib.sitemaps import Sitemap
from django.urls import reverse


class StaticViewSitemap(Sitemap):
    """Sitemap für die öffentlichen Seiten (statische Views)."""
    protocol = "https"

    # (url_name, priority, changefreq)
    PAGES = [
        ("home", 1.0, "weekly"),
        ("lp_carrosserie", 0.9, "monthly"),
        ("lp_transporter", 0.9, "monthly"),
        ("mietfahrzeuge", 0.8, "weekly"),
        ("schaden_melden", 0.8, "monthly"),
        ("dienstleistungen", 0.8, "monthly"),
        ("ueber_uns", 0.6, "monthly"),
        ("impressum", 0.3, "yearly"),
        ("datenschutz", 0.3, "yearly"),
    ]

    def items(self):
        return self.PAGES

    def location(self, item):
        return reverse(item[0])

    def priority(self, item):
        return item[1]

    def changefreq(self, item):
        return item[2]
