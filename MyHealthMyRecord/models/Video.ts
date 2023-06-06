import Realm, { BSON } from "realm";

export class Video extends Realm.Object<Video> {
    _id!: BSON.ObjectId;
    title!: string;
    userId!: number;
    uri!: string;
    datetimeRecorded!: Date;
    duration!: number;
    isAnnotated!: boolean;
    //annotations as list?
    annotations!: Array<string>;
    //type (emoji, text, etc), text, sentiment, keyword, location, timestamp

    static schema = {
        name: 'Video',
        primaryKey: '_id',
        properties: {
            _id: {type: 'objectId', default: () => new BSON.ObjectId()},
            title: 'string',
            userId: 'int',
            uri: 'string',
            datetimeRecorded: 'date',
            duration: 'double',
            isAnnotated: {type:'bool', default: false},
        },
    };
}