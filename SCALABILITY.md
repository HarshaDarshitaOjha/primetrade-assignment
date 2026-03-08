# Scalability Notes

This document outlines how the current architecture can be scaled to handle increased traffic, larger teams, and higher data volumes.

---

## Current Architecture

```
Client (React SPA)
      │
      ▼
FastAPI (Uvicorn)  ──►  PostgreSQL
```

Simple, single-process monolith. Good for development and small deployments.

---

## Horizontal Scaling (Near-Term)

### Load Balancing
Run multiple Uvicorn workers behind a load balancer (e.g., **Nginx** or **AWS ALB**):

```
                    ┌──► Uvicorn Worker 1 ──┐
Client ──► Nginx ───┤                        ├──► PostgreSQL
                    └──► Uvicorn Worker 2 ──┘
```

- FastAPI is stateless (JWT-based auth) so any worker can handle any request
- Scale workers: `uvicorn app.main:app --workers 4`
- PostgreSQL connection pooling via **PgBouncer** prevents connection exhaustion

### Caching with Redis
Add **Redis** to cache frequently read data (e.g., task lists):

```python
# Example: cache task list for 60 seconds per user
@router.get("")
def list_tasks(current_user, db, redis):
    cache_key = f"tasks:user:{current_user.id}"
    cached = redis.get(cache_key)
    if cached:
        return json.loads(cached)
    tasks = db.query(Task).filter(...).all()
    redis.setex(cache_key, 60, json.dumps(tasks))
    return tasks
```

Redis also enables **rate limiting** on auth endpoints to prevent brute force.

---

## Microservices (Long-Term)

Split the monolith into focused services as the team and codebase grow:

```
Client
  │
  ▼
API Gateway (Nginx / Kong)
  ├──► Auth Service     (register, login, token validation)
  ├──► Task Service     (CRUD for tasks)
  └──► Notification Service  (email alerts, future feature)
```

**Benefits:**
- Independent deployment and scaling per service
- Teams can own separate services
- Failures are isolated (a broken notification service won't affect task CRUD)

**Trade-offs:**
- Increased operational complexity (service discovery, distributed tracing)
- Network latency between services
- Requires an API gateway for routing and auth token propagation

---

## Database Scaling

| Strategy | When to Apply |
|---|---|
| **Read replicas** | Read-heavy workloads — route `SELECT` queries to replicas |
| **Partitioning** | Tasks table grows very large — partition by `owner_id` or `created_at` |
| **Sharding** | Multi-tenant SaaS — shard by tenant/organization |

---

## Deployment Strategies

| Approach | Description |
|---|---|
| **Docker Compose** | Local dev and small deployments (included in this repo) |
| **Kubernetes (K8s)** | Production — auto-scaling, self-healing, rolling deployments |
| **Serverless (Lambda)** | Bursty workloads — use Mangum adapter to run FastAPI on AWS Lambda |
| **Managed PaaS** | Railway, Render, or Fly.io for quick zero-ops deployments |

---

## Observability

As the system scales, add:
- **Structured logging** (e.g., `structlog` or JSON logs → CloudWatch / ELK)
- **Distributed tracing** (OpenTelemetry → Jaeger / Zipkin)
- **Metrics** (Prometheus + Grafana dashboards)
- **Alerting** (PagerDuty / Alertmanager on error rate thresholds)

---

## Summary

The current FastAPI + PostgreSQL stack is production-ready for low-to-medium traffic. The key scaling path is:

1. **Now**: Add Redis caching + multiple Uvicorn workers behind Nginx
2. **Growth**: Introduce read replicas and connection pooling
3. **Scale**: Extract microservices, adopt Kubernetes, add observability
