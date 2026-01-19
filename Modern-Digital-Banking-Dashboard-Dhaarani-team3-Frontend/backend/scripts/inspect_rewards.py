from app.database import SessionLocal
from app.models.reward import Reward

db = SessionLocal()
rows = db.query(Reward).all()
for r in rows:
    print(r.id, type(r.group_id).__name__, repr(r.group_id))
print('total:', len(rows))
