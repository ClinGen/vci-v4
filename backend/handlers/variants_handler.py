import json
import psycopg2
from psycopg2.extras import RealDictCursor
from shared.db import get_db_conn

def handler(event, context):
    method = event.get("requestContext", {}).get("http", {}).get("method", "GET")
    if method == "GET":
        params = event.get("queryStringParameters") or {}
        clinvar_id = params.get("clinvar_id")
        if not clinvar_id:
            return {"statusCode": 400, "body": json.dumps({"error": "Missing clinvar_id"})}
        with get_db_conn() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("SELECT * FROM variants WHERE clinvar_id = %s;", (clinvar_id,))
                row = cur.fetchone()
                if row:
                    return {"statusCode": 200, "body": json.dumps(row)}
                else:
                    return {"statusCode": 404, "body": json.dumps({"error": "Variant not found"})}
    elif method == "POST":
        body = json.loads(event.get("body", "{}"))
        clinvar_id = body.get("clinvar_id")
        info = body.get("info", {})
        if not clinvar_id:
            return {"statusCode": 400, "body": json.dumps({"error": "Missing clinvar_id"})}
        with get_db_conn() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO variants (clinvar_id, info) VALUES (%s, %s) ON CONFLICT (clinvar_id) DO UPDATE SET info=EXCLUDED.info;",
                    (clinvar_id, json.dumps(info))
                )
                conn.commit()
        return {"statusCode": 201, "body": json.dumps({"message": "Saved"})}
    else:
        return {"statusCode": 405, "body": json.dumps({"error": "Method not allowed"})}
