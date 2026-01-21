from datetime import date
import re
import pytest

playwright = pytest.importorskip("playwright.sync_api")


@pytest.mark.e2e
def test_booking_flow(base_url):
    with playwright.sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context()
        page = context.new_page()

        page.goto(f"{base_url}/mietfahrzeuge/", wait_until="domcontentloaded")

        transporter_inputs = page.locator('input[name="transporter_id"]')
        if transporter_inputs.count() == 0:
            pytest.skip("Keine Transporter vorhanden; E2E Buchung übersprungen.")

        page.fill("#pickup_date", date.today().isoformat())
        page.check('input[name="time_block"][value="morning"]')
        transporter_inputs.first.check()

        page.get_by_role("button", name=re.compile("Weiter", re.I)).click()

        page.get_by_label("Name *").fill("Max Muster")
        page.get_by_label("Adresse *").fill("Bahnhofstrasse 1, 8000 Zürich")
        page.get_by_label("Telefon *").fill("+41 44 123 45 67")
        page.get_by_label("E-Mail *").fill("max@example.com")
        page.get_by_label("Führerscheinnummer *").fill("ABC12345")

        page.get_by_role("button", name=re.compile("Weiter", re.I)).click()

        page.get_by_role("button", name=re.compile("Weiter", re.I)).click()

        page.get_by_role("button", name=re.compile("Weiter zur Zahlung", re.I)).click()

        page.get_by_role("button", name=re.compile("Jetzt bezahlen", re.I)).click()
        page.wait_for_url(re.compile(r".*/mietfahrzeuge/buchung/erfolg/\\d+/"))

        context.close()
        browser.close()
