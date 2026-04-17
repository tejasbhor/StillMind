from arq import worker
from app.workers.settings import arq_redis_settings
from app.workers.risk_worker import compute_risk_job
from app.modules.allocation.worker import run_allocation_cycle

async def startup(ctx):
    # Any heavy state or DB connection pool sharing can be set here
    pass

async def shutdown(ctx):
    pass

class WorkerSettings:
    functions = [compute_risk_job, run_allocation_cycle]
    redis_settings = arq_redis_settings
    on_startup = startup
    on_shutdown = shutdown
