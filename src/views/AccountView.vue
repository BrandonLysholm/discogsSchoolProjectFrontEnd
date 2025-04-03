<template>
  <div>
    <h1>Edit your account information:</h1>
    <!--    First Name-->
    <b-form-group :invalid-feedback="violation.firstName" :has-err="hasErr.fN"
                  class="mb-1" label="First Name" label-for="input-firstName">
      <b-input-group>
        <b-form-input id="input-firstName" v-model="tempAccountInfo.firstName" :state="hasErr.fN"
                      @keydown="violation.firstName=null"
                      aria-describedby="input-firstName-feedback"/>
        <b-form-invalid-feedback id="input-firstName-feedback">
          {{violation.firstName}}
        </b-form-invalid-feedback>
      </b-input-group>
    </b-form-group>
    <!--    Last Name-->
    <b-form-group :invalid-feedback="violation.lastName" :has-err="hasErr.lN"
                  class="mb-1" label="Last Name" label-for="input-lastName">
      <b-input-group>
        <b-form-input id="input-lastName" v-model="tempAccountInfo.lastName" :state="hasErr.lN"
                      @keydown="violation.lastName=null"
                      aria-describedby="input-lastName-feedback"/>
        <b-form-invalid-feedback id="input-LastName-feedback">
          {{violation.lastName}}
        </b-form-invalid-feedback>
      </b-input-group>
    </b-form-group>
    <!--    Phone-->
    <b-form-group :invalid-feedback="violation.phone" :has-err="hasErr.phone"
                  class="mb-1" label="Phone" label-for="input-phone">
      <b-input-group>
        <b-form-input id="input-phone" v-model="tempAccountInfo.phone" :state="hasErr.phone"
                      @keydown="violation.phone=null" aria-describedby="input-phone-feedback"/>
        <b-form-invalid-feedback id="input-phone-feedback">
          {{violation.phone}}
        </b-form-invalid-feedback>
      </b-input-group>
    </b-form-group>
    <!--    address-->
    <b-form-group :invalid-feedback="violation.address" :has-err="hasErr.address"
                  class="mb-1" label="Address" label-for="input-address">
      <b-input-group>
        <b-form-input id="input-address" v-model="tempAccountInfo.address" :state="hasErr.address"
                      @keydown="violation.address=null" aria-describedby="input-address-feedback"/>
        <b-form-invalid-feedback id="input-address-feedback">
          {{violation.address}}
        </b-form-invalid-feedback>
      </b-input-group>
    </b-form-group>
    <!--    city-->
    <b-form-group
      :state="hasErr.city"
      class="mb-1" label="City"
      abel-for="input-city">
      <b-input-group>
        <b-form-input id="input-city" v-model="tempAccountInfo.city" :state="hasErr.city"
                      @keydown="violation.city=null" aria-describedby="input-city-feedback"/>
        <b-form-invalid-feedback id="input-city-feedback">
          {{violation.city}}
        </b-form-invalid-feedback>
      </b-input-group>
    </b-form-group>
    <b-button variant="primary" @click="saveAccount">Save</b-button>
    <b-modal v-model="saveSuccess" hide-footer title="Success">
      <h3>Successfully Saved</h3>
      <b-button variant="primary" @click="saveSuccess=false">Close</b-button>
    </b-modal>
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import GlobalMixin from '@/mixins/global-mixin';
import AccountInfo from '@/models/AccountInfo';
import store from '@/store';

@Component
export default class AccountView extends Mixins(GlobalMixin) {
  violation: any = {};

  tempAccountInfo: AccountInfo = new AccountInfo();

  saveSuccess = false;

  // Called to load the accountInfo from the API to prefill out the form
  async beforeMount() {
    this.tempAccountInfo = await this.loadAccount();
  }

  // calls API to retreive user AccountInfo for currently logged in username
  async loadAccount() {
    this.violation = {};
    const url = `http://localhost:3004/accountinfo/${store.state.user.username}`;
    const response = await this.callAPI(url, 'get')
      .catch((err) => {
        this.violation = err.data || {};
      });
    return Object.assign(new AccountInfo(), response);
  }

  get hasErr(): any {
    return {
      fN: this.violation.firstName ? false : null,
      lN: this.violation.lastName ? false : null,
      phone: this.violation.phone ? false : null,
      address: this.violation.address ? false : null,
      city: this.violation.city ? false : null,
    };
  }

  // Calls API to validate inputted information
  // If no errors, updates the database
  // If there are validation errors, parses them to display errors
  // on the form fields for errant data
  async saveAccount() {
    let bHasError = false;
    this.violation = {};
    const url = `${this.ACCOUNT_INFO_API}/${store.state.user.username}`;
    this.tempAccountInfo.username = store.getters.username;

    await this.callAPI(url, 'put', this.tempAccountInfo)
      .catch((err) => {
        const temp = {};
        err.data.forEach((vio: any) => {
          Object.assign(temp, { [vio.property]: Object.values(vio.constraints)[0] });
        });
        this.violation = temp;
        bHasError = true;
      });
    if (!bHasError) {
      this.saveSuccess = true;
    }
  }

  // This should all be working now. Might need to include the Watch for changes
}
</script>

<style scoped>

</style>
