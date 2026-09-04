"""生成/校验开发用 JWT token（配合 ?token= 打开 Vue 页面）。"""
import argparse
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

import jwt

from app.config import get_settings

ROOT = Path(__file__).resolve().parent.parent.parent


def make_token(user_id: str = "dev", user_name: str = "开发者") -> str:
    settings = get_settings()
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "name": user_name,
        "iat": now,
        "exp": now + timedelta(minutes=settings.jwt.expires_minutes),
        "iss": settings.jwt.issuer,
        "aud": settings.jwt.audience,
    }
    return jwt.encode(payload, settings.jwt.secret_key, algorithm="HS256")


def check_token(token: str) -> dict:
    """Decode and verify a token with the same jwt config."""
    settings = get_settings()
    return jwt.decode(
        token,
        settings.jwt.secret_key,
        algorithms=["HS256"],
        audience=settings.jwt.audience,
        issuer=settings.jwt.issuer,
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="生成/校验开发用 JWT token")
    parser.add_argument("user_id", nargs="?", default="dev", help="用户ID，默认 dev")
    parser.add_argument("--check", metavar="TOKEN", help="校验已生成 token 并打印 claims")
    parser.add_argument("--url", action="store_true", help="只输出可打开的完整地址")
    parser.add_argument("--token", action="store_true", help="只输出 token 本身")
    args = parser.parse_args()

    if Path.cwd().resolve() != ROOT:
        print(f"请在项目根目录运行：cd {ROOT}")
        sys.exit(1)

    from app.config import config_source

    if args.check:
        try:
            claims = check_token(args.check)
        except Exception as exc:
            print(f"token 校验失败：{exc}")
            sys.exit(1)
        print("token 校验通过，claims:")
        for key, value in claims.items():
            print(f"  {key}: {value}")
        print(f"JWT 配置来源: {config_source()}")
        sys.exit(0)

    token = make_token(args.user_id)
    url = f"http://127.0.0.1:{get_settings().app.port}/?token={token}"
    if args.url:
        print(url)
    elif args.token:
        print(token)
    else:
        print(token)
        print(f"开发访问地址: {url}")
        print(f"JWT 配置来源: {config_source()}")
        print("提示: 直接打开第二行地址；如手动粘贴，只复制第一行 token。")
