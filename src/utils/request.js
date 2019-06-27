import fetch from 'dva/fetch';
const BASE_URL = 'http://127.0.0.1:7001';

function parseJSON(response) {
  return response.json();
}

function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  const error = new Error(response.statusText);
  error.response = response;
  throw error;
}

function getToken() {
  const userInfo = window.localStorage.getItem('userInfo');
  if (userInfo) {
    return JSON.parse(userInfo).token;
  } else {
    return '';
  }
}
/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
export default function request(url, options = {}) {
  options.method = options.method || 'GET';
  options.headers = options.headers || {};
  options.headers['Content-Type'] = 'application/json'; //指定请求体的类型
  options.headers['Accept'] = 'application/json'; //告诉服务器我需要json
  options.headers['token'] = getToken();
  options.credentials = 'include'; //跨域传递cookie ,因为默认不传送
  return fetch(`${BASE_URL}${url}`, options)
    .then(checkStatus)
    .then(parseJSON)
    .then(data => data)
    .catch(err => ({ err }));
}
