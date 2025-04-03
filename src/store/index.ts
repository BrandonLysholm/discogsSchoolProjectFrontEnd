import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: {
      loggedIn: false,
      username: '',
    },
  },
  getters: {
    auth(state) {
      return state.user.loggedIn;
    },
    username(state) {
      return state.user.username;
    },
    // TODO Get LoginView setting the value for state
    // setters: {
    //   loggedIn(state, val) {
    //     state.user.loggedIn = val;
    //   },
    // },
  },
  mutations: {
  },
  actions: {
  },
  modules: {
  },
});
