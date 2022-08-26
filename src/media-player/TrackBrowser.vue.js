const AirtableService = require("../services/AirtableService");
const TrackList = require("./TrackList.vue");

const TrackBrowser = Vue.component('trackbrowser',{
    components: {TrackList},
    template: /*html*/`

    <div id="browser-wrapper">
        <div v-html="stylesheet"></div>

        <h3>New Releases</h3>
        <TrackList :tracks="latestTracks" @playTrack="playTrack"  />

        <h3>Categories</h3>
        <div id="categories-wrapper">
            <div v-for="category in categoriesList" class="cat-item-container">
                <div class="cat-item" @click="openList(category.tracks, category.name)">
                    <div class="thumb"><i :class="[category.icon_class]"></i></div>
                    <div class="title">{{category.name}}</div>
                </div>
            </div>
        </div>

        <div v-if="activeList" id="active-list-wrapper">
            <div @click="activeList = null;" class="list-closer"><i class="fa fa-arrow-left"></i> Go back</div>
            <br/>
            <TrackList :title="activeList.title" :tracks="activeList.tracks" @playTrack="playTrack"  />
        </div>
        
    </div>`,

    props: [],
    
    data: function() {
        return {
            loading: false,
            tracks: new Map(),
            categories: new Map(),

            activeList: null,
            
            stylesheet: /*html*/`
            <style>
                #browser-wrapper {
                    width: 100%;
                    padding: 1em;
                    display: flex;
                    flex-direction: column;
                }
                #categories-wrapper {
                    display: flex;
                    flex-direction: row;
                    flex-wrap: wrap;
                    justify-content: left;
                }
                .cat-item-container {
                    display: grid;
                    width: 100px;
                    margin: 0 1em 1em 0;
                }
                .cat-item {
                    place-self: top center;
                    user-select: none;
                    cursor: pointer;
                }
                .cat-item .thumb {
                    width: 100px;
                    height: 100px;
                    background: linear-gradient(325deg, #787ff6, #4adede);
                    border-radius: .5em;
                    margin-bottom: .3em;
                    display: flex;
                    place-content: center;
                    place-items: center;
                }
                .cat-item .thumb i.fa {
                    font-size: 2em;
                    color: #fff
                }

                #active-list-wrapper {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: #fff;
                    padding: 1em;
                }
                .list-closer {
                    cursor: pointer;
                    user-select: none;
                }
            </style>
            `
        }
    },

    async beforeMount() {
        this.loading = true;

        let categories = new Map((await AirtableService.getAllCategories()).map(c => [c.id, {
            ...c.fields,
            icon_class: 'fa fa-'+c.fields.icon_name,
        }]));

        let tracks = new Map((await AirtableService.getReleasedTracks()).map(t => [t.id, {
            ...t.fields,
            id: t.id,
            name: t.fields.display_name || t.fields.file_name.replace(/(.mp3)?(.mp4)?(.wav)?/gi, ''),
            category: t.fields.category ? categories.get(t.fields.category[0]) : null
        }]));

        for (let category of categories.values()) {
            category.tracks = category.tracks?.map(id => {
                return tracks.get(id)
            });
        };

        this.categories = categories;
        this.tracks = tracks;

        this.loading = false;
    },

    methods: {
        playTrack(track) {
            this.$emit('playTrack', track)    
        },

        openList(tracks, title) {
            this.activeList = {tracks, title};
        }
    },

    computed: {
        categoriesList() {
            return Array.from(this.categories.values());
        },

        tracksList() {
            return Array.from(this.tracks.values()).sort((a,b)=>a.release_date < b.release_date ? -1 : 1);
        },

        latestTracks() {
            let date = new Date();
            let month = date.getMonth() + 1;
            let yearMonth = `${date.getFullYear()}-${(month < 10 ? "0" : "") + month}`;

            let tracks = [];

            if (this.tracksList.length === 0) {
                return [];
            }

            // This logic gleans the most recent portion of the tracksList from this month.
            // Requires a sorted list to work reliably.
            let i = this.tracksList.length-1;
            while(this.tracksList[i].release_date >= yearMonth) {
                tracks.push(this.tracksList[i]);
                i--;
            }
            return tracks;
        }
    }
});

module.exports = TrackBrowser;