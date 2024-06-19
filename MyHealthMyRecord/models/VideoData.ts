import {createRealmContext} from '@realm/react';
import Realm from 'realm';

export class VideoData extends Realm.Object<VideoData> {
  _id!: Realm.BSON.ObjectId;
  // userId!: number;
  title!: string;
  filename!: string;
  datetimeRecorded!: Date;
  duration!: number;
  textComments!: Realm.List<string>;
  locations!: Realm.List<string>;
  emotionStickers!: Realm.List<string>;
  keywords!: Realm.List<string>;
  painScale!: Realm.List<string>;
  isConverted!: boolean;
  isSelected!: boolean;
  isTranscribed!: boolean;
  transcript!: Realm.List<string>;
  weekday!: Date;
  sentiment!: string;
  //type (emoji, text, etc), text/sentiment/keyword/location, timestamp

  static schema = {
    name: 'VideoData',
    primaryKey: '_id',
    properties: {
      _id: { type: 'objectId', default: new Realm.BSON.ObjectID() },
      // userId: 'int',
      title: { type: 'string', default: new Date().toLocaleString() },
      filename: 'string',
      datetimeRecorded: { type: 'date', default: new Date() },
      duration: 'double',
      textComments: { type: 'mixed[]', default: [] },
      locations: { type: 'mixed[]', default: [] },
      emotionStickers: { type: 'string[]', default: [] },
      keywords: { type: 'mixed[]', default: [] },
      painScale: { type: 'string[]', default: [] },
      isConverted: { type: 'bool', default: false },
      isSelected: { type: 'bool', default: false },
      isTranscribed: { type: 'bool', default: false },
      transcript: { type: 'string[]', default: [] },
      weekday: { type: 'string', default: new Date().toString().split(' ')[0] },
      sentiment: { type: 'string', default: 'Neutral' },
    },
  };
}

export class VideoSet extends Realm.Object<VideoSet> {
  _id!: Realm.BSON.ObjectId;
  //userId!: number;
  datetime!: Date;
  name!: string;
  videoIDs!: Realm.List<string>;
  frequencyData!: Realm.List<string>;
  summaryAnalysis!: string;
  isSummaryGenerated!: boolean;
  reportFormat!: string;

  static schema = {
    name: 'VideoSet',
    primaryKey: '_id',
    properties: {
      _id: {type: 'objectId', default: new Realm.BSON.ObjectID()},
      //userId: 'int',
      datetime: {type: 'date', default: new Date()},
      name: {type: 'string', default: new Date().toLocaleString()},
      videoIDs: {type: 'mixed[]', default: []},
      frequencyData: {type: 'mixed[]', default: []},
      summaryAnalysis: {type: 'string', default: ''},
      isSummaryGenerated: {type: 'bool', default: false},
      reportFormat: {type: 'string', default: 'bullet'},
    },
  };
}

export const {RealmProvider, useRealm, useObject, useQuery} =
  createRealmContext({
    schema: [VideoData.schema, VideoSet.schema],
    deleteRealmIfMigrationNeeded: true,
  });
