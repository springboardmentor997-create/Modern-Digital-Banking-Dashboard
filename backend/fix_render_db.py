from sqlalchemy import create_engine, text

engine = create_engine('postgresql://modern_digital_banking_db_user:hJPaohk1qAhOfrWs5iLlT8QGdUN1nW2X@dpg-d507iiruibrs73dt5sb0-a/modern_digital_banking_db')

with engine.connect() as conn:
    try:
        conn.execute(text('ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) NOT NULL DEFAULT \'user\';'))
        conn.commit()
        print('✅ Role column added successfully to Render DB!')
    except Exception as e:
        print(f'Error: {e}')
        conn.rollback()
    finally:
        conn.close()
