import { downloadRemoteFile, openDownloadsFolder } from './remoteFileDownload';

export { openDownloadsFolder, downloadRemoteFile };

export async function downloadChatDocument(url: string, fileName: string) {
  return downloadRemoteFile(url, fileName, { description: 'Chat attachment' });
}
