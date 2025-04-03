/* eslint-disable max-len */
/**
 * Mixins are a flexible way to distribute reusable functionalities for Vue components.
 * https://vuejs.org/v2/guide/mixins.html
 * The following mixin will only be imported to ALL components in this project (even the 3rd party components)
 * all the following methods and variables will be available to ALL components as this mixin will be imported in main.js
 */

// mixins.js
import { Component, Prop, Vue } from 'vue-property-decorator';
import store from '@/store';
// import { Store } from 'vuex';

const BASEJSON_API = 'http://localhost:3006';
const STUDENT_API = `${BASEJSON_API}/students`;
const BASE_API = 'http://localhost:3004';
const ACCOUNT_INFO_API = `${BASE_API}/accountinfo`;
const ARTIST_INFO_API = `${BASE_API}/artistinfo`;
const ALBUM_INFO_API = `${BASE_API}/albuminfo`;
const USER_API = `${BASE_API}/user`;
const FETCH_HEADERS:any = {
  'X-Requested-With': 'XmlHttpRequest',
  'Content-Type': 'application/json; charset=utf-8',
  Authorization: '', // Authorization is getting the username from store
};

@Component
export default class GlobalMixin extends Vue {
  @Prop(Boolean) readonly debug!:boolean

  @Prop(Boolean) readonly disabled!:boolean

  // immutable constant data variables
  BASE_API = BASEJSON_API

  STUDENT_API = STUDENT_API

  ACCOUNT_INFO_API = ACCOUNT_INFO_API

  ARTIST_INFO_API = ARTIST_INFO_API

  ALBUM_INFO_API = ALBUM_INFO_API

  USER_API = USER_API

  // regular data variable
  isBusy = false

  // Declared as computed property getter
  get isDisabled():boolean {
    return this.isBusy || this.disabled;
  }

  mounted() { // when ANY component loads
    if (this.debug) {
      // output the props and data variables to the console
      console.log(this.$props);
      console.log(this.$data);
    }
  }

  // method to set the internal isBusy and emit to the parent component the busy state
  setBusy(state:boolean) {
    this.isBusy = state;
    this.$emit('busy', state);
  }

  // function that will determine which request method and how to send the data to the api
  callJSONAPI(url:string, method = 'get', dataToSend = {}) {
    const fetchOptions: any = {
      method: 'GET',
      credentials: 'include', // allows api to set cookies in the browser
      referrerPolicy: 'strict-origin-when-cross-origin',
      headers: { ...FETCH_HEADERS },
    };
    // ensure valid/allowed request methods
    // eslint-disable-next-line no-param-reassign
    method = method.toUpperCase();
    if (['POST', 'PUT', 'DELETE'].includes(method)) fetchOptions.method = method;
    // convert JS object to JSON string – GET request cannot have a body property so append it to the URL
    if (fetchOptions.method !== 'GET') fetchOptions.body = JSON.stringify(dataToSend);
    // eslint-disable-next-line no-param-reassign
    else if (Object.keys(dataToSend).length) url += `?${(new URLSearchParams(dataToSend)).toString()}`;

    // return a promise we can use .then, .catch and .finally in our component
    return fetch(url, fetchOptions)
      .then(async (res) => {
        const resInfo:any = { url: res.url, status: res.status, statusText: res.statusText };
        if (res.status === 204) return Promise.resolve(resInfo);
        if (res.ok) return res.json();

        const error = new Error(`${res.status}: ${res.statusText}`);
        resInfo.data = await res.json();
        throw Object.assign(error, resInfo);
      });
  }

  callAPI(url:string, method = 'get', dataToSend = {}) {
    const fetchOptions: any = {
      method: 'GET',
      credentials: 'include', // allows api to set cookies in the browser
      referrerPolicy: 'strict-origin-when-cross-origin',
      headers: { ...FETCH_HEADERS },
    };
    // ensure valid/allowed request methods
    // eslint-disable-next-line no-param-reassign
    method = method.toUpperCase();
    if (['POST', 'PUT', 'DELETE'].includes(method)) fetchOptions.method = method;
    // convert JS object to JSON string – GET request cannot have a body property so append it to the URL
    if (fetchOptions.method !== 'GET') fetchOptions.body = JSON.stringify(dataToSend);
    // eslint-disable-next-line no-param-reassign
    else if (Object.keys(dataToSend).length) url += `?${(new URLSearchParams(dataToSend)).toString()}`;

    // return a promise we can use .then, .catch and .finally in our component
    return fetch(url, fetchOptions)
      .then(async (res) => {
        const resInfo:any = { url: res.url, status: res.status, statusText: res.statusText };
        if (res.status === 204) return Promise.resolve(resInfo);
        if (res.ok) return res.json();

        const error = new Error(`${res.status}: ${res.statusText}`);
        resInfo.data = await res.json();
        throw Object.assign(error, resInfo);
      });
  }

  callAPIUser(loginCred:string) {
    FETCH_HEADERS.Authorization = `Bearer ${store.getters.username}`;
    const fetchOptions: any = {
      method: 'GET',
      credentials: 'include', // allows api to set cookies in the browser
      referrerPolicy: 'strict-origin-when-cross-origin',
      headers: { ...FETCH_HEADERS },
    };
    // eslint-disable-next-line no-param-reassign
    // if (Object.keys(dataToSend).length) url += `?${(new URLSearchParams(dataToSend)).toString()}`;
    const url = `${USER_API}/${loginCred}`;
    // return a promise we can use .then, .catch and .finally in our component
    return fetch(url, fetchOptions)
      // eslint-disable-next-line consistent-return
      .then(async (res) => {
        if (res.status === 200) {
          return true;
        }
      });
    return false;
  }
}
