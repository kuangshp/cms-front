import request from '@/utils/request';

// 获取当前用户的资源
export const resource = () => {
  return request('/api/v1/roles/get_resource');
};
