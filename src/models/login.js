import * as service from '../services/login';
import { message } from 'antd';
import { routerRedux } from 'dva/router';
export default {
  namespace: 'login',
  state: {
    userInfo: {}, //当前的登录用户
  },
  effects: {
    *login({ payload }, { call, put }) {
      const { code, message: msg, data } = yield call(service.login, payload);
      if (code === 0) {
        let userInfo = data;
        yield put({ type: 'save', payload: { userInfo } });
        localStorage.setItem('userInfo', JSON.stringify(userInfo));
        yield put(routerRedux.push('/home'));
      } else {
        message.error(msg);
      }
    },
    // eslint-disable-next-line no-empty-pattern
    *loadUser({}, { put }) {
      let userInfoString = localStorage.getItem('userInfo');
      if (userInfoString) {
        let userInfo = JSON.parse(userInfoString);
        yield put({ type: 'save', payload: { userInfo } });
      } else {
        yield put(routerRedux.push('/login'));
      }
    },
  },
  //订阅方法，监听路径的变化 ，如果说路径 切换成/home的话，就要去先加载本地的数据
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(({ pathname, query }) => {
        if (pathname.startsWith('/home')) {
          dispatch({ type: 'loadUser' });
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
