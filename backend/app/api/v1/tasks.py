import json
from datetime import datetime

import redis
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.db.models import Task, User
from app.schemas.task import TaskCreate, TaskOut, TaskUpdate

router = APIRouter()

# Connect to Redis (use localhost for dev, Redis URL for prod)
try:
    # Optional: read REDIS_URL from env if needed, but using localhost default for simplicity
    redis_client = redis.Redis(host="localhost", port=6379, db=0, decode_responses=True)
    redis_client.ping()
    REDIS_AVAILABLE = True
except Exception:
    REDIS_AVAILABLE = False
    redis_client = None


@router.get("", response_model=list[TaskOut])
def list_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    cache_key = f"tasks:user:{current_user.id}"

    # Try cache first
    if REDIS_AVAILABLE:
        try:
            cached = redis_client.get(cache_key)
            if cached:
                return json.loads(cached)
        except Exception:
            pass

    # Cache miss or Redis down — query DB
    q = db.query(Task)
    if current_user.role != "admin":
        q = q.filter(Task.owner_id == current_user.id)
    tasks = q.order_by(Task.id.desc()).all()

    # Store in cache (30 second TTL)
    if REDIS_AVAILABLE:
        try:
            task_dicts = [TaskOut.model_validate(t).model_dump(mode="json") for t in tasks]
            redis_client.setex(cache_key, 30, json.dumps(task_dicts))
        except Exception:
            pass

    return tasks


@router.post("", response_model=TaskOut, status_code=201)
def create_task(
    payload: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = Task(
        title=payload.title,
        description=payload.description,
        owner_id=current_user.id,
        updated_at=datetime.utcnow(),
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    # Invalidate cache
    if REDIS_AVAILABLE:
        try:
            redis_client.delete(f"tasks:user:{current_user.id}")
        except Exception:
            pass

    return task


def _get_task_or_404(db: Session, task_id: int) -> Task:
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


def _enforce_access(task: Task, current_user: User):
    if current_user.role == "admin":
        return
    if task.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not allowed")


@router.get("/{task_id}", response_model=TaskOut)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = _get_task_or_404(db, task_id)
    _enforce_access(task, current_user)
    return task


@router.patch("/{task_id}", response_model=TaskOut)
def update_task(
    task_id: int,
    payload: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = _get_task_or_404(db, task_id)
    _enforce_access(task, current_user)

    if payload.title is not None:
        task.title = payload.title
    if payload.description is not None:
        task.description = payload.description
    if payload.is_done is not None:
        task.is_done = payload.is_done

    task.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(task)

    # Invalidate cache
    if REDIS_AVAILABLE:
        try:
            redis_client.delete(f"tasks:user:{current_user.id}")
        except Exception:
            pass

    return task


@router.delete("/{task_id}", response_model=dict)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = _get_task_or_404(db, task_id)
    _enforce_access(task, current_user)

    db.delete(task)
    db.commit()

    # Invalidate cache
    if REDIS_AVAILABLE:
        try:
            redis_client.delete(f"tasks:user:{current_user.id}")
        except Exception:
            pass

    return {"deleted": True}