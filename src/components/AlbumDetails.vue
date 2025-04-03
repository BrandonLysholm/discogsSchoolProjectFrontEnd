<template>
  <div>
    <img :src="album.albumPic" :alt="album.albumTitle" />
    <h3>{{album.albumTitle}}</h3>
    <p>Release date: {{album.releaseDate}}</p>
    <b-form-group>
      <b-input-group>
        <b-form-rating v-model="album.rating" @change="changeRating" />
      </b-input-group>
    </b-form-group>
    <b-button variant="danger" @click="deleteAlbum">Remove Album</b-button>
  </div>
</template>

<script lang="ts">

import { Component, Mixins, Prop } from 'vue-property-decorator';
import GlobalMixin from '@/mixins/global-mixin';

@Component({})
export default class AlbumDetails extends Mixins(GlobalMixin) {
  @Prop({ type: Object, validator: (s) => s instanceof Object }) readonly album: any

  changeRating() {
    this.$emit('changeAlbumRating', this.album.albumInfoID, this.album.rating);
  }

  deleteAlbum() {
    this.$emit('deleteAlbum', this.album.albumInfoID);
  }
}
</script>

<style scoped>

</style>
