import * as service from '../services/resource';
import { routerRedux } from 'dva/router';
import { message } from 'antd';
export default {
  namespace: 'resource',
  state: {
    list: [], // 当前用户的资源菜单
    pageNum: 1,
    total: 0,
    editVisible: false,
    rowData: {},
    isCreate: true,
    selectedRowKeys: [], // 选择行的的id集合
    where: {},
  },
  effects: {
    *fetch(
      {
        payload: { pageNum, where },
      },
      { call, put, select },
    ) {
      if (!pageNum) {
        pageNum = yield select(state => state.resource.pageNum || 1);
      }

      if (!where) {
        where = yield select(state => state.resource.where || {});
      }
      const {
        code,
        message: msg,
        data: { data, total },
      } = yield call(service.list, pageNum, where);
      if (code === 0) {
        const list = data.map((item, index) => {
          return { ...item, key: index };
        });
        yield put({ type: 'save', payload: { list, total } });
      } else {
        message.error(msg);
      }
    },

    // 创建角色
    *create({ payload }, { put, select, call }) {
      const { code, message: msg } = yield call(service.create, payload);
      if (code === 0) {
        message.success(msg);
        const pageNum = yield select(state => state.user.pageNum);
        // 关闭弹框
        yield put({ type: 'save', payload: { editVisible: false } });
        // 重新请求数据
        yield put({ type: 'fetch', payload: { pageNum } });
        routerRedux.push(`/home/resource?pageNum=${pageNum}`);
      } else {
        message.error(msg);
      }
    },
    // 删除角色
    *del({ payload }, { put, select, call }) {
      const { code, message: msg } = yield call(service.del, payload.id);
      if (code === 0) {
        message.success(msg);
        yield put({ type: 'fetch', payload: { pageNum: 1 } });
        yield put(routerRedux.push('/home/resource?pageNum=1'));
        yield put({ type: 'save', payload: { pageNum: 1 } });
      } else {
        message.error(msg);
      }
    },

    // 批量删除角色
    *delAll({ payload }, { put, call }) {
      const { code, message: msg, info } = yield call(service.delAll, payload.ids);
      if (code === 0) {
        message.success(msg);
        yield put({ type: 'save', payload: { pageNum: 1 } });
        yield put(routerRedux.push('/home/resource?pageNum=1'));
        yield put({ type: 'fetch', payload: { pageNum: 1 } });
      } else {
        message.error(info);
      }
    },

    // 更新角色
    *update({ payload }, { put, call }) {
      const { code, message: msg, info } = yield call(service.update, payload);
      if (code === 0) {
        message.success(msg);
        yield put({ type: 'save', payload: { editVisible: false } });
        yield put({ type: 'save', payload: { pageNum: 1 } });
        yield put(routerRedux.push('/home/role?pageNum=1'));
        yield put({ type: 'fetch', payload: { pageNum: 1 } });
      } else {
        message.error(info);
      }
    },
  },
  //订阅方法，监听路径的变化 ，如果说路径 切换成/home的话，就要去先加载本地的数据
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(({ pathname, query }) => {
        if (pathname === '/home/resource') {
          dispatch({ type: 'fetch', payload: query });
        }
      });
    },
  },
  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    },
  },
};
