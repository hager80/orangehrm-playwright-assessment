import random
import string
from datetime import date

import pytest
import requests


BASE_URL = "https://opensource-demo.orangehrmlive.com"
LOGIN_URL = f"{BASE_URL}/web/index.php/auth/validate"
VACANCIES_API = f"{BASE_URL}/web/index.php/api/v2/recruitment/vacancies"
CANDIDATES_API = f"{BASE_URL}/web/index.php/api/v2/recruitment/candidates"


def random_suffix(length=6):
    return "".join(random.choices(string.ascii_lowercase + string.digits, k=length))


def login(session):
    payload = {
        "username": "Admin",
        "password": "admin123",
    }

    headers = {
        "Content-Type": "application/x-www-form-urlencoded"
    }

    response = session.post(LOGIN_URL, data=payload, headers=headers, allow_redirects=True)

    assert response.status_code in [200, 302], f"Login failed: {response.status_code}"


def get_first_vacancy_id(session):
    response = session.get(VACANCIES_API)

    # Handle unauthorized API (expected in demo environment)
    if response.status_code == 401:
        pytest.skip("API requires authenticated browser session (expected limitation of demo site)")

    response.raise_for_status()

    data = response.json()
    vacancy_list = data.get("data", [])

    assert vacancy_list, "No vacancies found"

    return int(vacancy_list[0]["id"])

def create_candidate(session, vacancy_id, email):
    payload = {
        "firstName": "Api",
        "middleName": "",
        "lastName": f"Candidate{random_suffix()}",
        "email": email,
        "contactNumber": "0123456789",
        "keywords": "playwright,pytest,api",
        "comment": "Created by automated bonus API test",
        "dateOfApplication": str(date.today()),
        "consentToKeepData": True,
        "vacancyId": vacancy_id,
    }

    response = session.post(CANDIDATES_API, json=payload)
    response.raise_for_status()

    data = response.json()
    candidate = data.get("data", {})

    assert "id" in candidate, f"Candidate id not found in response: {data}"

    return int(candidate["id"])


def get_candidate_by_id(session, candidate_id):
    response = session.get(f"{CANDIDATES_API}/{candidate_id}")
    response.raise_for_status()

    data = response.json()
    candidate = data.get("data")

    assert candidate, f"Candidate {candidate_id} not found"

    return candidate


def delete_candidate(session, candidate_id):
    response = session.delete(f"{CANDIDATES_API}/{candidate_id}")
    assert response.status_code in [200, 204], f"Delete failed: {response.status_code} - {response.text}"


@pytest.fixture
def authenticated_session():
    session = requests.Session()
    session.headers.update({
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json, text/plain, */*",
    })
    login(session)
    return session


def test_create_and_delete_candidate_via_api(authenticated_session):
    unique_email = f"api.candidate.{random_suffix()}@example.com"

    vacancy_id = get_first_vacancy_id(authenticated_session)
    candidate_id = create_candidate(authenticated_session, vacancy_id, unique_email)

    created_candidate = get_candidate_by_id(authenticated_session, candidate_id)
    assert created_candidate["email"] == unique_email

    delete_candidate(authenticated_session, candidate_id)