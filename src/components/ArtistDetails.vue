<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';
import GlobalMixin from '@/mixins/global-mixin';
import ArtistInfo from '@/models/ArtistInfo';

@Component({})
export default class ArtistDetails extends Mixins(GlobalMixin) {
  @Prop({ type: Object, validator: (s) => s instanceof Object }) readonly artist: any
  // tempArtist: ArtistInfo = new ArtistInfo();

  getAlbums() {
    // Do an EMIT here to render albums
    this.$emit('getAlbum', this.artist.artistInfoID);
  }

  changeRating() {
    this.$emit('changeArtistRating', this.artist.artistInfoID, this.artist.rating);
  }

  deleteArtist() {
    this.$emit('deleteArtist', this.artist.artistInfoID);
  }
}
</script>

<template>
  <div>
    <h2>{{artist.artistName}}</h2>
    <img :src="artist.artistPic" :alt="artist.artistName" height="250px"/> <br/>
    <b-form-group>
      <b-input-group>
        <b-form-rating v-model="artist.rating" @change="changeRating"/>
      </b-input-group>
    </b-form-group>
    <b-button variant="primary" @click="getAlbums">Get Albums</b-button>
    <b-button variant="danger" @click="deleteArtist">Remove Artist</b-button>
  </div>
</template>

<style scoped>

</style>
