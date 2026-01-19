from sqlalchemy.orm import Session
from app.models.reward import Reward
from app.rewards.schemas import RewardCreate, RewardUpdate, RewardBulkAssign
from datetime import datetime


class RewardService:
    @staticmethod
    def create_reward(db: Session, user_id: int, payload: RewardCreate):
        # Create the reward record
        r = Reward(
            user_id=user_id,
            program_name=payload.program_name,
            points_balance=payload.points_balance,
        )
        db.add(r)
        db.commit()
        db.refresh(r)

        # If caller requested to credit a specific account, attempt to do so.
        # Use TransactionService.create_transaction so that account balance
        # and transaction history are updated in a single place.
        acct_id = getattr(payload, "account_id", None)
        if acct_id:
            try:
                from app.models.account import Account
                from app.transactions.schemas import TransactionCreate
                from app.transactions.service import TransactionService

                acct = db.query(Account).filter(Account.id == acct_id).first()
                if acct and acct.user_id == user_id:
                    tx_payload = TransactionCreate(
                        description=f"Reward credit: {r.program_name}",
                        merchant="Reward",
                        amount=r.points_balance,
                        category="Rewards",
                        txn_type="credit",
                        currency=getattr(acct, "currency", "USD"),
                        txn_date=datetime.utcnow()
                    )
                    # This will create a transaction and update the account balance
                    TransactionService.create_transaction(db, acct_id, tx_payload)
            except Exception:
                # Do not fail reward creation if crediting account fails
                pass

        return r

    @staticmethod
    def get_rewards_for_user(db: Session, user_id: int):
        return db.query(Reward).filter(Reward.user_id == user_id).all()

    @staticmethod
    def get_all_rewards(db: Session):
        return db.query(Reward).order_by(Reward.id.desc()).all()

    @staticmethod
    def get_reward(db: Session, reward_id: int, user_id: int):
        return db.query(Reward).filter(Reward.id == reward_id, Reward.user_id == user_id).first()

    @staticmethod
    def get_reward_by_id(db: Session, reward_id: int):
        return db.query(Reward).filter(Reward.id == reward_id).first()

    @staticmethod
    def update_reward(db: Session, reward: Reward, payload: RewardUpdate):
        for k, v in payload.dict(exclude_unset=True).items():
            setattr(reward, k, v)
        db.add(reward)
        db.commit()
        db.refresh(reward)
        return reward

    @staticmethod
    def delete_reward(db: Session, reward: Reward):
        db.delete(reward)
        db.commit()


    def bulk_assign_rewards(db: Session, bulk_data: RewardBulkAssign):
        """Safely assign rewards in bulk.

        Creates one Reward per user id in `bulk_data.user_ids`.
        Uses a common group_id derived from the first inserted row.
        Performs per-user try/except so one bad insert won't abort the whole operation.
        Commits once; if that fails, attempts to commit individually for created rows.
        Returns a summary dict: {"success": int, "failed": int}
        """
        success = 0
        failed = 0
        created = []
        created_committed = []
        group_id = None

        # iterate and attempt to create Reward rows (add to session)
        for idx, uid in enumerate(bulk_data.user_ids):
            try:
                pts = int(bulk_data.points_balance)
                if group_id is None:
                    # first row: add, flush to obtain id for group
                    r = Reward(user_id=uid, program_name=bulk_data.program_name, points_balance=pts)
                    db.add(r)
                    db.flush()
                    group_id = r.id
                    r.group_id = group_id
                    db.add(r)
                else:
                    r = Reward(user_id=uid, program_name=bulk_data.program_name, points_balance=pts, group_id=group_id)
                    db.add(r)
                created.append(r)
            except Exception as exc:
                failed += 1
                print(f"Failed to create reward for user_id={uid}: {exc}")
                import traceback
                traceback.print_exc()

        # Try commit once for all inserted rows
        try:
            db.commit()
            # refresh successful rows and collect them
            for r in created:
                try:
                    db.refresh(r)
                    created_committed.append(r)
                except Exception:
                    failed += 1
        except Exception as exc:
            # Commit failed; attempt to persist rows individually
            print("Bulk commit failed, attempting individual commits:", exc)
            db.rollback()
            created_committed = []
            for r in created:
                try:
                    db.add(r)
                    db.commit()
                    db.refresh(r)
                    created_committed.append(r)
                except Exception as exc2:
                    db.rollback()
                    failed += 1
                    print(f"Individual commit failed for reward (user_id={getattr(r, 'user_id', None)}): {exc2}")
                    import traceback
                    traceback.print_exc()

        # success/failed counts (computed from created_committed)
        success = len(created_committed)
        failed = max(0, len(created) - success)

        # Return list of created Reward instances so router can return ids/group_ids
        return created_committed



def create_reward(db: Session, user_id: int, payload: RewardCreate):
    return RewardService.create_reward(db, user_id, payload)

def get_rewards_for_user(db: Session, user_id: int):
    return RewardService.get_rewards_for_user(db, user_id)

def get_reward(db: Session, reward_id: int, user_id: int):
    return RewardService.get_reward(db, reward_id, user_id)

def get_reward_by_id(db: Session, reward_id: int):
    return RewardService.get_reward_by_id(db, reward_id)

def update_reward(db: Session, reward: Reward, payload: RewardUpdate):
    return RewardService.update_reward(db, reward, payload)

def delete_reward(db: Session, reward: Reward):
    return RewardService.delete_reward(db, reward)
 

def get_all_rewards(db: Session):
    return RewardService.get_all_rewards(db)


def bulk_assign_rewards(db: Session, bulk_data: RewardBulkAssign):
    return RewardService.bulk_assign_rewards(db, bulk_data)
