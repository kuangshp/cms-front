import request from '@/utils/request';
// 用户登录
export const login = payload => {
  return request('/api/v1/user/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

// 获取当前用户的资源
export const resource = () => {
  return request('/api/v1/roles/get_resource');
};
