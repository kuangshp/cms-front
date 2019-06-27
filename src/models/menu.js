import * as service from '../services/menu';
import { message } from 'antd';
export default {
  namespace: 'menu',
  state: {
    userResource: [], // 当前用户的资源菜单
  },
  effects: {
    *loadMenu({ payload }, { call, put, select }) {
      var stateUserResource = yield select(state => state.menu.userResource);
      if (!stateUserResource.length) {
        const { code, message: msg, data } = yield call(service.resource, payload);
        if (code === 0) {
          yield put({ type: 'save', payload: { userResource: data } });
        } else {
          message.error(msg);
        }
      }
    },
  },
  //订阅方法，监听路径的变化 ，如果说路径 切换成/home的话，就要去先加载本地的数据
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(({ pathname, query }) => {
        if (pathname.startsWith('/home')) {
          dispatch({ type: 'loadMenu' });
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
