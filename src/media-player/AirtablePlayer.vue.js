const TrackPlayer = require('./TrackPlayer.vue');
const TrackBrowser = require('./TrackBrowser.vue');

Vue.component('airtableplayer',{
    components: {TrackPlayer, TrackBrowser},
    template: /*html*/`

    <div id="AirtablePlayerVueWrapper">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
        <div v-html="stylesheet"></div>
       
        <TrackBrowser v-show="mode === 'browse'" @playTrack="playTrack"  />
        
        <TrackPlayer v-show="mode === 'play'" :track="activeTrack" :autostart="true" @close="closePlayer" />
    </div>`,

    props: ["config"],
    
    data: function() {
        return {
            mode: 'browse',
            activeTrack: null,
            
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
                    background: #fff;
                    font-family: sans-serif;
                }
            </style>
            `
        }
    },

    beforeMount() {
        this.$root.config = this.config;
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

module.exports = function insertAirtablePlayer(elId,config = {msg: "hello"}) {
    let anchorEl = document.getElementById(elId);
    if (!anchorEl) return;

    let html = /*html*/`
        <div id="AirtablePlayerInsert"><AirtablePlayer :config="config"></AirtablePlayer></div>
    `
    anchorEl.outerHTML = html;
    new Vue({el:"#AirtablePlayerInsert", data:{config}});
}
