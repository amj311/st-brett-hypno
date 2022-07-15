var AirtableDriveUtils;(()=>{var e={104:(e,t,s)=>{const i=s(306);Vue.component("airtableplayer",{template:'\n\n    <div id="AirtablePlayerVueWrapper">\n        <div v-html="stylesheet"></div>\n        \n        <div v-if="loading">Loading...</div>\n        <div v-else>\n            <div v-for="track in tracks">\n                <div>{{track.name}}</div>\n                <audio controls="controls">\n                    <source :src="\'https://docs.google.com/uc?export=download&id=\'+track.drive_id">\n                </audio>\n            </div>    \n        </div>\n    </div>',data:function(){return{tracks:[],loading:!0,stylesheet:"\n            <style>\n            </style>\n            "}},props:["config"],async mounted(){this.loading=!0,this.tracks=(await i.getReleasedTracks()).map((e=>({...e.fields,id:e.id,name:e.fields.display_name||e.fields.file_name.replace(/(.mp3)?(.mp4)?(.wav)?/gi,"")}))),this.loading=!1},methods:{}}),e.exports=function(e,t){let s=document.getElementById(e);s&&(s.outerHTML='\n        <div id="AirtablePlayerInsert"><AirtablePlayer :config="config"></AirtablePlayer></div>\n    ',new Vue({el:"#AirtablePlayerInsert",data:{config:t}}))}},873:(e,t,s)=>{const i=s(306);Vue.component("airtablesync",{template:'\n\n    <div id="AirtableSyncVueWrapper">\n        <div v-html="stylesheet"></div>\n        \n        <div v-if="loading">Loading ...</div>\n        <div v-else>\n            <div v-if="!syncing">\n                <button v-on:click="syncFiles">sync</button>\n            </div>\n            <div class="strb-syncing">{{syncStatus}}</div>\n            <div v-for="msg in errorMessages">⚠ {{msg}}</div>\n\n        </div>\n    </div>',data:function(){return{loading:!0,syncing:!1,syncStatus:"",syncError:null,errorMessages:[],newFiles:[],updatedFiles:[],deletedFiles:[],stylesheet:"\n            <style>\n            </style>\n            "}},props:["config"],mounted(){this.loading=!0;var e=document.createElement("script");e.src="https://apis.google.com/js/api.js",e.onload=async()=>{const e={private_key:"-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCj5mLIWpJd/Gex\nJT9va5YzLSfWTHzDvHM3jrQCo+KkY9K7ceJtuRxL9zytKQ7xiD883uJB25kmTPge\nfK9FT6Rz7FQN7260oRUEWllVa4qwiq45njx8WI1ApIxaoP0ayybIjUDQhMU4trVX\nea08SBmdlpZPvMrDGDKJSN/tZHd12FV4ySl1qY58dxXmpKXlSzGRtSYgU99+hGLa\nPIN8nA26B/4IcQ+sLg60ZKt3vSE2CHtwc5x+6KpOKxP1kk0I+Ed3PN64Qu9W1hOh\ntzOT/KEE9uEXPDlxcFG16L/6fKcuuyDpo6J/EXDBHGWFw8Tuq3vRowu1EAtP2w0K\najR/d/bpAgMBAAECggEAEl7f/ZhL8DrlSHFmAyVqSBbXRel8JoL4ixFJ/e3D7oG9\n0gK5dWuaegKei24fCFV+zmImYWlYE3dBwZu0wtkNaWzjcvho+S1WP2RSalpLyO6S\nXqTsyfyG6z2bpGDdCGQdgbx2DP6EuI70vnbwmDbLSuLhECjstSIA2sBkplAXel7K\nMNSASWvyCmXo4Z2FkeA4OUbkxwVrD+++/FGF3BjAur67/R4XkjwZSJQ10+AJ3/Un\n/YG4vdMal/T+hNK0QHvZmdPxWL/hxg4y1LBsMNnrVtFZVNgXsPv7Jz1VjC2Bdo+Q\nZgclVIlSZrWTk2kmuR55WlgXErj6Pp7cXfFovyaKnQKBgQDQV+iA9pZvvz3q5+lg\nxa9lcv+tXS7xhZmNvlJSdJZnioC+Y7pYCzrYWi/mrw4rlm2YA2Qs1KKYY4vVglh/\ni8von9rC8NYjjvY0WehfnpNWsFSk0pjxvTZJTRX7pydprw9P2UHuIGmyEJeCYFxC\nRDvevvYT+wTQ/r0dvY5Y3PBgSwKBgQDJY/m5JV+CASv/EK1VwauviXCvxVszUvRT\nfHq4zH/UUmuz6ObVWzzDfBwsXkE2YDMGLwZdzXpjo4So4NKhjC2/+xj/a+NW0CiE\nI4gHECk3iDkq6t8WjPA58pH8vgIoV5eX2o21T2ciX1drs80hNuNe0yC2/iDZDTOH\n59u6t24NGwKBgQCjMejOc9kcyTlv8p6tDcw49B5wJsipqRPBoq4LJoXVrvjvqWCC\nrLE4XVSeJss7u0Y3R5jFQP3nzjnvUX2O0uszWVvbTRj/m3EhSrephqY0xkRXIxto\nZ+TJABfTGnjV4Klmy3BIXZ1NPI/hMSezRI19CinpNrvsFU3/qMaCtvWXBwKBgDDc\n1fFLFRI48JDRXg0JkXtksHelPcyFGwzKjggabgV4/fLH1oH7whF4ImnNcKsdyiN8\n82F9Am38dap36gMSPONwrA8FAULF/J6a9F0qWaXEooI8PGZ/SaX1qeAVxfY90mUg\nvPM50b8wPMi/9kxRwfb26OAdZqDjKBaYdeKmsMfzAoGBAIw0wjMgQSbYKUOrIUI+\nISXQAhmvkcWPm8dYA3MfwgNKil3leW4B/5LUYyUYJ0GBjHMKHo7QeDX0j5Tq8Fua\npE6jk1gly34wIpm7y+DqKrgWBpk1i/tQj9UdpE64+lSLO7XZ5I2/lbbkbFwD0XZc\n0fJExhVvK9qCxXAh1lqaIc7U\n-----END PRIVATE KEY-----\n",client_email:"apexeffectserviceaccount@apexeffecttools.iam.gserviceaccount.com",scopes:["https://www.googleapis.com/auth/drive.readonly"]};await gapi.load("client",(async()=>{let t=await a.do(e);gapi.auth.setToken(t)})),this.loading=!1},document.head.appendChild(e)},methods:{async syncFiles(){this.syncing=!0,this.syncError=null,this.errorMessages=[],this.newFiles=[],this.updatedFiles=[],this.deletedFiles=[],this.restoredFiles=[];try{this.syncStatus="Scanning...";try{const e=await i.getLastSync();let t=new Map((await this.loadDriveFiles()).map((e=>[e.id,e]))),s=new Map((await i.getAllTracks()).map((e=>[e.fields.drive_id,e])));for(let i of t.values()){let t=s.get(i.id);t?(t._notDeleted=!0,i.tableFileId=t.id,t.fields.deleted_from_drive&&(t.fields.deleted_from_drive=!1,this.updatedFiles.push(i)),(!e||e.date<i.modifiedTime)&&this.updatedFiles.push(i)):this.newFiles.push(i)}for(let e of s.values())e.deleted_from_drive||e._notDeleted||this.deletedFiles.push(e)}catch(e){throw this.errorMessages.push("Error while loading files."),{stage:"Loading",error:e}}if(0===this.newFiles.length&&0===this.updatedFiles.length&&0===this.deletedFiles.length)return this.syncStatus="Nothing to sync.",void(this.syncing=!1);this.syncStatus="Saving to Airtable...";try{let[e,t,s]=await Promise.all([i.saveNewTracks(this.newFiles),i.saveUpdatedTracks(this.updatedFiles),i.saveDeletedTracks(this.deletedFiles)]);for(let t of e){let e=this.newFiles.find((e=>e.id===t.fields.drive_id));e&&(e.successMatch=t)}for(let e of t){console.log(e.fields);let t=this.updatedFiles.find((t=>t.id===e.fields.drive_id));t&&(t.successMatch=e)}for(let e of s){let t=this.deletedFiles.find((t=>t.fields.drive_id===e.fields.drive_id));t&&(t.successMatch=e)}console.log(this.newFiles,this.updatedFiles,this.deletedFiles)}catch(e){throw this.errorMessages.push("Error while saving to Airtable."),{stage:"Saving",error:e}}try{await i.saveSyncReport(this.newFiles.filter((e=>e.successMatch)).map((e=>e.successMatch.id)),this.updatedFiles.filter((e=>e.successMatch)).map((e=>e.successMatch.id)),this.deletedFiles.filter((e=>e.successMatch)).map((e=>e.successMatch.id)),this.syncError)}catch(e){console.log(e),this.errorMessages.push("Error while saving sync record.")}}catch(e){this.syncError=e,this.syncError.failed={new:this.newFiles.filter((e=>!e.successMatch)).map((e=>e)),update:this.updatedFiles.filter((e=>!e.successMatch)).map((e=>e)),delete:this.deletedFiles.filter((e=>!e.successMatch)).map((e=>e))},console.log(this.syncError)}this.syncing=!1,this.syncStatus=this.syncError?"Failed.":"Complete!"},async loadDriveFiles(){await gapi.client.init({discoveryDocs:["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"]});let{body:e}=await gapi.client.drive.files.list({supportsAllDrives:!0,includeItemsFromAllDrives:!0,fields:"files(name, id, mimeType)",q:"\n                    '1dX3CXTv9ao0fqeJ9UKBevN0NjsgSj2lv' in parents\n                    and mimeType = 'application/vnd.google-apps.folder'\n                "});const t=new Map(JSON.parse(e).files.map((e=>[e.id,e])));let s=Array.from(t.values()).map((e=>`'${e.id}' in parents`)),{body:i}=await gapi.client.drive.files.list({supportsAllDrives:!0,includeItemsFromAllDrives:!0,fields:"files(name, id, modifiedTime, parents)",q:`\n                    mimeType = 'audio/mpeg'\n                    and (\n                        ${s.join(" or ")}\n                    )\n                `});return JSON.parse(i).files.map((e=>({...e,parentName:t.get(e.parents[0]).name})))}}}),e.exports=function(e,t){let s=document.getElementById(e);s&&(s.outerHTML='\n        <div id="RecentBlogInsert"><AirtableSync :config="config"></AirtableSync></div>\n    ',new Vue({el:"#RecentBlogInsert",data:{config:t}}))},document.write('<script src="https://cdnjs.cloudflare.com/ajax/libs/jsencrypt/3.0.0-rc.1/jsencrypt.min.js"><\/script>'),document.write('<script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.0.0/crypto-js.min.js"><\/script>');const a=function(){const e="https://www.googleapis.com/oauth2/v4/token";return{do:function(t){return new Promise(((s,i)=>{const{private_key:a,client_email:n,scopes:r}=t;if(!a||!n||!r)throw new Error("No required values. Please set 'private_key', 'client_email' and 'scopes'");const l=Math.floor(Date.now()/1e3),d={iss:n,scope:r.join(" "),aud:e,exp:(l+3600).toString(),iat:l.toString()};t.userEmail&&(d.sub=t.userEmail);const c=btoa(JSON.stringify({alg:"RS256",typ:"JWT"}))+"."+btoa(JSON.stringify(d)),o=new JSEncrypt;o.setPrivateKey(a);const p=c+"."+o.sign(c,CryptoJS.SHA256,"sha256"),h={method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({assertion:p,grant_type:"urn:ietf:params:oauth:grant-type:jwt-bearer"})};fetch(e,h).then((e=>e.json())).then((e=>s(e))).catch((e=>i(e)))}))}}}()},138:(e,t,s)=>{e.exports={insertAirtableSync:s(873),insertAirtablePlayer:s(104)}},306:e=>{document.write('<script src="https://cdn.jsdelivr.net/npm/airtable@0.11.4/lib/airtable.umd.min.js"><\/script>');const t="tblreK8W3yna7ZTXc",s="tblwc72Sfv7RRwF2Q";e.exports=new class{constructor(){this.isInitialized=!1}_init(){return this._base=new Airtable({apiKey:"keyT4FekiPOQY8HZw"}).base("app412fK8ppzF15Y2"),this.isInitialized=!0,this._base}get base(){return this._base??this._init()}async getLastSync(){return(await this.base(s).select({maxRecords:1,view:"Grid view"}).all())[0]?.fields}async saveSyncReport(e,t,i){return console.log(e,t,i),await this.base(s).create({date:Date.now(),created:e,updated:t,deleted:i})}async getAllTracks(){return await this.base(t).select({view:"All Tracks"}).all()}async getReleasedTracks(){return await this.base(t).select({view:"Released"}).all()}async saveNewTracks(e){return await this.batchOperation(e,(async e=>await this.base(t).create(e.map((e=>this.prepareTrackObject(e))))))}async saveUpdatedTracks(e){return await this.batchOperation(e,(async e=>await this.base(t).update(e.map((e=>this.prepareTrackObject(e))))))}async saveDeletedTracks(e){return await this.batchOperation(e,(async e=>await this.base(t).update(e.map((e=>({id:e.id,fields:{deleted_from_drive:!0}}))))))}async batchOperation(e,t){if(0===e.length)return[];e=[...e];let s=[];for(;e.length>0;)s.push(e.splice(0,10));return(await Promise.all(s.map(t))).flat(1)}prepareTrackObject(e){return{id:e.tableFileId,fields:{file_name:e.name,drive_id:e.id,release_date:e.parentName?.match(/\d{4}-(0[1-9]|1[0-2])/g)?e.parentName:null,deleted_from_drive:e.deleted_from_drive??!1}}}}}},t={},s=function s(i){var a=t[i];if(void 0!==a)return a.exports;var n=t[i]={exports:{}};return e[i](n,n.exports,s),n.exports}(138);AirtableDriveUtils=s})();