"""Configuration for the YGT backend.

Follows the layout of AIReport's app/config.py: app + jwt sections,
loadable from an optional config.yaml at the project root.
"""
import os
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional

import yaml

if getattr(sys, "frozen", False):
    BASE_DIR = Path(sys.executable).resolve().parent
else:
    BASE_DIR = Path(__file__).resolve().parent.parent


@dataclass
class AppConfig:
    host: str = "127.0.0.1"
    port: int = 8766
    api_prefix: str = "/api/v1"
    # 相对项目根目录；后端会优先挂载 Vue 构建产物
    static_dir: str = "vue/dist"
    db_path: str = "data/yugutu.db"


@dataclass
class JWTConfig:
    # 仅开发用默认值；生产必须通过 config.yaml 或环境变量覆盖
    secret_key: str = "yugutu-dev-secret-change-in-production"
    issuer: str = "http://localhost:8766"
    audience: str = "http://localhost:8766"
    expires_minutes: int = 480
    # 可选：额外 JWT 提供方（例如 SSO 平台），校验 token 时按序尝试
    providers: List[Dict[str, Any]] = field(default_factory=list)


@dataclass
class DatabaseConfig:
    type: str = "sqlite"  # sqlite / postgresql / oracle
    host: str = "127.0.0.1"
    port: int = 5432
    username: str = "postgres"
    password: str = ""
    database: str = "yugutu"  # PG 库名；Oracle 为 service_name
    connect_timeout: int = 30
    search_path: str = "public"
    oracle_path: str = ""  # Oracle 客户端路径，留空为 thin 模式


@dataclass
class Settings:
    app: AppConfig = field(default_factory=AppConfig)
    jwt: JWTConfig = field(default_factory=JWTConfig)
    database: DatabaseConfig = field(default_factory=DatabaseConfig)


def load_config(config_path: Optional[str] = None) -> Settings:
    """Load settings from YAML if present, otherwise use defaults."""
    path = Path(config_path) if config_path else BASE_DIR / "config.yaml"
    if not path.exists():
        return Settings()
    with open(path, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f) or {}
    app_data = data.get("app") or {}
    jwt_data = data.get("jwt") or {}
    db_data = data.get("database") or {}
    return Settings(
        app=AppConfig(**{k: v for k, v in app_data.items() if k in AppConfig.__dataclass_fields__}),
        jwt=JWTConfig(**{k: v for k, v in jwt_data.items() if k in JWTConfig.__dataclass_fields__}),
        database=DatabaseConfig(**{k: v for k, v in db_data.items() if k in DatabaseConfig.__dataclass_fields__}),
    )


_settings: Optional[Settings] = None
_config_path: Optional[Path] = None


def get_settings() -> Settings:
    """Get the global settings instance."""
    global _settings
    if _settings is None:
        _settings = load_config(os.getenv("CONFIG_PATH"))
    return _settings


def config_source() -> str:
    """Return where jwt settings came from (useful for token scripts)."""
    if _config_path:
        return str(_config_path)
    env_path = os.getenv("CONFIG_PATH")
    if env_path:
        return f"{env_path}（不存在，使用代码默认值）"
    return "config.yaml（不存在，使用代码默认值）"
