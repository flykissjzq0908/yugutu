"""YGT FastAPI application entry point."""
import logging
import sys
from contextlib import asynccontextmanager
from logging.handlers import TimedRotatingFileHandler
from pathlib import Path

from fastapi import FastAPI
from fastapi import Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import BASE_DIR, get_settings
from app.models import create_tables
from app.routers import ygt_doc
from app.services import ygt_store

logger = logging.getLogger(__name__)

settings = get_settings()


def setup_logging() -> dict:
    """启动日志与错误日志：logs/app.log + logs/access.log，控制台同步输出。"""
    log_dir = BASE_DIR / "logs"
    log_dir.mkdir(parents=True, exist_ok=True)
    app_log = str(log_dir / "app.log")
    access_log = str(log_dir / "access.log")

    formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(name)s - %(message)s")
    console = logging.StreamHandler()
    console.setFormatter(formatter)
    file_handler = TimedRotatingFileHandler(
        app_log, when="midnight", interval=1, backupCount=30, encoding="utf-8"
    )
    file_handler.suffix = "%Y-%m-%d"
    file_handler.setFormatter(formatter)

    root = logging.getLogger()
    root.setLevel(logging.INFO)
    root.handlers.clear()
    root.addHandler(console)
    root.addHandler(file_handler)

    return {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "default": {"format": "%(asctime)s - %(levelname)s - %(name)s - %(message)s"},
            "access": {"format": "%(asctime)s - %(levelname)s - %(message)s"},
        },
        "handlers": {
            "console": {"class": "logging.StreamHandler", "formatter": "default"},
            "app_file": {
                "class": "logging.handlers.TimedRotatingFileHandler",
                "filename": app_log,
                "when": "midnight",
                "interval": 1,
                "backupCount": 30,
                "encoding": "utf-8",
                "formatter": "default",
            },
            "access_file": {
                "class": "logging.handlers.TimedRotatingFileHandler",
                "filename": access_log,
                "when": "midnight",
                "interval": 1,
                "backupCount": 30,
                "encoding": "utf-8",
                "formatter": "access",
            },
        },
        "loggers": {
            "uvicorn": {"handlers": ["console", "app_file"], "level": "INFO", "propagate": False},
            "uvicorn.error": {"handlers": ["console", "app_file"], "level": "INFO", "propagate": False},
            "uvicorn.access": {"handlers": ["console", "access_file"], "level": "INFO", "propagate": False},
        },
        "root": {"handlers": ["console", "app_file"], "level": "INFO"},
    }


log_config = setup_logging()

logger.info("YGT 服务启动配置: host=%s port=%s database=%s", settings.app.host, settings.app.port, settings.database.type)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize the application on startup."""
    logger.info("服务启动中...")
    if settings.database.type == "oracle":
        logger.info("Oracle 模式跳过自动建表，使用现有 hl_ygt / hl_ygtmx 表")
    else:
        try:
            ygt_store.ensure_tables()
        except Exception as exc:  # pragma: no cover - startup only
            logger.warning("建表失败: %s", exc)
    logger.info("服务启动成功")
    yield


app = FastAPI(title="YGT Flow API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_request_errors(request: Request, call_next):
    """记录请求级异常到错误日志。"""
    try:
        return await call_next(request)
    except Exception:
        logger.exception("请求处理失败: %s %s", request.method, request.url.path)
        raise

app.include_router(ygt_doc.router, prefix=settings.app.api_prefix)


@app.get("/health", tags=["health"])
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


# 挂载 Vue 构建产物（若存在），实现单页入口
_static_dir = Path(settings.app.static_dir)
if not _static_dir.is_absolute():
    if getattr(sys, "frozen", False):
        _static_dir = Path(getattr(sys, "_MEIPASS", Path(sys.executable).parent)) / settings.app.static_dir
    else:
        _static_dir = Path(__file__).resolve().parent.parent / settings.app.static_dir
if _static_dir.exists():
    app.mount("/", StaticFiles(directory=_static_dir, html=True), name="vue")


if __name__ == "__main__":
    import uvicorn

    # 打包为 exe 后目标机没有 Python，启动时记录带 token 的访问地址
    try:
        from app.scripts.make_token import make_token

        logger.info("开发访问地址: http://127.0.0.1:%s/?token=%s", settings.app.port, make_token())
    except Exception as exc:
        logger.warning("生成开发访问地址失败: %s", exc)

    uvicorn.run(
        app,
        host=settings.app.host,
        port=settings.app.port,
        log_config=log_config,
    )
