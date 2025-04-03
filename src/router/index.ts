import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import store from '@/store';
import HomeView from '@/views/HomeView.vue';
import AccountView from '@/views/AccountView.vue';
import SearchView from '@/views/SearchView.vue';
import LoginView from '@/views/LoginView.vue';

Vue.use(VueRouter);

// Tutorial on how to use middlewares: https://blog.logrocket.com/vue-middleware-pipelines/

// Tried having these methods in a separate file but the linter hated me for that
// @ts-ignore
function checkLoggedIn({ next }) {
  // console.log('entered middleware');
  // console.log(`user.loggedIn is in middleware: ${store.getters.auth}`);
  if (store.getters.auth) {
    // console.log('passed validation in middleware');
    return next();
  }
  return next({
    name: 'login',
  });
}

// @ts-ignore
function middlewarePipeline(context, middleware, index) {
  const nextMiddleware = middleware[index];

  if (!nextMiddleware) {
    return context.next;
  }

  return () => {
    const nextPipeline = middlewarePipeline(context, middleware, index + 1);

    nextMiddleware({ ...context, next: nextPipeline });
  };
}

const routes: Array<RouteConfig> = [

  // my routes
  {
    path: '/home',
    name: 'home',
    component: HomeView,
    meta: {
      middleware: [
        checkLoggedIn,
      ],
    },
  },
  {
    path: '/search',
    name: 'search',
    component: SearchView,
    meta: {
      middleware: [
        checkLoggedIn,
      ],
    },
  },
  {
    path: '/account',
    name: 'account',
    component: AccountView,
    meta: {
      middleware: [
        checkLoggedIn,
      ],
    },
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
  },
  {
    path: '/',
    name: 'login',
    component: LoginView,
  },

];

const router = new VueRouter({
  routes,
});

router.beforeEach((to, from, next) => {
  // @ts-ignore
  if (!to.meta.middleware) {
    return next();
  }
  // @ts-ignore
  const { middleware } = to.meta;

  const context = {
    to,
    from,
    next,
    store,
  };

  return middleware[0]({
    ...context,
    next: middlewarePipeline(context, middleware, 1),
  });
});

export default router;
