import request from '@/utils/request';
import querystring from 'querystring';
import { PAGE_SIZE } from '@/pages/home/resource/constants';

// 获取全部的角色
export const list = (pageNum, where) => {
  let whereStr = querystring.stringify(where);
  return request(`/api/v1/resource?pageNum=${pageNum}&pageSize=${PAGE_SIZE}&${whereStr}`);
};

// 创建角色
export const create = data => {
  return request('/api/v1/resource', {
    method: 'post',
    body: JSON.stringify(data),
  });
};

// 删除用户
export const del = id => {
  return request(`/api/v1/resource/${id}`, {
    method: 'delete',
  });
};

// 批量删除用户
export const delAll = ids => {
  return request(`/api/v1/resource/${ids[0]}`, {
    method: 'delete',
    body: JSON.stringify(ids),
  });
};

// 更新数据
export const update = data => {
  return request(`/api/v1/resource/${data.id}`, {
    method: 'put',
    body: JSON.stringify(data),
  });
};
