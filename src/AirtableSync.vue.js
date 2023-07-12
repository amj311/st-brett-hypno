const AirtableService = require("./services/AirtableService");

Vue.component('airtablesync', {
	template: /*html*/`

    <div id="AirtableSyncVueWrapper">
        <div v-html="stylesheet"></div>
        <div class="header">
            <img id="gdriveLogo" src="https://pngimg.com/uploads/google_drive/google_drive_PNG14.png" />
            <img id="arrow" src="https://clipground.com/images/arrow-1.png" />
            <img id="airtableLogo" src="https://seeklogo.com/images/A/airtable-logo-216B9AF035-seeklogo.com.png" />
        </div>
        <h1>Hypnotherapy Sync Tool</h1>
        
        <div v-if="loading">Loading ...</div>
        <div v-else>
            <div v-if="!syncReady">
                <a v-on:click="prepareSync" id="syncButton">Sync</a>
            </div>
			<div v-else>
				<b>New Tracks</b>
				<table><tbody>
					<tr>
						<th>Track</th>
						<th>Airtable ID</th>
						<th>Action</th>
					</tr>
					<tr v-for="file in this.newFiles">
						<td>{{file.name}}</td>
						<td>{{file.tableFileId}}</td>
						<td>Create</td>
					</tr>
					<tr v-for="file in this.updatedFiles">
						<td>{{file.name}}</td>
						<td>{{file.tableFileId}}</td>
						<td>Update</td>
					</tr>
					<tr v-for="file in this.deletedFiles">
						<td>{{file.name}}</td>
						<td>{{file.tableFileId}}</td>
						<td>Delete</td>
					</tr>
					<tr v-for="file in this.deletedFiles">
						<td>{{file.name}}</td>
						<td>{{file.tableFileId}}</td>
						<td>Restore</td>
					</tr>
				</tbody></table>
			</div>
            <div class="status">{{syncStatus}}</div>
            <div v-for="msg in errorMessages" class="error">⚠ {{msg}}</div>
        </div>
    </div>`,

	data: function () {
		return {
			loading: true,
			syncing: false,
			syncStatus: "",
			syncReady: false,
			syncError: null,
			errorMessages: [],

			newFiles: [],
			updatedFiles: [],
			deletedFiles: [],
			restoredFiles: [],

			stylesheet: /*html*/`
            <style>
                body {
                    font-family: sans-serif;
                    text-align: center;
                }
                #AirtableSyncVueWrapper {
                    margin: 0 auto;
                    max-width: 40rem;
                }
                .header {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .header img {
                    width: 4em;
                }
                img#arrow {
                    width: 2em;
                    margin: 0 1em;
                }
                #syncButton {
                    display: block;
                    background: #00bbff;
                    color: #fff;
                    padding: .5em;
                    border-radius: .5em;
                    font-size: 1.25em;
                    width: fit-content;
                    margin: 1em auto;
                    user-select: none;
                    cursor: pointer;
                }

                .error {
                    background: #ff000022;
                    padding: 0.5em;
                    margin: 0.5em;
                }
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
			const object = {
				"private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCj5mLIWpJd/Gex\nJT9va5YzLSfWTHzDvHM3jrQCo+KkY9K7ceJtuRxL9zytKQ7xiD883uJB25kmTPge\nfK9FT6Rz7FQN7260oRUEWllVa4qwiq45njx8WI1ApIxaoP0ayybIjUDQhMU4trVX\nea08SBmdlpZPvMrDGDKJSN/tZHd12FV4ySl1qY58dxXmpKXlSzGRtSYgU99+hGLa\nPIN8nA26B/4IcQ+sLg60ZKt3vSE2CHtwc5x+6KpOKxP1kk0I+Ed3PN64Qu9W1hOh\ntzOT/KEE9uEXPDlxcFG16L/6fKcuuyDpo6J/EXDBHGWFw8Tuq3vRowu1EAtP2w0K\najR/d/bpAgMBAAECggEAEl7f/ZhL8DrlSHFmAyVqSBbXRel8JoL4ixFJ/e3D7oG9\n0gK5dWuaegKei24fCFV+zmImYWlYE3dBwZu0wtkNaWzjcvho+S1WP2RSalpLyO6S\nXqTsyfyG6z2bpGDdCGQdgbx2DP6EuI70vnbwmDbLSuLhECjstSIA2sBkplAXel7K\nMNSASWvyCmXo4Z2FkeA4OUbkxwVrD+++/FGF3BjAur67/R4XkjwZSJQ10+AJ3/Un\n/YG4vdMal/T+hNK0QHvZmdPxWL/hxg4y1LBsMNnrVtFZVNgXsPv7Jz1VjC2Bdo+Q\nZgclVIlSZrWTk2kmuR55WlgXErj6Pp7cXfFovyaKnQKBgQDQV+iA9pZvvz3q5+lg\nxa9lcv+tXS7xhZmNvlJSdJZnioC+Y7pYCzrYWi/mrw4rlm2YA2Qs1KKYY4vVglh/\ni8von9rC8NYjjvY0WehfnpNWsFSk0pjxvTZJTRX7pydprw9P2UHuIGmyEJeCYFxC\nRDvevvYT+wTQ/r0dvY5Y3PBgSwKBgQDJY/m5JV+CASv/EK1VwauviXCvxVszUvRT\nfHq4zH/UUmuz6ObVWzzDfBwsXkE2YDMGLwZdzXpjo4So4NKhjC2/+xj/a+NW0CiE\nI4gHECk3iDkq6t8WjPA58pH8vgIoV5eX2o21T2ciX1drs80hNuNe0yC2/iDZDTOH\n59u6t24NGwKBgQCjMejOc9kcyTlv8p6tDcw49B5wJsipqRPBoq4LJoXVrvjvqWCC\nrLE4XVSeJss7u0Y3R5jFQP3nzjnvUX2O0uszWVvbTRj/m3EhSrephqY0xkRXIxto\nZ+TJABfTGnjV4Klmy3BIXZ1NPI/hMSezRI19CinpNrvsFU3/qMaCtvWXBwKBgDDc\n1fFLFRI48JDRXg0JkXtksHelPcyFGwzKjggabgV4/fLH1oH7whF4ImnNcKsdyiN8\n82F9Am38dap36gMSPONwrA8FAULF/J6a9F0qWaXEooI8PGZ/SaX1qeAVxfY90mUg\nvPM50b8wPMi/9kxRwfb26OAdZqDjKBaYdeKmsMfzAoGBAIw0wjMgQSbYKUOrIUI+\nISXQAhmvkcWPm8dYA3MfwgNKil3leW4B/5LUYyUYJ0GBjHMKHo7QeDX0j5Tq8Fua\npE6jk1gly34wIpm7y+DqKrgWBpk1i/tQj9UdpE64+lSLO7XZ5I2/lbbkbFwD0XZc\n0fJExhVvK9qCxXAh1lqaIc7U\n-----END PRIVATE KEY-----\n",
				"client_email": "apexeffectserviceaccount@apexeffecttools.iam.gserviceaccount.com",
				scopes: ["https://www.googleapis.com/auth/drive.readonly"],
			};

			await gapi.load("client", async () => {
				let token = await GetAccessTokenFromServiceAccount.do(object);
				gapi.auth.setToken(token)
			});

			this.loading = false;
		};

		document.head.appendChild(script);
	},

	methods: {
		async prepareSync() {
			this.syncing = true;
			this.syncError = null;
			this.errorMessages = [];


			this.newFiles = [];
			this.updatedFiles = [];
			this.deletedFiles = [];
			this.restoredFiles = [];


			try {
				// Load data
				this.syncStatus = 'Scanning...';

				const lastSync = await AirtableService.getLastSync();
				let driveFiles = new Map((await this.loadDriveFiles()).map(f => [f.id, f]));
				let tableFiles = new Map((await AirtableService.getAllTracks()).map(f => [f.fields.drive_id, f]));

				// Scan for changes
				for (let driveFile of driveFiles.values()) {
					let tableMatch = tableFiles.get(driveFile.id);

					// New Files
					if (!tableMatch) {
						this.newFiles.push(driveFile);
					}
					else {
						tableMatch._notDeleted = true;
						driveFile.tableFileId = tableMatch.id;

						// Changed parent folders
						if (tableMatch.fields.drive_folder !== driveFile.parentName) {
							this.updatedFiles.push(driveFile);
						}

						// Restored Files
						if (tableMatch.fields.deleted_from_drive) {
							tableMatch.fields.deleted_from_drive = false;
							this.updatedFiles.push(driveFile);
						}

						// Updated Files
						if (!lastSync || lastSync.date < driveFile.modifiedTime) {
							this.updatedFiles.push(driveFile);
						}
					}
				}


				for (let tableFile of tableFiles.values()) {
					// Deleted Files
					if (!tableFile.deleted_from_drive && !tableFile._notDeleted) {
						this.deletedFiles.push(tableFile);
					}
				}
			}

			catch (error) {
				this.errorMessages.push("Error while loading files.", error);
				this.syncError = error;
				console.log(this.syncError);
			}

			this.syncing = false;
			this.syncStatus = this.syncError ? "Failed" : "Ready";
			this.syncReady = true;
		},

		async doSync() {
			if (!this.syncReady) return;

			try {
				if (this.newFiles.length === 0
					&& this.updatedFiles.length === 0
					&& this.deletedFiles.length === 0
				) {
					this.syncStatus = "Nothing to sync.";
					this.syncing = false;
					return;
				}

				// Save changes to Airtable
				this.syncStatus = 'Saving to Airtable...';

				let [newRes, updateRes, deleteRes] = await Promise.all([
					AirtableService.saveNewTracks(this.newFiles),
					AirtableService.saveUpdatedTracks(this.updatedFiles),
					AirtableService.saveDeletedTracks(this.deletedFiles),
				]);

				for (let track of newRes) {
					let file = this.newFiles.find(f => f.id === track.fields.drive_id);
					if (file) {
						file.successMatch = track;
					}
				}
				for (let track of updateRes) {
					let file = this.updatedFiles.find(f => f.id === track.fields.drive_id);
					if (file) {
						file.successMatch = track;
					}
				}
				for (let track of deleteRes) {
					let oldTrack = this.deletedFiles.find(t => t.fields.drive_id === track.fields.drive_id);
					if (oldTrack) {
						oldTrack.successMatch = track;
					}
				}

				await AirtableService.saveSyncReport(
					this.newFiles.filter(f => f.successMatch).map(f => f.successMatch.id),
					this.updatedFiles.filter(f => f.successMatch).map(f => f.successMatch.id),
					this.deletedFiles.filter(f => f.successMatch).map(f => f.successMatch.id),
					this.syncError
				);

			}
			catch (error) {
				this.errorMessages.push("Error while saving sync record.");
				this.syncError = error;
				this.syncError.failed = {
					new: this.newFiles.filter(f => !f.successMatch).map(f => f),
					update: this.updatedFiles.filter(f => !f.successMatch).map(f => f),
					delete: this.deletedFiles.filter(f => !f.successMatch).map(f => f),
				}
				console.log(this.syncError);
			}

			this.syncing = false;
			this.syncStatus = this.syncError ? "Failed." : "Complete!";
		},

		async loadDriveFiles() {
			await gapi.client.init({
				discoveryDocs: [
					"https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
				],
			});

			let { body: foldersBody } = await gapi.client.drive.files.list({
				supportsAllDrives: true,
				includeItemsFromAllDrives: true,
				fields: "files(name, id, mimeType)",
				q: `
                    '1dX3CXTv9ao0fqeJ9UKBevN0NjsgSj2lv' in parents
                    and mimeType = 'application/vnd.google-apps.folder'
                `
			});

			let categoryRes = await gapi.client.drive.files.list({
				supportsAllDrives: true,
				includeItemsFromAllDrives: true,
				fields: "files(name, id, mimeType, parents)",
				q: `
                    '1tWhqAdJ5MfsaqIJYuRbGHRYX3liSD838' in parents
                    and mimeType = 'application/vnd.google-apps.folder'
                `
			});

			const categoryFolders = JSON.parse(categoryRes.body).files;

			const files = [];

			for (let category of categoryFolders) {
				let dateRes = await gapi.client.drive.files.list({
					supportsAllDrives: true,
					includeItemsFromAllDrives: true,
					fields: "files(name, id, mimeType, parents)",
					q: `
						'${category.id}' in parents
						and mimeType = 'application/vnd.google-apps.folder'
					`
				});
				const dateFolders = JSON.parse(dateRes.body).files;


				for (let date of dateFolders) {
					let fileRes = await gapi.client.drive.files.list({
						supportsAllDrives: true,
						includeItemsFromAllDrives: true,
						fields: "files(name, id, mimeType, parents, modifiedTime)",
						q: `
						'${date.id}' in parents
						and mimeType = 'audio/mpeg'
					`
					});
					const dateFiles = JSON.parse(fileRes.body).files;
					console.log(dateFiles)
					dateFiles.forEach(f => files.push({
						...f,
						dateFolder: date.name,
						categoryFolder: category.name
					}));
				}
			}

			console.log(files);

			return files;
		}
	}
});

module.exports = function insertAirtableSync(elId, config) {
	let anchorEl = document.getElementById(elId);
	if (!anchorEl) return;

	let html = /*html*/`
        <div id="RecentBlogInsert"><AirtableSync :config="config"></AirtableSync></div>
    `
	anchorEl.outerHTML = html;
	new Vue({ el: "#RecentBlogInsert", data: { config } });
}

// This is a Javascript library to retrieve the access token from the Google Service Account.
// https://github.com/tanaikech/GetAccessTokenFromServiceAccount_js
document.write(
	'<script src="https://cdnjs.cloudflare.com/ajax/libs/jsencrypt/3.0.0-rc.1/jsencrypt.min.js"></script>'
);
document.write(
	'<script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.0.0/crypto-js.min.js"></script>'
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