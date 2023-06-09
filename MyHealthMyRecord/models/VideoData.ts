import { createRealmContext } from "@realm/react";
import Realm from "realm";

export class VideoData extends Realm.Object<VideoData> {
    _id!: Realm.BSON.ObjectId;
    title!: string;
    filename!: string;
    //userId!: number;
    datetimeRecorded!: Date;
    duration!: number;
    location!: string;
    isAnnotated!: boolean;
    //annotations as list?
    annotations!: Realm.List<string>;
    //type (emoji, text, etc), text, sentiment, keyword, location, timestamp

    static schema = {
        name: 'VideoData',
        primaryKey: '_id',
        properties: {
            _id: {type: 'objectId', default: new Realm.BSON.ObjectID()},
            title: {type: 'string', default: new Date().toLocaleString()},
            filename: 'string',
            //userId: 'int',
            datetimeRecorded: {type: 'date', default: new Date()},
            duration: 'double',
            location: {type:'string', default: ""},
            isAnnotated: {type:'bool', default: false},
            annotations: {type: 'string[]', default: []},
        },
    };
}

export const { RealmProvider, useRealm, useObject, useQuery } = createRealmContext({
    schema: [VideoData.schema],
});