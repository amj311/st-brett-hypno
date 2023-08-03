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

    async saveSyncReport(created, updated, deleted) {
        return await this.base(TABLES.SYNC).create({
            date: Date.now(),
            created,
            updated,
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

    async saveNewTracks(tracks) {
        return await this.batchOperation(tracks, async batch => {
            return await this.base(TABLES.TRACKS).create(batch.map(t => this.prepareTrackObject(t)));
        });
    };


    async saveUpdatedTracks(tracks) {
        return await this.batchOperation(tracks, async batch => {
            return await this.base(TABLES.TRACKS).update(batch.map(t => this.prepareTrackObject(t)));
        });
    };


    async saveDeletedTracks(tracks) {
        return await this.batchOperation(tracks, async batch => {
            return await this.base(TABLES.TRACKS).update(batch.map(t => ({
                "id": t.id,
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
    
    prepareTrackObject(object) {
        return {
            id: object.tableFileId,
            fields: {
                file_name: object.name,
                drive_id: object.id,
                drive_folder: object.parentName,
                release_date: object.parentName?.match(/\d{4}-(0[1-9]|1[0-2])/g) ?
                                object.parentName : null,
                deleted_from_drive: object.deleted_from_drive ?? false,
            }
        }
    }
};

module.exports = new AirtableService();