import { Linking, Platform, Share } from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import Toast from 'react-native-toast-message';
import { resolveChatMediaUrl } from '../screens/ChatDetail/chatMediaHelpers';
import { store } from '../redux/Store';

function sanitizeFileName(name: string): string {
  const base = name.trim() || 'document';
  return base.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function guessMime(fileName: string): string {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.pdf')) return 'application/pdf';
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.gif')) return 'image/gif';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.doc')) return 'application/msword';
  if (lower.endsWith('.docx')) {
    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  }
  if (lower.endsWith('.xlsx')) {
    return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  }
  if (lower.endsWith('.xls')) return 'application/vnd.ms-excel';
  if (lower.endsWith('.txt')) return 'text/plain';
  return 'application/octet-stream';
}

function fileUri(path: string): string {
  return path.startsWith('file://') ? path : `file://${path}`;
}

function getAuthHeaders(): Record<string, string> {
  const token = store.getState()?.auth?.token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function saveToAndroidDownloads(tempPath: string, safeName: string) {
  const mime = guessMime(safeName);
  const apiLevel = Number(Platform.Version) || 0;

  if (apiLevel >= 29) {
    await ReactNativeBlobUtil.MediaCollection.copyToMediaStore(
      {
        name: safeName,
        parentFolder: '',
        mimeType: mime,
      },
      'Download',
      tempPath,
    );
    return;
  }

  const destPath = `${ReactNativeBlobUtil.fs.dirs.LegacyDownloadDir}/${safeName}`;
  const exists = await ReactNativeBlobUtil.fs.exists(destPath);
  if (exists) {
    await ReactNativeBlobUtil.fs.unlink(destPath);
  }
  await ReactNativeBlobUtil.fs.cp(tempPath, destPath);
  await ReactNativeBlobUtil.fs.scanFile([{ path: destPath, mime }]);
}

/** Open the device downloads / files location (Android Downloads, iOS Files). */
export function openDownloadsFolder() {
  if (Platform.OS === 'android') {
    Linking.openURL(
      'content://com.android.externalstorage.documents/document/primary%3ADownload',
    ).catch(() =>
      Linking.openURL(
        'content://com.android.externalstorage.documents/root/primary',
      ),
    );
    return;
  }
  Linking.openURL('shareddocuments://').catch(() => {});
}

export async function downloadRemoteFile(
  url: string,
  fileName: string,
  options?: { description?: string },
) {
  const fullUrl = resolveChatMediaUrl(url);
  const safeName = sanitizeFileName(fileName);
  const headers = getAuthHeaders();

  try {
    if (Platform.OS === 'android') {
      const tempPath = `${
        ReactNativeBlobUtil.fs.dirs.CacheDir
      }/${Date.now()}_${safeName}`;
      const response = await ReactNativeBlobUtil.config({
        path: tempPath,
        fileCache: true,
      }).fetch('GET', fullUrl, headers);

      const status = response.info().status;
      if (status < 200 || status >= 300) {
        throw new Error(`Download failed (${status})`);
      }

      await saveToAndroidDownloads(response.path(), safeName);

      Toast.show({
        type: 'success',
        text1: 'Download complete',
        text2: `${safeName} saved to Downloads`,
        visibilityTime: 6000,
        onPress: () => {
          openDownloadsFolder();
          Toast.hide();
        },
      });
      return;
    }

    const cachePath = `${
      ReactNativeBlobUtil.fs.dirs.CacheDir
    }/${Date.now()}_${safeName}`;
    const response = await ReactNativeBlobUtil.config({
      path: cachePath,
      fileCache: true,
    }).fetch('GET', fullUrl, headers);
    const status = response.info().status;
    if (status < 200 || status >= 300) {
      throw new Error(`Download failed (${status})`);
    }
    const savedPath = response.path();

    await Share.share({
      url: fileUri(savedPath),
      title: safeName,
    });

    Toast.show({
      type: 'success',
      text1: 'File ready',
      text2: 'Saved via share sheet',
      visibilityTime: 4000,
    });
  } catch (error) {
    Toast.show({
      type: 'error',
      text1: 'Download failed',
      text2: 'Could not save file. Please try again.',
    });
  }
}
