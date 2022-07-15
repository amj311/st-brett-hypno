Vue.component('recentblogs',{
    template: /*html*/`

    <div id="RecentBlogsVueWrapper">
        <div v-html="stylesheet"></div>
        
        <div v-if="loading" class="strb-loading">Loading...</div>
        <div v-else class="strb-main">
            <button v-on:click="loadFiles">Load</button>

            <div v-for="file in files" class="strb-blog-wrapper">
                <div>{{file.name}}</div>
                <audio controls="controls">
                    <source :src="'https://docs.google.com/uc?export=download&id='+file.id">
                </audio>
            </div>    
        </div>
    </div>`,

    data: function() {
        return {
            files: [],
            loading: true,
            
            stylesheet: /*html*/`
            <style>
            </style>
            `
        }
    },

    props: ["config"],

    mounted() {
        this.loading = true;

        var script = document.createElement('script');
        script.src = 'https://apis.google.com/js/api.js';
        
        script.onload = async () => {
            console.log(gapi)
            const object = {
                "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCj5mLIWpJd/Gex\nJT9va5YzLSfWTHzDvHM3jrQCo+KkY9K7ceJtuRxL9zytKQ7xiD883uJB25kmTPge\nfK9FT6Rz7FQN7260oRUEWllVa4qwiq45njx8WI1ApIxaoP0ayybIjUDQhMU4trVX\nea08SBmdlpZPvMrDGDKJSN/tZHd12FV4ySl1qY58dxXmpKXlSzGRtSYgU99+hGLa\nPIN8nA26B/4IcQ+sLg60ZKt3vSE2CHtwc5x+6KpOKxP1kk0I+Ed3PN64Qu9W1hOh\ntzOT/KEE9uEXPDlxcFG16L/6fKcuuyDpo6J/EXDBHGWFw8Tuq3vRowu1EAtP2w0K\najR/d/bpAgMBAAECggEAEl7f/ZhL8DrlSHFmAyVqSBbXRel8JoL4ixFJ/e3D7oG9\n0gK5dWuaegKei24fCFV+zmImYWlYE3dBwZu0wtkNaWzjcvho+S1WP2RSalpLyO6S\nXqTsyfyG6z2bpGDdCGQdgbx2DP6EuI70vnbwmDbLSuLhECjstSIA2sBkplAXel7K\nMNSASWvyCmXo4Z2FkeA4OUbkxwVrD+++/FGF3BjAur67/R4XkjwZSJQ10+AJ3/Un\n/YG4vdMal/T+hNK0QHvZmdPxWL/hxg4y1LBsMNnrVtFZVNgXsPv7Jz1VjC2Bdo+Q\nZgclVIlSZrWTk2kmuR55WlgXErj6Pp7cXfFovyaKnQKBgQDQV+iA9pZvvz3q5+lg\nxa9lcv+tXS7xhZmNvlJSdJZnioC+Y7pYCzrYWi/mrw4rlm2YA2Qs1KKYY4vVglh/\ni8von9rC8NYjjvY0WehfnpNWsFSk0pjxvTZJTRX7pydprw9P2UHuIGmyEJeCYFxC\nRDvevvYT+wTQ/r0dvY5Y3PBgSwKBgQDJY/m5JV+CASv/EK1VwauviXCvxVszUvRT\nfHq4zH/UUmuz6ObVWzzDfBwsXkE2YDMGLwZdzXpjo4So4NKhjC2/+xj/a+NW0CiE\nI4gHECk3iDkq6t8WjPA58pH8vgIoV5eX2o21T2ciX1drs80hNuNe0yC2/iDZDTOH\n59u6t24NGwKBgQCjMejOc9kcyTlv8p6tDcw49B5wJsipqRPBoq4LJoXVrvjvqWCC\nrLE4XVSeJss7u0Y3R5jFQP3nzjnvUX2O0uszWVvbTRj/m3EhSrephqY0xkRXIxto\nZ+TJABfTGnjV4Klmy3BIXZ1NPI/hMSezRI19CinpNrvsFU3/qMaCtvWXBwKBgDDc\n1fFLFRI48JDRXg0JkXtksHelPcyFGwzKjggabgV4/fLH1oH7whF4ImnNcKsdyiN8\n82F9Am38dap36gMSPONwrA8FAULF/J6a9F0qWaXEooI8PGZ/SaX1qeAVxfY90mUg\nvPM50b8wPMi/9kxRwfb26OAdZqDjKBaYdeKmsMfzAoGBAIw0wjMgQSbYKUOrIUI+\nISXQAhmvkcWPm8dYA3MfwgNKil3leW4B/5LUYyUYJ0GBjHMKHo7QeDX0j5Tq8Fua\npE6jk1gly34wIpm7y+DqKrgWBpk1i/tQj9UdpE64+lSLO7XZ5I2/lbbkbFwD0XZc\n0fJExhVvK9qCxXAh1lqaIc7U\n-----END PRIVATE KEY-----\n",
                "client_email": "apexeffectserviceaccount@apexeffecttools.iam.gserviceaccount.com",
                scopes: ["https://www.googleapis.com/auth/drive.readonly"],
            };
            
            await gapi.load("client", async () => {
                let token = await GetAccessTokenFromServiceAccount.do(object);
                gapi.auth.setToken(token)
            });

            setTimeout(this.loadFiles, 100);
        };
        
        document.head.appendChild(script);
    },

    methods: {
        async loadFiles() {
            this.loading = true;
            
            // Generate a list of past months in 'YYYY-MM' format
            let now = new Date();
            let year = 2021, month = 0;
            let dates = [];
            while (year <= now.getFullYear()) {
                // Months are 0-11
                while(year < now.getFullYear() || month <= now.getMonth()) {
                    dates.push(year+'-'+(month+1 < 10 ? "0"+(month+1) : month+1));
                    month++;
                    if (month > 11) {
                        month = 0;
                        break;
                    }
                }
                year++;
            }

            await gapi.client.init({
                discoveryDocs: [
                  "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
                ],
            });

            // Gather all folders with names matching the past months
            let {body: foldersBody} = await gapi.client.drive.files.list({
                supportsAllDrives: true,
                includeItemsFromAllDrives: true,
                fields: "files(name, id, mimeType)",
                q: `
                    trashed = false
                    and '1dX3CXTv9ao0fqeJ9UKBevN0NjsgSj2lv' in parents
                    and (
                        ${dates.map(d => `name = '${d}'`).join(' or ')}
                    )
                    and mimeType = 'application/vnd.google-apps.folder'
                `
            });
            
            
            // Gather mp3 files from the selected folders
            let parentConditions = JSON.parse(foldersBody).files.map(f => `'${f.id}' in parents`);

            let {body: filesBody} = await gapi.client.drive.files.list({
                supportsAllDrives: true,
                includeItemsFromAllDrives: true,
                fields: "files(name, id, mimeType)",
                q: `
                    trashed = false
                    and mimeType = 'audio/mpeg'
                    and (
                        ${parentConditions.join(' or ')}
                    )
                `
            });

            let files = JSON.parse(filesBody).files.map(f => ({
                ...f,
                ...parseFileNameData(f.name)
            }));
            console.log(files);

            // new Audio('https://docs.google.com/uc?export=download&id='+files[0].id).play();

            this.files = files;



            var base = new Airtable({apiKey: 'keyWlfTT0lwKTeuQV'}).base('app412fK8ppzF15Y2');
            console.log(base)
            base('Tracks').select({
                // Selecting the first 3 records in Grid view:
                maxRecords: 3,
                view: "Grid view"
            }).eachPage(function page(records, fetchNextPage) {
                // This function (`page`) will get called for each page of records.
            
                records.forEach(function(record) {
                    console.log('Retrieved', record);
                });
            
                // To fetch the next page of records, call `fetchNextPage`.
                // If there are more records, `page` will get called again.
                // If there are no more records, `done` will get called.
                fetchNextPage();
            
            }, function done(err) {
                if (err) { console.error(err); return; }
            });
            this.loading = false;
        },
    }
});

function insertRecentBlogs(elId,config,version="latest") {
    let anchorEl = document.getElementById(elId);
    let html = /*html*/`
        <div id="RecentBlogInsert"><recentblogs :config="config"></recentblogs></div>
    `
    anchorEl.outerHTML = html;
    new Vue({el:"#RecentBlogInsert",data:{config}});
}

str = "My Hypnosis File:::category=peace of mind:::tags=peace,calm,rest.mp3";

function parseFileNameData(filename) {
    // Every portion of the name is separated by :::, the first always being the name.
    // eg My Hypnosis File:::category=peace of mind:::tags=peace,calm,rest.mp3";
    let parts = filename.replace(/(.mp3)?(.mp4)?(.wav)?/gi, '').split(":::");

    let data = {
        name: parts.shift(),
        filename,
    }

    // All parts other than the name are key-value pairs.
    // The key is everything up to the first '='
    for (let part of parts) {
        let [, key, value] = /^([a-z]+)=(.+)/gi.exec(part)

        // Parse special cases like CSV values
        switch (key) {
            case 'tags':
                value = value.split(',');
                break;
        }
        data[key] = value;
    }
    return data;
}


console.log(parseFileNameData(str))

// This is a Javascript library to retrieve the access token from the Google Service Account.
// https://github.com/tanaikech/GetAccessTokenFromServiceAccount_js
document.write(
    '<script src="https://cdnjs.cloudflare.com/ajax/libs/jsencrypt/3.0.0-rc.1/jsencrypt.min.js"></script>'
);
document.write(
    '<script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.0.0/crypto-js.min.js"></script>'
);

document.write(
    '<script src="https://cdn.jsdelivr.net/npm/airtable@0.11.4/lib/airtable.umd.min.js"></script>'
);


const GetAccessTokenFromServiceAccount = (function () {
const _url = "https://www.googleapis.com/oauth2/v4/token";
const _grant_type = "urn:ietf:params:oauth:grant-type:jwt-bearer";

function _main(_obj) {
    return new Promise((resolve, reject) => {
    const { private_key, client_email, scopes } = _obj;
    if (!private_key || !client_email || !scopes) {
        throw new Error(
        "No required values. Please set 'private_key', 'client_email' and 'scopes'"
        );
    }
    const header = { alg: "RS256", typ: "JWT" };
    const now = Math.floor(Date.now() / 1000);
    const claim = {
        iss: client_email,
        scope: scopes.join(" "),
        aud: _url,
        exp: (now + 3600).toString(),
        iat: now.toString(),
    };
    if (_obj.userEmail) {
        claim.sub = _obj.userEmail;
    }
    const signature =
        btoa(JSON.stringify(header)) + "." + btoa(JSON.stringify(claim));
    const sign = new JSEncrypt();
    sign.setPrivateKey(private_key);
    const jwt =
        signature + "." + sign.sign(signature, CryptoJS.SHA256, "sha256");
    const params = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
        assertion: jwt,
        grant_type: _grant_type,
        }),
    };
    fetch(_url, params)
        .then((res) => res.json())
        .then((res) => resolve(res))
        .catch((err) => reject(err));
    });
}

return { do: _main };
})();