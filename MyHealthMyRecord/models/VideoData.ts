import {createRealmContext} from '@realm/react';
import Realm from 'realm';

export class VideoData extends Realm.Object<VideoData> {
  _id!: Realm.BSON.ObjectId;
  //userId!: number;
  title!: string;
  filename!: string;
  datetimeRecorded!: Date;
  duration!: number;
  textComments!: Realm.List<string>;
  locations!: Realm.List<string>;
  emotionStickers!: Realm.List<string>;
  keywords!: Realm.List<string>;
  painScale!: Realm.List<string>;
  //type (emoji, text, etc), text/sentiment/keyword/location, timestamp

  static schema = {
    name: 'VideoData',
    primaryKey: '_id',
    properties: {
      _id: {type: 'objectId', default: new Realm.BSON.ObjectID()},
      //userId: 'int',
      title: {type: 'string', default: new Date().toLocaleString()},
      filename: 'string',
      datetimeRecorded: {type: 'date', default: new Date()},
      duration: 'double',
      textComments: {type: 'mixed[]', default: []},
      locations: {type: 'mixed[]', default: []},
      emotionStickers: {type: 'string[]', default: []},
      keywords: {type: 'mixed[]', default: []},
      painScale: {type: 'string[]', default: []},
    },
  };
}

export const {RealmProvider, useRealm, useObject, useQuery} =
  createRealmContext({
    schema: [VideoData.schema],
  });
