import os
import pytest


@pytest.fixture(scope="session")
def base_url():
    url = os.getenv("E2E_BASE_URL")
    if not url:
        pytest.skip("E2E_BASE_URL not set; skipping E2E tests.")
    return url.rstrip("/")
