const AirtableService = require("./services/AirtableService");
const { Howl } = require('howler');

const DateRegex = /^(?<year>\d{4})-(?<month>\d{2})(-(?<day>\d{2}))?$/;

const classNames = (vCtx) => {
	return (className) => `${vCtx.$vnode.tag}_${className}`;
}

const loadStylesheet = (vCtx, css) => {
	const id = vCtx.$vnode.tag + '_styles';
	const el = document.getElementById(id);
	if (!el) {
		document.head.insertAdjacentHTML('beforeend', `<style id="${id}">${css}</style>`);
	}
}

const Change = Vue.component('change', {
	props: ["old", "now"],
	
	template: /*html*/`
    <span>
		<span v-if="!didChange">{{old || now}}</span>
		<span v-else>
			<span :class="cx('old')">{{old}}</span>
			<span :class="cx('now')">{{now}}</span>
		</span>
    </span>`,

	beforeMount() {
		loadStylesheet(this, /* css */`
			.${this.cx('old')} {
				background: #ffd1d1;
				text-decoration: line-through;
			}
			.${this.cx('now')} {
				background: #cbffd1;
			}
		`);
	},

	data: function () {
		return {
			cx: classNames(this),
		}
	},

	methods: {
	},

	computed: {
		didChange() {
			return ((this.old && this.now) && this.old !== this.now);
		},
	}
});

const SyncPairTable = Vue.component('syncPairTable', {
	components: { Change },
	props: ["syncPairs", "finishedSync", "hideAirtable", "syncing"],
	
	template: /*html*/`
    <div class="table-wrapper">
		<table><tbody>
			<tr>
				<th>
					<span v-if="finishedSync">Status</span>
					<input v-else type="checkbox" :checked="allChecked" @change="onChangeAll" :disabled="syncing">
				</th>
				<th class="name">Track Name</th>
				<th>Release Date</th>
				<th v-if="!hideAirtable">Airtable</th>
				<th>Google Drive</th>
			</tr>
			<tr v-for="syncPair in syncPairs">
				<td>
					<span v-if="finishedSync">
						<span v-if="syncPair.doSync && syncPair.syncResRecord" title="Success">✅</span>
						<span v-else-if="syncPair.doSync" title="Failed">❌</span>
						<span v-else title="Skipped">⏸</span>
					</span>
					<span v-else>
						<input type="checkbox" v-model="syncPair.doSync" :disabled="syncing">
					</span>
				</td>
				<td><Change :old="syncPair.record?.fields.file_name" :now="syncPair.driveFile?.name" /></td>
				<td><Change :old="syncPair.record?.fields.release_date" :now="syncPair.driveFile?.dateFolder" /></td>
				<td v-if="!hideAirtable"><a :href="getAirtableUrl(syncPair.record.id)" target="_blank">{{syncPair.record.id}}</a></td>
				<td><a :href="getGoogleUrl(googleId(syncPair))" target="_blank">{{googleId(syncPair)}}</a></td>
			</tr>
		</tbody></table>
	</div>
	`,

	methods: {
		googleId(syncPair) {
			return syncPair.driveFile?.id || syncPair.record?.fields.drive_id;
		},
		getAirtableUrl(recordId) {
			return "https://airtable.com/app412fK8ppzF15Y2/tblreK8W3yna7ZTXc/viw9QvMcAVI81Lt1A/" + recordId;
		},
		getGoogleUrl(fileId) {
			return `https://drive.google.com/file/d/${fileId}/view`;
		},

		onChangeAll(event) {
			const checked = event.target.checked;
			for (const pair of this.syncPairs) {
				pair.doSync = checked;
			}
		}
	},

	computed: {
		allChecked() {
			for (const pair of this.syncPairs) {
				if (!pair.doSync) {
					return false;
				}
			}
			return true;
		}
	}
});

Vue.component('airtablesync', {
	components: { Change, SyncPairTable },

	template: /*html*/`

    <div id="AirtableSyncVueWrapper">
        <div v-html="stylesheet"></div>
        <div class="header">
			<div class="left-logos">
				<img id="gdriveLogo" src="https://pngimg.com/uploads/google_drive/google_drive_PNG14.png" />
				<img id="arrow" src="https://clipground.com/images/arrow-1.png" />
				<img id="airtableLogo" src="https://seeklogo.com/images/A/airtable-logo-216B9AF035-seeklogo.com.png" />
				<h1>&nbsp;&nbsp;Hypnotherapy Sync Tool</h1>
			</div>
			<div class="right-nav">
				<a
					href="https://drive.google.com/drive/folders/1tWhqAdJ5MfsaqIJYuRbGHRYX3liSD838"
					target="_blank"
				>
					Google Drive
				</a>
				<a
					href="https://airtable.com/app412fK8ppzF15Y2/tblreK8W3yna7ZTXc/viwMphBsGKphzXSZl?blocks=hide"
					target="_blank"
				>
					Airtable
				</a>
				<a
					href="https://docs.google.com/document/d/14w4dYqbAW3HOaXfIDypxyYjH8kqGUgvwlDVSzLWMEbI/edit#heading=h.ewp86hikz4j3"
					target="_blank"
				>
					Instructions
				</a>
			</div>
		</div>
        <div class="main">
			<div v-if="loading">Loading ...</div>
			<div v-else>
				<div class="messageWrapper">
					<div v-for="msg in messages" :class="['message', msg.type]">
						<span v-if="msg.type === 'error'">❌&nbsp;</span>
						<span v-if="msg.type === 'success'">✅&nbsp;</span>
						{{msg.message}}
					</div>
				</div>
				<section>
					<h3>Step One: Scan Drive Files</h3>
					<div v-if="!syncReady">
						<a v-on:click="prepareSync" class="button sync">Scan</a>
						<span v-if="preparingSync">&nbsp;&nbsp;Scanning...</span>
					</div>
					<div v-else>
						<a v-on:click="prepareSync" class="button sync-again">Re-scan</a>
					</div>
				</section>
				
				<section>
					<h3>Step Two: Review Changes</h3>
					<div v-if="!syncReady">
						Sync is not ready for review.
					</div>
					<div v-else>
						<details :open="Boolean(newFiles.length)">
							<summary><b>🟢 New Tracks ({{filterWillSync(newFiles).length}}/{{newFiles.length}})</b></summary>
							<p>These Google Drive files are not connected to any Track in Airtable and will be added.</p>
							<SyncPairTable
								v-if="newFiles.length"
								:syncing="syncing"
								:syncPairs="newFiles"
								:hideAirtable="true"
								:finishedSync="finishedSync"
							/>
						</details>
						<details :open="Boolean(recordsToUpdate.length)">
							<summary><b>✏️ Will Update ({{filterWillSync(recordsToUpdate).length}}/{{recordsToUpdate.length}})</b></summary>
							<p>These tracks already exist in Airtable but have been changed in a way that will update Airtable data. Changes are marked in green.</p>
							<SyncPairTable
								v-if="recordsToUpdate.length"
								:syncing="syncing"
								:syncPairs="recordsToUpdate"
								:finishedSync="finishedSync"
							/>
						</details>
						<details :open="Boolean(recordsToRestore.length)">
							<summary><b>♻️ Will Restore ({{filterWillSync(recordsToRestore).length}}/{{recordsToRestore.length}})</b></summary>
							<p>These have previously been marked as deleted, but have since been brought back into a synced Drive folder.</p>
							<SyncPairTable
								v-if="recordsToRestore.length"
								:syncing="syncing"
								:syncPairs="recordsToRestore"
								:finishedSync="finishedSync"
							/>
						</details>
						<details :open="Boolean(recordsToDelete.length)">
							<summary><b>🚫 Will Delete ({{filterWillSync(recordsToDelete).length}}/{{recordsToDelete.length}})</b></summary>
							<p>These are tracks in Airtable which can no longer be found in Google Drive. They have either been deleted or moved out of a synced folder.</p>
							<p>If a sync deletes these from Airtable, they can be restored when their Drive file is moved back into a synced folder. </p>
							<SyncPairTable
								v-if="recordsToDelete.length"
								:syncing="syncing"
								:syncPairs="recordsToDelete"
								:finishedSync="finishedSync"
							/>
						</details>
					</div>
				</section>


				<section>
					<h3>Step Three: Save to Airtable</h3>
					<a
						v-on:click="doSync"
						class="button save"
						:disabled="!syncReady || syncing || finishedSync"
					>
						Save
					</a>
					<span v-if="syncing || finishedSync" class="status">{{syncStatus}}</span>
					<br/><br/>
					<a v-if="finishedSync" @click="dismissResults">Dismiss Results</a>
				</section>
			</div>
		</div>
    </div>`,

	data: function () {
		return {
			loading: true,
			preparingSync: false,
			finishedSync: false,
			syncing: false,
			syncStatus: "",
			syncReady: false,
			syncError: null,
			messages: [],

			newFiles: [],
			recordsToUpdate: [],
			recordsToDelete: [],
			recordsToRestore: [],

			stylesheet: /*html*/`
            <style>
                body {
                    font-family: sans-serif;
					margin: 0;
                }

				a {
					cursor: pointer;
					color: blue;
				}

				.header {
                    display: flex;
                    align-items: center;
					border-bottom: 1px solid #ccc;
					padding: 1em;
					justify-content: space-between;
					flex-wrap: wrap;
					gap: 1em;
                }
				.left-logos {
                    display: flex;
                    align-items: center;
                }
                .left-logos img {
                    width: 2em;
                }
                img#arrow {
                    width: 1em;
                    margin: 0 .25em;
                }
				.left-logos h1 {
					margin: 0;
  					text-align: right;
				}
				.right-nav {
					white-space: nowrap;
					display: flex;
					gap: .75em;
					flex-wrap: wrap;
				}
				.right-nav a {
					display: inline-block;
					line-height: 2em;
					text-decoration: none;
					cursor: pointer;
					color: #222;
				}
				.right-nav a:hover {
					text-decoration: underline;
				}

				
				.main {
					margin: 0 auto;
                    max-width: 80rem;
					padding: 1em;
				}
                .button {
                    display: inline-block;
                    background: #0bf;
                    color: #fff;
                    padding: .25em .5em;
                    border-radius: .25em;
                    user-select: none;
                    cursor: pointer;
                }
				details summary {
					cursor: pointer;
					margin-top: 0.5em;
				}
				.table-wrapper {
					overflow-x: auto;
					border: 1px solid #ccc;
					border-radius: .5em;
					margin-bottom: 1em;
				}
				table {
					width: 100%;
					border-collapse: collapse;
				}
				tr:first-child {
					border-bottom: 1px solid #ccc;
				}
				tr:not(:first-child):hover {
					box-shadow: 0 0 0.5em 0px #0004;
				}
				th {
					white-space: nowrap;
					position: relative;
				}
				th:not(:last-child)::after {
					content: '';
					display: block;
					position: absolute;
					top: .75em;
					bottom: .75em;
					right: 0;
				    border-right: 1px solid #ccc;
				}
				th.name {
					min-width: 18em;
				}
				td, th {
					padding: .75em;
					text-align: left;
				}
                
				.button.save {
					background: #29d202;
				}
				.button.save[disabled] {
					background: #bbb;
					pointer-events: none;					
				}
				.messageWrapper {
					position: fixed;
					z-index: 10;
					top: 0;
					left: 1em;
					right: 1em;
				}
				.message {
					width: fit-content;
					margin: 1em auto;
					max-width: 30em;
					display: block;
                    background: #fff;
                    border: 1px solid #ccc;
					border-radius: 5px;
					box-shadow: 0 2px 5px 2px #0002;
                    padding: 0.5em 0.75em;
				}
				.message.error {
                    background: #ffe8e8;
                    border: 1px solid #ffaaaa;
				}
				.message.success {
                    background: #e8ffe8;
                    border: 1px solid #aaeeaa;
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
			if (this.preparingSync) return;
			this.preparingSync = true;
			this.finishedSync = false;
			this.syncError = null;
			this.syncReady = false;

			this.newFiles = [];
			this.recordsToUpdate = [];
			this.recordsToDelete = [];
			this.recordsToRestore = [];

			try {
				// Load data
				this.syncStatus = 'Scanning...';

				const lastSync = await AirtableService.getLastSync();
				let driveFiles = new Map((await this.loadDriveFiles()).map(f => [f.id, f]));
				let tableRecords = new Map((await AirtableService.getAllTracks()).map(f => [f.fields.drive_id, f]));

				// Scan for changes
				for (let driveFile of driveFiles.values()) {
					let record = tableRecords.get(driveFile.id);

					const syncPair = {
						driveFile,
						record,
						doSync: true,
					};

					// New Files
					if (!record) {
						this.newFiles.push(syncPair);
					}
					else {
						record._notDeleted = true;
						driveFile.recordId = record.id;

						// Restored Files
						if (record.fields.deleted_from_drive) {
							record.fields.deleted_from_drive = false;
							this.recordsToRestore.push(syncPair);
						}

						// Updated Files
						else if (
							// Compare changeable values
							JSON.stringify({
								name: driveFile.name,
								date: driveFile.dateFolder
							})
							!==
							JSON.stringify({
								name: record.fields.file_name,
								date: record.fields.release_date,
							})
						) {
							this.recordsToUpdate.push(syncPair);
						}
					}
				}


				for (let record of tableRecords.values()) {
					// Deleted Files
					if (!record.deleted_from_drive && !record._notDeleted) {
						this.recordsToDelete.push({record, doSync: true});
					}
				}
			}

			catch (error) {
				this.showMessage('error', "Error while loading files.");
				this.showMessage('error', error.toString());
				this.syncError = error;
				console.log(this.syncError);
			}

			this.preparingSync = false;
			this.syncStatus = this.syncError ? "Failed" : "Ready";
			this.syncReady = true;
		},

		async doSync() {
			if (!this.syncReady) return;
			
			const syncNew = this.filterWillSync(this.newFiles);
			const syncUpdate = this.filterWillSync(this.recordsToUpdate);
			const syncRestore = this.filterWillSync(this.recordsToRestore);
			const syncDelete = this.filterWillSync(this.recordsToDelete);

			if (
				syncNew.length === 0 &&
				syncUpdate.length === 0 &&
				syncRestore.length === 0 &&
				syncDelete.length === 0
			) {
				this.syncStatus = "Nothing to sync.";
				this.syncing = false
				return;
			}

			if (!confirm(
				"Save these tracks to Airtable?\n\n" +
				`${syncNew.length} - New\n` +
				`${syncUpdate.length} - Update\n` +
				`${syncRestore.length} - Restore\n` +
				`${syncDelete.length} - Delete`
			)) return;

			try {
				this.syncing = true;

				// load track metadata
				this.syncStatus = 'Loading track metadata...';

				const tracksToLoad = [
					...syncNew,
					...syncUpdate,
					...syncRestore
				];

				await Promise.all(tracksToLoad.map(async (pair) => {
					const trackData = await this.loadTrackData(pair.driveFile.id);
					// All of these pairs should be bringing in data from an existing drive file
					pair.driveFile.duration = trackData.duration;
				}));

				// Save changes to Airtable
				this.syncStatus = 'Saving to Airtable...';

				let [newRes, updateRes, restoreRes, deleteRes] = await Promise.all([
					AirtableService.saveNewFiles(
						syncNew.map(pair => pair.driveFile)
					),
					AirtableService.saveUpdatedFiles(
						syncUpdate.map(pair => pair.driveFile)
					),
					AirtableService.saveRestoredFiles(
						syncRestore.map(pair => pair.driveFile)
					),
					AirtableService.saveDeletedFiles(
						syncDelete.map(pair => pair.record)
					),
				]);

				// Gather sync report
				for (let record of newRes) {
					let pair = this.newFiles.find(p => p.driveFile.id === record.fields.drive_id);
					if (pair) {
						pair.syncResRecord = record;
					}
				}
				for (let record of updateRes) {
					let pair = this.recordsToUpdate.find(p => p.driveFile.id === record.fields.drive_id);
					if (pair) {
						pair.syncResRecord = record;
					}
				}
				for (let record of restoreRes) {
					let pair = this.recordsToRestore.find(p => p.driveFile.id === record.fields.drive_id);
					if (pair) {
						pair.syncResRecord = record;
					}
				}
				for (let record of deleteRes) {
					let pair = this.recordsToDelete.find(p => p.record.fields.drive_id === record.fields.drive_id);
					if (pair) {
						pair.syncResRecord = record;
					}
				}

				await AirtableService.saveSyncReport(
					this.newFiles.filter(p => p.syncResRecord).map(f => f.syncResRecord.id),
					this.recordsToUpdate.filter(p => p.syncResRecord).map(p => p.syncResRecord.id),
					this.recordsToRestore.filter(p => p.syncResRecord).map(p => p.syncResRecord.id),
					this.recordsToDelete.filter(p => p.syncResRecord).map(p => p.syncResRecord.id),
					this.syncError
				);

				this.showMessage('success', "Finished sync!");
			}
			catch (error) {
				this.showMessage('error', "Error while saving sync record.");
				this.showMessage('error', error.toString());
				this.syncError = error;
				this.syncError.failed = {
					new: this.newFiles.filter(p => !p.syncResRecord),
					update: this.recordsToUpdate.filter(p => !p.syncResRecord),
					restore: this.recordsToRestore.filter(p => !p.syncResRecord),
					delete: this.recordsToDelete.filter(p => !p.syncResRecord),
				}
				console.log(this.syncError);
			}
			finally {
				this.syncing = false;
				this.syncStatus = this.syncError ? "Error" : "Complete!";
				this.finishedSync = true;
			}
		},

		async loadDriveFiles() {
			await gapi.client.init({
				discoveryDocs: [
					"https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
				],
			});

			const FinishedTracksFolderId = '1p9ZyFEhSeSkAv_gOCOgMh8McyNcYS-Hf';

			let dateRes = await gapi.client.drive.files.list({
				supportsAllDrives: true,
				includeItemsFromAllDrives: true,
				fields: "files(name, id, mimeType, parents)",
				q: `
						'${FinishedTracksFolderId}' in parents
						and mimeType = 'application/vnd.google-apps.folder'
					`
			});

			// Filter out folders that don't match the date format
			const dateFolders = JSON.parse(dateRes.body).files.filter((f) => f.name.match(DateRegex));

			const files = [];

			for (let dateFolder of dateFolders) {
				const { year, month, day } = DateRegex.exec(dateFolder.name).groups;
				const dateString = `${year}-${month}-${day || '01'}`;

				let fileRes = await gapi.client.drive.files.list({
					supportsAllDrives: true,
					includeItemsFromAllDrives: true,
					fields: "files(name, id, mimeType, parents, modifiedTime)",
					q: `
						'${dateFolder.id}' in parents
						and mimeType = 'audio/mpeg'
					`
				});
				const dateFiles = JSON.parse(fileRes.body).files;
				dateFiles.forEach(f => files.push({
					...f,
					dateFolder: dateString,
				}));
			}

			return files;
		},

		async loadTrackData(driveId) {
			return new Promise((res, rej) => {
				const howl = new Howl({
					src: [ 'https://docs.google.com/uc?export=download&id='+driveId ],
					html5: true,
					preload: true
				});
				howl.on('loaderror', rej);
				howl.on('load', () => {
					howl.stop();
					res({
						duration: howl.duration(),
					});
				})
				howl.volume(0);
				howl.play();
			});
		},

		getAirtableUrl(recordId) {
			return "https://airtable.com/app412fK8ppzF15Y2/tblreK8W3yna7ZTXc/viw9QvMcAVI81Lt1A/" + recordId;
		},

		getGoogleUrl(fileId) {
			return `https://drive.google.com/file/d/${fileId}/view`;
		},

		filterWillSync(syncPairs) {
			return syncPairs.filter(p => p.doSync);
		},

		dismissResults() {
			// remove tracks that already succeeded so they aren't duplicated
			for (const list of ['newFiles', 'recordsToUpdate', 'recordsToRestore', 'recordsToDelete']) {
				this[list] = this[list].filter(pair => !pair.syncResRecord);
			}
			this.finishedSync = false;
			this.syncError = false;
		},

		showMessage(type, message) {
			const id = `${Math.ceil(Math.random()*100)}${Date.now()}`;
			this.messages.push({id, type, message});
			setTimeout(() => {
				this.messages = this.messages.filter(m => m.id !== id);
			}, 10000);
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