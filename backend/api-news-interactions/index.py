import json, os, psycopg2

SCHEMA = "t_p18423906_subbotino_service_ap"
CORS = {"Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS", "Access-Control-Allow-Headers": "Content-Type"}

def db():
    return psycopg2.connect(os.environ["DATABASE_URL"])

def handler(event: dict, context) -> dict:
    """API для комментариев и реакций новостей"""
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}
    action = params.get("action", "")
    news_id = params.get("news_id")

    # GET все комментарии и реакции
    if method == "GET":
        conn = db()
        cur = conn.cursor()
        cur.execute(f"SELECT id, news_id, author, text, time FROM {SCHEMA}.news_comments ORDER BY created_at ASC")
        comments_rows = cur.fetchall()
        cur.execute(f"SELECT news_id, likes, dislikes FROM {SCHEMA}.news_reactions")
        reactions_rows = cur.fetchall()
        conn.close()
        comments: dict = {}
        for r in comments_rows:
            nid = str(r[1])
            if nid not in comments:
                comments[nid] = []
            comments[nid].append({"id": r[0], "author": r[2], "text": r[3], "time": r[4]})
        reactions = {str(r[0]): {"likes": r[1], "dislikes": r[2]} for r in reactions_rows}
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"comments": comments, "reactions": reactions}, ensure_ascii=False)}

    # POST добавить комментарий
    if method == "POST" and action == "comment":
        body = json.loads(event.get("body") or "{}")
        n_id = body.get("news_id")
        text = body.get("text", "").strip()
        author = body.get("author", "Аноним")
        time_str = body.get("time", "")
        if not n_id or not text:
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "news_id and text required"})}
        conn = db()
        cur = conn.cursor()
        cur.execute(f"INSERT INTO {SCHEMA}.news_comments (news_id, author, text, time) VALUES (%s,%s,%s,%s) RETURNING id", (n_id, author, text, time_str))
        new_id = cur.fetchone()[0]
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"id": new_id})}

    # PUT обновить реакцию
    if method == "PUT" and action == "reaction":
        body = json.loads(event.get("body") or "{}")
        n_id = body.get("news_id")
        likes = body.get("likes", 0)
        dislikes = body.get("dislikes", 0)
        if not n_id:
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "news_id required"})}
        conn = db()
        cur = conn.cursor()
        cur.execute(f"""
            INSERT INTO {SCHEMA}.news_reactions (news_id, likes, dislikes) VALUES (%s, %s, %s)
            ON CONFLICT (news_id) DO UPDATE SET likes=%s, dislikes=%s
        """, (n_id, likes, dislikes, likes, dislikes))
        conn.commit()
        conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

    return {"statusCode": 405, "headers": CORS, "body": json.dumps({"error": "method not allowed"})}
