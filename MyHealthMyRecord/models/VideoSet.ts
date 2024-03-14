import {createRealmContext} from '@realm/react';
import Realm from 'realm';

export class VideoSet extends Realm.Object<VideoSet> {
    _id!: Realm.BSON.ObjectId;
    //userId!: number;
    datetime!: Date;
    videoIDs!: Realm.List<string>;
    frequencyData!: Realm.List<string>;
  
    static schema = {
      name: 'VideoSet',
      primaryKey: '_id',
      properties: {
        _id: {type: 'objectId', default: new Realm.BSON.ObjectID()},
        //userId: 'int',
        datetime: {type: 'date', default: new Date()},
        videoIDs: {type: 'mixed[]', default: []},
        frequencyData: {type: 'mixed[]', default: []},
      },
    };
  }
  
  export const {RealmProvider, useRealm, useObject, useQuery} =
    createRealmContext({
      schema: [VideoSet.schema],
      deleteRealmIfMigrationNeeded: true,
    });