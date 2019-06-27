import request from '@/utils/request';
import querystring from 'querystring';
import { PAGE_SIZE } from '@/pages/home/user/constants';

// 获取当前用户
export const userList = (pageNum, where) => {
  let whereStr = querystring.stringify(where);
  return request(`/api/v1/user?pageNum=${pageNum}&pageSize=${PAGE_SIZE}&${whereStr}`);
};

// 创建用户
export const createUser = data => {
  return request('/api/v1/user', {
    method: 'post',
    body: JSON.stringify(data),
  });
};

// 修改用户
export const updateUser = data => {
  return request(`/api/v1/user/${data.id}`, {
    method: 'put',
    body: JSON.stringify(data),
  });
};

// 删除用户
export const delUser = id => {
  return request(`/api/v1/user/${id}`, {
    method: 'delete',
  });
};

// 批量删除用户
export const delAll = ids => {
  return request(`/api/v1/user/${ids[0]}`, {
    method: 'delete',
    body: JSON.stringify(ids),
  });
};
