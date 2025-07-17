import {createRealmContext} from '@realm/react';
import Realm from 'realm';
import React, { ReactNode } from 'react';

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
  tsOutputBullet!: string;
  tsOutputSentence!: string;
  flagged_for_harm!: boolean;
  //type (emoji, text, etc), text/sentiment/keyword/location, timestamp

  static schema = {
    name: 'VideoData',
    primaryKey: '_id',
    properties: {
      _id: {type: 'objectId', default: new Realm.BSON.ObjectID()},
      // userId: 'int',
      title: {type: 'string', default: new Date().toLocaleString()},
      filename: 'string',
      datetimeRecorded: {type: 'date', default: new Date()},
      duration: 'double',
      textComments: {type: 'mixed[]', default: []},
      locations: {type: 'mixed[]', default: []},
      emotionStickers: {type: 'string[]', default: []},
      keywords: {type: 'mixed[]', default: []},
      painScale: {type: 'string[]', default: []},
      numericScale: {type: 'float', default: 0},
      isConverted: {type: 'bool', default: false},
      isSelected: {type: 'bool', default: false},
      isTranscribed: {type: 'bool', default: false},
      transcript: {type: 'string', default: ''},
      weekday: {type: 'string', default: new Date().toString().split(' ')[0]},
      sentiment: {type: 'string', default: ''},
      tsOutputBullet: {type: 'string', default: ''},
      tsOutputSentence: {type: 'string', default: ''},
      flagged_for_harm: {type: 'bool', default: false},
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
  // summaryAnalysis!: string;
  summaryAnalysisSentence!: string;
  summaryAnalysisBullet!: string;
  isSummaryGenerated!: boolean;
  reportFormat!: string;
  selectedWords!: string[];
  earliestVideoDateTime!: Date;
  latestVideoDateTime!: Date;
  isAnalyzed!: boolean;
  isCurrent!: boolean;

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
      // summaryAnalysis: {type: 'string', default: ''},
      summaryAnalysisSentence: {type: 'string', default: ''},
      summaryAnalysisBullet: {type: 'string', default: ''},
      isSummaryGenerated: {type: 'bool', default: false},
      reportFormat: {type: 'string', default: 'bullet'},
      selectedWords: {type: 'string[]', default: []},
      earliestVideoDateTime: {type: 'date', default: new Date()},
      latestVideoDateTime: {type: 'date', default: new Date()},
      isAnalyzed: {type: 'bool', default: false},
      isCurrent: {type: 'bool', default: false},
    },
  };
}

export const {RealmProvider, useRealm, useObject, useQuery} =
  createRealmContext({
    schema: [VideoData.schema, VideoSet.schema],
    deleteRealmIfMigrationNeeded: true,
  }) as {
    RealmProvider: React.FC<{children: ReactNode}>;
    useRealm: typeof import('@realm/react').useRealm;
    useObject: typeof import('@realm/react').useObject;
    useQuery: typeof import('@realm/react').useQuery;
  };
