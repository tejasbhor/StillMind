import os
import psycopg2

def reset_db():
    conn = psycopg2.connect("postgresql://app:pass@db:5432/stillmind")
    conn.autocommit = True
    with conn.cursor() as cur:
        cur.execute("DROP SCHEMA public CASCADE; CREATE SCHEMA public;")
        print("Schema reset successful.")
        
if __name__ == "__main__":
    reset_db()
