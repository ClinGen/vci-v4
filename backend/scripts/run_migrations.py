import os
import psycopg2

DB_HOST = os.environ.get("DB_HOST", "localhost")
DB_PORT = os.environ.get("DB_PORT", 5432)
DB_NAME = os.environ.get("DB_NAME", "variants")
DB_USER = os.environ.get("DB_USER", "vciv4")
DB_PASSWORD = os.environ.get("DB_PASSWORD", "vci4password")

def run_migrations():
    conn = psycopg2.connect(
        host=DB_HOST, port=DB_PORT, dbname=DB_NAME,
        user=DB_USER, password=DB_PASSWORD
    )
    cur = conn.cursor()
    migrations_path = os.path.join(os.path.dirname(__file__), '../migrations')
    for fname in sorted(os.listdir(migrations_path)):
        if fname.endswith('.sql'):
            print(f"Running migration: {fname}")
            with open(os.path.join(migrations_path, fname), 'r') as f:
                cur.execute(f.read())
    conn.commit()
    cur.close()
    conn.close()
    print("All migrations applied.")

if __name__ == "__main__":
    run_migrations()
