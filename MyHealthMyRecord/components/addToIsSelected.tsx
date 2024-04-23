import Realm from 'realm';
import {ObjectId} from 'bson';
import {VideoData} from '../models/VideoData';

async function addToIsSelected(ids: string[]) {
  let realm: Realm | null = null;

  try {
    realm = await Realm.open({
      schema: [VideoData.schema],
      deleteRealmIfMigrationNeeded: true,
    });

    if (!realm) {
      throw new Error('Realm instance is not valid.');
    }

    await Promise.all(
      ids.map(async id => {
        const objectId = new ObjectId(id);
        const video = realm!.objectForPrimaryKey<VideoData>(
          'VideoData',
          objectId,
        );
        if (video) {
          realm!.write(() => {
            video.isSelected = true;
          });
        } else {
          console.log(`Video with ID ${id} not found.`);
        }
      }),
    );
  } catch (error) {
    console.error('Error adding to isSelected:', error);
  }
}

export default addToIsSelected;
