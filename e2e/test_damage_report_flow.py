from datetime import date
import re
import pytest

playwright = pytest.importorskip("playwright.sync_api")


@pytest.mark.e2e
def test_damage_report_flow(base_url):
    with playwright.sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context()
        page = context.new_page()

        page.goto(f"{base_url}/schaden/melden/", wait_until="domcontentloaded")

        page.get_by_label("Kontrollschild *").fill("ZH 123456")
        page.get_by_label("Fahrzeugmarke *").fill("VW")
        page.get_by_label("Fahrzeugmodell *").fill("Golf")

        page.get_by_role("button", name=re.compile("Weiter", re.I)).click()

        page.get_by_label("Vorname *").fill("Max")
        page.get_by_label("Nachname *").fill("Muster")
        page.get_by_label("Strasse & Nr. *").fill("Bahnhofstrasse 1")
        page.get_by_label("PLZ *").fill("8000")
        page.get_by_label("Ort *").fill("Zürich")
        page.get_by_label("Telefon *").fill("+41 44 123 45 67")
        page.get_by_label("E-Mail *").fill("max@example.com")

        page.get_by_role("button", name=re.compile("Weiter", re.I)).click()

        page.get_by_label("Versicherung *").select_option("AXA")
        page.get_by_label("Policennummer").fill("POL-12345")

        page.get_by_role("button", name=re.compile("Weiter", re.I)).click()

        page.get_by_label("Unfalldatum *").fill(date.today().isoformat())
        page.get_by_label("Unfallort *").fill("Zürich")
        page.get_by_label("Schadensart *").select_option("Unfallschaden")
        page.get_by_label("Schadenbeschreibung *").fill("Frontschaden an der Stossstange.")

        page.get_by_role("button", name=re.compile("Weiter", re.I)).click()

        page.get_by_role("button", name=re.compile("Schadenmeldung absenden", re.I)).click()
        page.wait_for_url(re.compile(r".*/schaden/erfolg/\\d+/"))
        page.get_by_text("Vielen Dank für Ihre Schadenmeldung").is_visible()

        context.close()
        browser.close()
