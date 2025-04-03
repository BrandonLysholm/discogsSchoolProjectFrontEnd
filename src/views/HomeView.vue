<template>
  <div>
    <!--  So for each artist entry in the array, I need to load a ArtistDetails component-->
    <!--    https://vuejs.org/guide/essentials/list#v-for-with-a-component-->
    <div :hidden="bHideNoArtists">
      <h1>You have no saved artists</h1>
      <p>Navigate to <b-button @click="redirectSearch">"Search"</b-button> to save artists</p>
    </div>
    <div class="row align-items-start" :hidden="bHideArtists">
      <h1 class="col-12">Your liked artists</h1>
      <ArtistDetails
        v-for="artist in artists"
        :key="artist.artistInfoID"
        @getAlbum="getAllAlbums"
        @changeArtistRating="changeArtistRating"
        @deleteArtist="deleteArtistModal"
        :artist="artist"
        class="col-4 mb-3"
      />
    </div>
    <!--    Artist delete confirm modal-->
    <b-modal v-model="artistDeleteShow" hide-footer title="WARNING!">
      <h1>Confirm Deletion of Artist</h1>
      <b-button variant="secondary" @click="artistDeleteShow = false">Cancel</b-button>
      <b-button variant="danger" @click="deleteArtistConfirmed">Confirm</b-button>
    </b-modal>
    <!-- here is where albums are displayed-->
    <div class="row align-items-start" :hidden="bHideAlbums">
      <h1 class="col-12">Their discography</h1>
      <AlbumDetails
        v-for="album in albums"
        :key="album.albumInfoID"
        :album="album"
        class="col-3 mb-3"
        @changeAlbumRating="changeAlbumRating"
        @deleteAlbum="deleteAlbumModal"
      />
    </div>
    <!--    Album delete confirm modal-->
    <b-modal v-model="albumDeleteShow" hide-footer title="WARNING!">
      <h1>Confirm Deletion of Album</h1>
      <b-button variant="secondary" @click="albumDeleteShow = false">Cancel</b-button>
      <b-button variant="danger" @click="deleteAlbumConfirmed">Confirm</b-button>
    </b-modal>
  </div>
</template>
<script lang="ts">
import { Vue, Component, Mixins } from 'vue-property-decorator';
import GlobalMixin from '@/mixins/global-mixin';
import ArtistDetails from '@/components/ArtistDetails.vue';
import store from '@/store';
import ArtistInfo from '@/models/ArtistInfo';
import AlbumInfo from '@/models/AlbumInfo';
import AlbumDetails from '@/components/AlbumDetails.vue';

@Component({
  components: {
    AlbumDetails,
    ArtistDetails,
  },
})
export default class HomeView extends Mixins(GlobalMixin) {
  // This gets called before the page is loaded
  // It is calling API to display all artists for logged in user
  // if there are artists displays them, if no artists
  // displays message
  async beforeMount() {
    await this.getAllArtists();
    if (this.artists.length) {
      this.bHideArtists = false;
      this.bHideNoArtists = true;
    }
  }

  // Stores all artists displayed on page
  artists: ArtistInfo[] = [new ArtistInfo()];

  // Stores all albums that are being displayed for current artist
  albums: AlbumInfo[] = [new AlbumInfo()];

  // Are albums being shown or not
  bHideAlbums = true;

  // are artists being shown or not
  bHideArtists = true;

  // is no artist error message being shown or not
  bHideNoArtists = false;

  // current artist displaying albums
  currentArtist = -1;

  // current artist that is being considered for deletion
  deleteArtistID = -1;

  // is the artist delete confirmation modal being shown
  artistDeleteShow = false;

  deleteAlbumID = -1;

  albumDeleteShow = false;

  // calls API to get all artists for logged in user
  async getAllArtists() {
    const id = store.getters.username;
    const response = await this.callAPI(`${this.ARTIST_INFO_API}/${id}`);
    this.artists = response;
  }

  async redirectSearch() {
    await this.$router.push('/search');
  }

  // calls API to get all albums for selected artist
  async getAllAlbums(artistID: number) {
    this.currentArtist = artistID;
    this.albums = await this.callAPI(`${this.ALBUM_INFO_API}/${artistID}`);
    this.albums.sort((a, b) => {
      if (a.releaseDate && b.releaseDate) {
        return b.releaseDate - a.releaseDate;
      }
      return 1;
    });
    this.bHideAlbums = false;
  }

  // calls API to change artist rating
  async changeArtistRating(artistID: number, newRating: number) {
    await this.callAPI(`${this.ARTIST_INFO_API}/${artistID}`, 'PUT', {
      accountID: store.getters.username,
      rating: newRating,
    });
  }

  // calls API to change album rating
  async changeAlbumRating(albumID: number, newRating: number) {
    await this.callAPI(`${this.ALBUM_INFO_API}/${albumID}`, 'PUT', {
      accountID: store.getters.username,
      rating: newRating,
    });
  }

  // EMIT calls this to show the modal
  async deleteArtistModal(artistID: number) {
    this.deleteArtistID = artistID;
    this.artistDeleteShow = true;
  }

  // Artist Delete modal calls this on the confirm button
  async deleteArtistConfirmed() {
    this.artistDeleteShow = false;
    await this.deleteArtist(this.deleteArtistID);
  }

  // deleteArtistConfirmed calls this
  async deleteArtist(artistID: number) {
    // Deleting all albums associated with this artist
    await this.callAPI(`${this.ALBUM_INFO_API}/artist-${artistID}`, 'DELETE', { accountID: store.getters.username });
    // Deleting artist
    await this.callAPI(`${this.ARTIST_INFO_API}/${artistID}`, 'DELETE', { accountID: store.getters.username });
    // reloading the page information
    await this.getAllArtists();
    if (!this.artists.length) {
      this.bHideArtists = true;
      this.bHideNoArtists = false;
    }
    this.bHideAlbums = true;
  }

  // Emit albumDelete calls this to show the modal
  deleteAlbumModal(albumID: number) {
    this.deleteAlbumID = albumID;
    this.albumDeleteShow = true;
  }

  // album delete modal Confirm button calls this
  async deleteAlbumConfirmed() {
    this.albumDeleteShow = false;
    await this.deleteAlbum(this.deleteAlbumID);
  }

  // deleteAlbumConfirmed calls this
  async deleteAlbum(albumID: number) {
    await this.callAPI(`${this.ALBUM_INFO_API}/${albumID}`, 'DELETE', { accountID: store.getters.username });
    await this.getAllAlbums(this.currentArtist);
  }
}
</script>

<style scoped>

</style>
