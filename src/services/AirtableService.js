document.write(
    '<script src="https://cdn.jsdelivr.net/npm/airtable@0.11.4/lib/airtable.umd.min.js"></script>'
);


// REQUIRES THE AIRTABLE SDK TO BE LOADED TO DOC PRIOR

const TABLES = {
    TRACKS: 'tblreK8W3yna7ZTXc',
    CATEGORIES: 'tbl8CbCI2Igv8iDYl',
    SYNC: 'tblwc72Sfv7RRwF2Q',
};

const BATCH_SIZE = 10;

class AirtableService {
    constructor () {
        this.isInitialized = false;
    }


    _init() {
        this._base = new Airtable({apiKey: 'keyT4FekiPOQY8HZw'}).base('app412fK8ppzF15Y2');
        this.isInitialized = true;
        return this._base;
    };

    get base() {
        return this._base ?? this._init();
    };

    async getLastSync() {
        let res = await this.base(TABLES.SYNC).select({
            // Selecting the first 3 records in Grid view:
            maxRecords: 1,
            view: "Grid view",
        }).all();

        return res[0]?.fields;
    };

    async saveSyncReport(created, updated, restored, deleted) {
        return await this.base(TABLES.SYNC).create({
            date: Date.now(),
            created,
            updated,
            restored,
            deleted,
        });
    }


    async getAllTracks() {
        return await this.base(TABLES.TRACKS).select({
            view: "All Tracks",
        }).all();
    };

    async getReleasedTracks() {
        return await this.base(TABLES.TRACKS).select({
            view: "Released",
        }).all();
    };

    async saveNewFiles(files) {
        return await this.batchOperation(files, async batch => {
            return await this.base(TABLES.TRACKS).create(batch.map(t => this.driveFileToRecord(t)));
        });
    };


    async saveUpdatedFiles(files) {
        return await this.batchOperation(files, async batch => {
            return await this.base(TABLES.TRACKS).update(batch.map(t => this.driveFileToRecord(t)));
        });
    };

    async saveRestoredFiles(files) {
        return await this.batchOperation(files, async batch => {
            return await this.base(TABLES.TRACKS).update(batch.map(t => {
				const record = this.driveFileToRecord(t);
				record.fields.deleted_from_drive = false;
				return record;
			}));
        });
    };


    async saveDeletedFiles(records) {
        return await this.batchOperation(records, async batch => {
            return await this.base(TABLES.TRACKS).update(batch.map(record => ({
                "id": record.id,
                "fields": {
                    deleted_from_drive: true,
                }
            })));
        })
    };

    async getAllCategories() {
        return await this.base(TABLES.CATEGORIES).select().all();
    };


	async updateTrackDuration(id, duration) {
		await this.base(TABLES.TRACKS).update([{ id, fields: { duration } }]);
	}


    async batchOperation(records, op) {
        if (records.length === 0) return [];

        records = [...records];

        let batches = [];
        while (records.length > 0) {
            batches.push(records.splice(0, BATCH_SIZE));
        }
        let res = await Promise.all(batches.map(op));
        return res.flat(1);
    }
    
    driveFileToRecord(file) {
        return {
            id: file.recordId,
            fields: {
                file_name: file.name,
                drive_id: file.id,
                drive_folder: file.dateFolder,
                release_date: file.dateFolder,
                deleted_from_drive: file.deleted_from_drive ?? false,
                duration: file.duration ?? undefined,
            }
        }
    }
};

module.exports = new AirtableService();