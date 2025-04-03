<template>
  <div id="app">
    <b-nav pills align="center" class="mb-4">
      <b-nav-item to="/home" exact-active-class="active"> Home </b-nav-item> |
      <b-nav-item to="/account" exact-active-class="active"> Account </b-nav-item> |
      <b-nav-item to="/search" exact-active-class="active"> Search </b-nav-item>
    </b-nav>
    <router-view class="container-xl"/>
  </div>
</template>
<script setup lang="ts">
</script>
