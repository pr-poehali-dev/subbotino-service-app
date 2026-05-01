import json, os, psycopg2

SCHEMA = "t_p18423906_subbotino_service_ap"
CORS = {"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS", "Access-Control-Allow-Headers": "Content-Type"}

def db():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def handler(event: dict, context) -> dict:
    """API для новостей: GET список, POST добавить, DELETE удалить"""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")

    if method == "GET":
        conn = db()
        cur = conn.cursor()
        cur.execute(f"SELECT id, title, text, category, date, pinned FROM {SCHEMA}.news ORDER BY pinned DESC, created_at DESC")
        rows = cur.fetchall()
        conn.close()
        result = [{"id": r[0], "title": r[1], "text": r[2], "category": r[3], "date": r[4], "pinned": r[5]} for r in rows]
        return {"statusCode": 200, "headers": CORS, "body": json.dumps(result, ensure_ascii=False)}

    if method == "POST":
        body = json.loads(event.get("body") or "{}")
        title = body.get("title", "").strip()
        text = body.get("text", "").strip()
        category = body.get("category", "ЖКХ")
        date = body.get("date", "")
        pinned = body.get("pinned", False)
        if not title or not text:
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "title and text required"})}
        conn = db()
        cur = conn.cursor()
        cur.execute(f"INSERT INTO {SCHEMA}.news (title, text, category, date, pinned) VALUES (%s, %s, %s, %s, %s) RETURNING id", (title, text, category, date, pinned))
        new_id = cur.fetchone()[0]
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"id": new_id})}

    if method == "DELETE":
        params = event.get("queryStringParameters") or {}
        news_id = params.get("id")
        if not news_id:
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "id required"})}
        conn = db()
        cur = conn.cursor()
        cur.execute(f"UPDATE {SCHEMA}.news SET title=title WHERE id=%s", (news_id,))
        cur.execute(f"DELETE FROM {SCHEMA}.news_comments WHERE news_id=%s", (news_id,))
        cur.execute(f"DELETE FROM {SCHEMA}.news_reactions WHERE news_id=%s", (news_id,))
        cur.execute(f"DELETE FROM {SCHEMA}.news WHERE id=%s", (news_id,))
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

    return {"statusCode": 405, "headers": CORS, "body": json.dumps({"error": "method not allowed"})}
