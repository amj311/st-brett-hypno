const AirtableService = require("../services/AirtableService");
const TrackPlayer = require('./TrackPlayer.vue');

Vue.component('airtableplayer',{
    components: {TrackPlayer},
    template: /*html*/`

    <div id="AirtablePlayerVueWrapper">
        <div v-html="stylesheet"></div>
       
        <div v-show="mode === 'browse'">
            <div v-for="track in tracks">
                <div>{{track.name}}</div>
                <button @click="playTrack(track)">Play</button>
            </div>
        </div>
        
        <TrackPlayer v-show="mode === 'play'" :track="activeTrack" :autostart="true" @close="closePlayer" />
    </div>`,

    props: ["config"],
    
    data: function() {
        return {
            mode: 'browse',
            tracks: [],
            activeTrack: null,
            loading: true,
            
            stylesheet: /*html*/`
            <style>
                #AirtablePlayerVueWrapper {
                    position: absolute;
                    top: 0;
                    left: 0;
                    height: 100%;
                    width: 100%;
                    display: flex;
                    box-sizing: border-box;
                    padding: 1em;
                }
            </style>
            `
        }
    },


    async mounted() {
        this.loading = true;
       
        this.tracks = (await AirtableService.getReleasedTracks()).map(t => ({
            ...t.fields,
            id: t.id,
            name: t.fields.display_name || t.fields.file_name.replace(/(.mp3)?(.mp4)?(.wav)?/gi, ''),
        }));

        this.loading = false;
    },

    methods: {
        playTrack(track) {
            this.activeTrack = track;
            this.mode = 'play';
        },
        closePlayer() {
            this.activeTrack = null;
            this.mode = 'browse';
        }
    }
});

module.exports = function insertAirtablePlayer(elId,config) {
    let anchorEl = document.getElementById(elId);
    if (!anchorEl) return;

    let html = /*html*/`
        <div id="AirtablePlayerInsert"><AirtablePlayer :config="config"></AirtablePlayer></div>
    `
    anchorEl.outerHTML = html;
    new Vue({el:"#AirtablePlayerInsert",data:{config}});
}
