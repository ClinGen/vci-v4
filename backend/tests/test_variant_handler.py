import pytest
from dotenv import load_dotenv
load_dotenv()

from handlers.variants_handler import handler

def test_post_and_get():
    # POST new variant
    post_event = {
        "requestContext": {"http": {"method": "POST"}},
        "body": '{"clinvar_id": "test123", "info": {"gene": "BRCA1"}}'
    }
    post_resp = handler(post_event, None)
    assert post_resp["statusCode"] == 201

    # GET the variant
    get_event = {
        "requestContext": {"http": {"method": "GET"}},
        "queryStringParameters": {"clinvar_id": "test123"}
    }
    get_resp = handler(get_event, None)
    assert get_resp["statusCode"] == 200
    assert "BRCA1" in get_resp["body"]

def test_get_not_found():
    # Variant that does not exist
    get_event = {
        "requestContext": {"http": {"method": "GET"}},
        "queryStringParameters": {"clinvar_id": "doesnotexist"}
    }
    get_resp = handler(get_event, None)
    assert get_resp["statusCode"] == 404

def test_get_missing_param():
    # Missing clinvar_id param
    get_event = {
        "requestContext": {"http": {"method": "GET"}},
        "queryStringParameters": {}
    }
    get_resp = handler(get_event, None)
    assert get_resp["statusCode"] == 400

def test_post_missing_clinvar_id():
    post_event = {
        "requestContext": {"http": {"method": "POST"}},
        "body": '{"info": {"gene": "BRCA1"}}'
    }
    post_resp = handler(post_event, None)
    assert post_resp["statusCode"] == 400
