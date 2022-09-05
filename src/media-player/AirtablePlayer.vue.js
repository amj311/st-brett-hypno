const TrackPlayer = require('./TrackPlayer.vue');
const TrackBrowser = require('./TrackBrowser.vue');

Vue.component('airtableplayer',{
    components: {TrackPlayer, TrackBrowser},
    template: /*html*/`

    <div id="AirtablePlayerVueWrapper">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
        <div v-html="stylesheet"></div>
       
        <div class="welcome">
            <h1>{{greeting}}</h1>
        </div>

        <div class="content">
            <TrackBrowser v-show="mode === 'browse'" @playTrack="playTrack"  />
            <TrackPlayer v-show="mode === 'play'" :track="activeTrack" :autostart="true" @close="closePlayer" />
        </div>
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
                    box-sizing: border-box;
                    background: #fff;
                    font-family: sans-serif;
                    overflow-y: auto;
                    padding: 1em;

                    background: linear-gradient(138deg, #7bd5f5, #787ff6, #4adede, #1ca7ec, #1f2f98, #7bd5f5);
                    background-size: 1200% 1200%;

                    -webkit-animation: AnimationName 120s linear infinite;
                    -moz-animation: AnimationName 120s linear infinite;
                    animation: AnimationName 120s linear infinite;
                }

                @-webkit-keyframes AnimationName {
                    0%{background-position:0% 4%}
                    50%{background-position:100% 97%}
                    100%{background-position:0% 4%}
                }
                @-moz-keyframes AnimationName {
                    0%{background-position:0% 4%}
                    50%{background-position:100% 97%}
                    100%{background-position:0% 4%}
                }
                @keyframes AnimationName {
                    0%{background-position:0% 4%}
                    50%{background-position:100% 97%}
                    100%{background-position:0% 4%}
                }


                .welcome {
                    padding: 0 1em 1em 1em;
                    color: #fff;
                }

                .content {
                    background: #fff;
                    box-shadow: 0 0 1em #00000044;
                    border-radius: 1em;
                    padding: 1em;
                    display: flex;
                    min-height: 30em;
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
    },

    computed: {
        greeting() {
            let time;
            let hours = new Date().getHours();
            if (hours < 12) time = 'Morning';
            else if (hours < 17) time = 'Afternoon';
            else if (hours < 24) time = 'Evening';

            return "Good " + time + (this.config.name ? ", "+this.config.name : "");
        }
    }
});

module.exports = function insertAirtablePlayer(elId, config = {}) {
    let anchorEl = document.getElementById(elId);
    if (!anchorEl) return;

    for (let {name, value} of anchorEl.attributes) {
        if (name.startsWith(":")) {
            config[name.substring(1, name.length)] = value;
        }
    }

    let html = /*html*/`
        <div id="AirtablePlayerInsert"><AirtablePlayer :config="config"></AirtablePlayer></div>
    `
    anchorEl.outerHTML = html;
    new Vue({el:"#AirtablePlayerInsert", data:{config}});
}
