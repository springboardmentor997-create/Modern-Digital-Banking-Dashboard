from app.database import engine
from sqlalchemy import text

def migrate_rewards_table():
    with engine.connect() as conn:
        print("Migrating rewards table...")
        try:
            # Check if columns exist (simple approach: try to add them, ignore error if exists)
            # SQLite syntax
            if 'sqlite' in str(engine.url):
                try:
                    conn.execute(text("ALTER TABLE rewards ADD COLUMN reward_type VARCHAR DEFAULT 'points'"))
                    print("Added reward_type column")
                except Exception as e:
                    print(f"reward_type might already exist: {e}")
                    
                try:
                    conn.execute(text("ALTER TABLE rewards ADD COLUMN reward_value VARCHAR"))
                    print("Added reward_value column")
                except Exception as e:
                    print(f"reward_value might already exist: {e}")
                
                conn.commit()
            else:
                # PostgreSQL syntax
                conn.commit() # Ensure we are not in a transaction
                try:
                    conn.execute(text("ALTER TABLE rewards ADD COLUMN IF NOT EXISTS reward_type VARCHAR DEFAULT 'points'"))
                    print("Added reward_type column")
                except Exception as e:
                    print(f"Error adding reward_type: {e}")
                
                try:
                    conn.execute(text("ALTER TABLE rewards ADD COLUMN IF NOT EXISTS reward_value VARCHAR"))
                    print("Added reward_value column")
                except Exception as e:
                    print(f"Error adding reward_value: {e}")
                    
                conn.commit()
                
        except Exception as e:
            print(f"Migration error: {e}")

if __name__ == "__main__":
    migrate_rewards_table()
