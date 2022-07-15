const AirtableService = require("./services/AirtableService");


Vue.component('airtableplayer',{
    template: /*html*/`

    <div id="AirtablePlayerVueWrapper">
        <div v-html="stylesheet"></div>
        
        <div v-if="loading">Loading...</div>
        <div v-else>
            <div v-for="track in tracks">
                <div>{{track.name}}</div>
                <audio controls="controls">
                    <source :src="'https://docs.google.com/uc?export=download&id='+track.drive_id">
                </audio>
            </div>    
        </div>
    </div>`,

    data: function() {
        return {
            tracks: [],
            loading: true,
            
            stylesheet: /*html*/`
            <style>
            </style>
            `
        }
    },

    props: ["config"],

    async mounted() {
        this.loading = true;
       
        this.tracks = (await AirtableService.getAllTracks()).map(t => ({
            ...t.fields,
            id: t.id,
            name: t.fields.display_name || t.fields.file_name.replace(/(.mp3)?(.mp4)?(.wav)?/gi, ''),
        }));

        this.loading = false;
    },

    methods: {
    }
});

module.exports = function insertAirtableSync(elId,config) {
    let anchorEl = document.getElementById(elId);
    let html = /*html*/`
        <div id="AirtablePlayerInsert"><AirtablePlayer :config="config"></AirtablePlayer></div>
    `
    anchorEl.outerHTML = html;
    new Vue({el:"#AirtablePlayerInsert",data:{config}});
}
