<script lang="ts">
import { Vue, Component, Mixins } from 'vue-property-decorator';
import store from '@/store';
import User from '@/models/User';
import GlobalMixin from '@/mixins/global-mixin';

@Component({})
export default class LoginView extends Mixins(GlobalMixin) {
  tempUser: User = new User();

  bCorrectLogin = true;

  async loginSend() {
    this.bCorrectLogin = true;
    // send in a GET request here to http://localhost:3004/user
    // need to pass in information here to call the api
    const loginCred = `${this.tempUser.username}-${this.tempUser.password}`;
    if (await this.callAPIUser(loginCred)) {
      // console.log('passed validation');
      store.state.user.loggedIn = true;
      // console.log(`user.loggedIn is: ${store.getters.auth}`);
      store.state.user.username = this.tempUser.username;
      await this.$router.push('/home');
    } else {
      console.log('failed validation');
      this.bCorrectLogin = false;
      store.state.user.loggedIn = false;
    }
  }

  async beforeMount() {
    if (store.getters.auth) {
      await this.$router.push('/home');
    }
  }
}

</script>

<template>
  <div>
    <h1>Login Required</h1>
    <h3 :hidden="bCorrectLogin">Incorrect Username or Password</h3>
    <b-input-group>
      <h3>Username</h3>
      <b-form-input v-model="tempUser.username" @keydown="bCorrectLogin=true"/>
    </b-input-group>
    <b-input-group>
      <h3>Password</h3>
      <b-form-input v-model="tempUser.password" type="password" @keydown="bCorrectLogin=true"/>
    </b-input-group>
    <b-button variant="primary" @click="loginSend">Login</b-button>
  </div>

</template>

<style scoped>

</style>
