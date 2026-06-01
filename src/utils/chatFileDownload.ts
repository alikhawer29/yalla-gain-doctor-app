import { Linking, Platform } from 'react-native';
import ReactNativeBlobUtil from 'react-native-blob-util';
import Toast from 'react-native-toast-message';
import { resolveChatMediaUrl } from '../screens/ChatDetail/chatMediaHelpers';

function sanitizeFileName(name: string): string {
    const base = name.trim() || 'document';
    return base.replace(/[^a-zA-Z0-9._-]/g, '_');
}

function guessMime(fileName: string): string {
    const lower = fileName.toLowerCase();
    if (lower.endsWith('.pdf')) return 'application/pdf';
    if (lower.endsWith('.doc')) return 'application/msword';
    if (lower.endsWith('.docx')) {
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    }
    if (lower.endsWith('.txt')) return 'text/plain';
    return 'application/octet-stream';
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

export async function downloadChatDocument(url: string, fileName: string) {
    const fullUrl = resolveChatMediaUrl(url);
    const safeName = sanitizeFileName(fileName);

    try {
        if (Platform.OS === 'android') {
            await ReactNativeBlobUtil.config({
                addAndroidDownloads: {
                    useDownloadManager: true,
                    notification: true,
                    title: safeName,
                    description: 'Chat attachment',
                    mime: guessMime(safeName),
                    mediaScannable: true,
                },
            }).fetch('GET', fullUrl);
        } else {
            const path = `${ReactNativeBlobUtil.fs.dirs.DocumentDir}/${safeName}`;
            await ReactNativeBlobUtil.config({ path, fileCache: true }).fetch(
                'GET',
                fullUrl,
            );
        }

        Toast.show({
            type: 'success',
            text1: 'Download complete',
            text2: 'Tap to open Downloads',
            visibilityTime: 6000,
            onPress: () => {
                openDownloadsFolder();
                Toast.hide();
            },
        });
    } catch {
        Toast.show({
            type: 'error',
            text1: 'Download failed',
            text2: 'Please try again',
        });
    }
}
