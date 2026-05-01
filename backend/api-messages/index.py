import json, os, psycopg2

SCHEMA = "t_p18423906_subbotino_service_ap"
CORS = {"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS", "Access-Control-Allow-Headers": "Content-Type"}

def db():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def handler(event: dict, context) -> dict:
    """API для чата: GET список, POST отправить, DELETE удалить"""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")

    if method == "GET":
        conn = db()
        cur = conn.cursor()
        cur.execute(f"SELECT id, author, text, time, mine, status FROM {SCHEMA}.messages ORDER BY created_at ASC")
        rows = cur.fetchall()
        conn.close()
        result = [{"id": r[0], "author": r[1], "text": r[2], "time": r[3], "mine": r[4], "status": r[5]} for r in rows]
        return {"statusCode": 200, "headers": CORS, "body": json.dumps(result, ensure_ascii=False)}

    if method == "POST":
        body = json.loads(event.get("body") or "{}")
        text = body.get("text", "").strip()
        if not text:
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "text required"})}
        conn = db()
        cur = conn.cursor()
        cur.execute(
            f"INSERT INTO {SCHEMA}.messages (author, text, time, mine) VALUES (%s,%s,%s,%s) RETURNING id",
            (body.get("author","Вы"), text, body.get("time",""), body.get("mine", True))
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"id": new_id})}

    if method == "DELETE":
        params = event.get("queryStringParameters") or {}
        msg_id = params.get("id")
        if not msg_id:
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "id required"})}
        conn = db()
        cur = conn.cursor()
        cur.execute(f"DELETE FROM {SCHEMA}.messages WHERE id=%s", (msg_id,))
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

    return {"statusCode": 405, "headers": CORS, "body": json.dumps({"error": "method not allowed"})}
