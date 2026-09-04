import axios from 'axios';

export const tokenStore = {
  setToken(token) {
    if (token) localStorage.setItem('token', token);
  },
  getToken() {
    return localStorage.getItem('token');
  },
  removeToken() {
    localStorage.removeItem('token');
  },
  hasToken() {
    return !!this.getToken();
  }
};

function isValidJwt(token) {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  return parts.length === 3 && parts.every((p) => /^[A-Za-z0-9_-]+$/.test(p));
}

function readCookie(name) {
  const row = `; ${document.cookie}`.split(`; ${name}=`);
  if (row.length === 2) return row.pop().split(';').shift();
  return null;
}

let initAuthError = '';

export function initToken() {
  const saved = tokenStore.getToken();
  if (saved && saved.length) {
    if (isValidJwt(saved)) return true;
    tokenStore.removeToken();
    initAuthError = '本地 token 格式无效，请重新获取';
  }

  const params = new URLSearchParams(window.location.search);
  const urlToken = params.get('token');
  if (urlToken && urlToken.length) {
    if (!isValidJwt(urlToken)) {
      initAuthError = 'token 格式无效，请只复制有效 token 或直接打开生成器输出的地址';
      params.delete('token');
      const qs = params.toString();
      window.history.replaceState({}, document.title, window.location.pathname + (qs ? '?' + qs : ''));
      return false;
    }
    tokenStore.setToken(urlToken);
    params.delete('token');
    const qs = params.toString();
    window.history.replaceState({}, document.title, window.location.pathname + (qs ? '?' + qs : ''));
    return true;
  }

  const cookieName = window.YGT_TOKEN_COOKIE || 'iwellToken';
  const cookie = readCookie(cookieName) || readCookie('token') || readCookie('auth_token') || readCookie('jwt');
  if (cookie && cookie.length) {
    tokenStore.setToken(cookie);
    return true;
  }
  return false;
}

export function getInitAuthError() {
  return initAuthError;
}

const http = axios.create({
  baseURL: window.YGT_API_BASE || import.meta.env.VITE_API_BASE || '/api',
  timeout: 60000
});

http.interceptors.request.use(
  (config) => {
    const token = tokenStore.getToken();
    config._hasToken = !!token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

let last401At = 0;
http.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      const hadToken = !!(error.config && error.config._hasToken);
      tokenStore.removeToken();
      const now = Date.now();
      if (hadToken && now - last401At > 3000) {
        last401At = now;
        window.dispatchEvent(new CustomEvent('ygt-auth-error', {
          detail: '登录已失效，请重新获取 token'
        }));
        setTimeout(() => window.location.reload(), 1200);
      } else if (!hadToken) {
        window.dispatchEvent(new CustomEvent('ygt-auth-error', {
          detail: '缺少 token，请先获取访问令牌'
        }));
      }
    }
    return Promise.reject(error);
  }
);

export function errorMessage(error) {
  const data = error && error.response && error.response.data;
  if (data && typeof data.detail === 'string') return data.detail;
  if (error && error.message) return error.message;
  return '请求失败';
}

export default http;
