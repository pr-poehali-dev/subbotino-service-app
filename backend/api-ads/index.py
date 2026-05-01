import json, os, psycopg2

SCHEMA = "t_p18423906_subbotino_service_ap"
CORS = {"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS", "Access-Control-Allow-Headers": "Content-Type"}

def db():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def handler(event: dict, context) -> dict:
    """API для объявлений: GET список, POST добавить, PUT изменить статус, DELETE удалить"""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")

    if method == "GET":
        conn = db()
        cur = conn.cursor()
        cur.execute(f"SELECT id, title, text, author, phone, photo, category, status, date FROM {SCHEMA}.ads ORDER BY created_at DESC")
        rows = cur.fetchall()
        conn.close()
        result = [{"id": r[0], "title": r[1], "text": r[2], "author": r[3], "phone": r[4], "photo": r[5], "category": r[6], "status": r[7], "date": r[8]} for r in rows]
        return {"statusCode": 200, "headers": CORS, "body": json.dumps(result, ensure_ascii=False)}

    if method == "POST":
        body = json.loads(event.get("body") or "{}")
        title = body.get("title", "").strip()
        text = body.get("text", "").strip()
        if not title or not text:
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "title and text required"})}
        conn = db()
        cur = conn.cursor()
        cur.execute(
            f"INSERT INTO {SCHEMA}.ads (title, text, author, phone, photo, category, status, date) VALUES (%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id",
            (title, text, body.get("author","Аноним"), body.get("phone") or None, body.get("photo") or None, body.get("category","Продам"), "pending", body.get("date","Сегодня"))
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"id": new_id})}

    if method == "PUT":
        body = json.loads(event.get("body") or "{}")
        ad_id = body.get("id")
        status = body.get("status")
        if not ad_id or not status:
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "id and status required"})}
        conn = db()
        cur = conn.cursor()
        cur.execute(f"UPDATE {SCHEMA}.ads SET status=%s WHERE id=%s", (status, ad_id))
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

    if method == "DELETE":
        params = event.get("queryStringParameters") or {}
        ad_id = params.get("id")
        if not ad_id:
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "id required"})}
        conn = db()
        cur = conn.cursor()
        cur.execute(f"DELETE FROM {SCHEMA}.ads WHERE id=%s", (ad_id,))
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

    return {"statusCode": 405, "headers": CORS, "body": json.dumps({"error": "method not allowed"})}
