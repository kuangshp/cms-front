import * as service from '../services/user';
import { routerRedux } from 'dva/router';
import { message } from 'antd';
export default {
  namespace: 'user',
  state: {
    userList: [], // 当前用户的资源菜单
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
        pageNum = yield select(state => state.user.pageNum || 1);
      }
      if (!where) {
        where = yield select(state => state.user.where || {});
      }
      const {
        code,
        message: msg,
        data: { data, total },
      } = yield call(service.userList, pageNum, where);
      if (code === 0) {
        const userList = data.map((item, index) => {
          return { ...item, key: index };
        });
        yield put({ type: 'save', payload: { userList, total } });
      } else {
        message.error(msg);
      }
    },
    // 创建用户
    *createUser({ payload }, { call, put, select }) {
      const { code, message: msg } = yield call(service.createUser, payload);
      if (code === 0) {
        message.success(msg);
        const pageNum = yield select(state => state.user.pageNum);
        // 关闭弹框
        yield put({ type: 'save', payload: { editVisible: false } });
        // 重新请求数据
        yield put({ type: 'fetch', payload: { pageNum } });
      } else {
        message.error(msg);
      }
    },
    // 更新用户
    *updateUser({ payload }, { call, put, select }) {
      const { code, message: msg } = yield call(service.updateUser, payload);
      if (code === 0) {
        message.success(msg);
        const pageNum = yield select(state => state.user.pageNum);
        // 关闭弹框
        yield put({ type: 'save', payload: { editVisible: false } });
        // 重新请求数据
        yield put({ type: 'fetch', payload: { pageNum } });
      } else {
        message.error(msg);
      }
    },
    // 删除的方法
    *delRow({ payload }, { call, put }) {
      const { code, message: msg } = yield call(service.delUser, payload.id);
      if (code === 0) {
        message.success(msg);
        yield put({ type: 'fetch', payload: { pageNum: 1 } });
        yield put(routerRedux.push('/home/user?pageNum=1'));
        yield put({ type: 'save', payload: { pageNum: 1 } });
      } else {
        message.error(msg);
      }
    },
    // 批量删除
    *delAll({ payload }, { call, put }) {
      yield call(service.delAll, payload.ids);
      yield put({ type: 'save', payload: { pageNum: 1 } });
      yield put(routerRedux.push('/home/user?pageNum=1'));
      yield put({ type: 'fetch', payload: { pageNum: 1 } });
    },
  },
  //订阅方法，监听路径的变化 ，如果说路径 切换成/home的话，就要去先加载本地的数据
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(({ pathname, query }) => {
        if (pathname === '/home/user') {
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
