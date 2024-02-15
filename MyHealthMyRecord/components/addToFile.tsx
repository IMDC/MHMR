import {useEffect} from 'react';
import RNFS from 'react-native-fs';

const useAddToFile = (selectedVideos: Set<string>) => {
  useEffect(() => {
    const copyFiles = async () => {
      try {
        // Source directory
        const sourceDir = RNFS.DocumentDirectoryPath + '/MHMR';

        // Destination directory
        const destinationDir = RNFS.DocumentDirectoryPath + '/MHMR/dashboard';

        // Ensure destination directory exists
        await RNFS.mkdir(destinationDir);

        // Iterate over selected videos
        for (const filename of selectedVideos) {
          const sourceFile = `${sourceDir}/${filename}`;
          const destinationFile = `${destinationDir}/${filename}`;
          await RNFS.copyFile(sourceFile, destinationFile);
        }

        console.log('Files copied successfully');
      } catch (error) {
        console.error('Error copying files:', error);
      }
    };

    if (selectedVideos.size > 0) {
      copyFiles();
    }
  }, [selectedVideos]);
};

export default useAddToFile;