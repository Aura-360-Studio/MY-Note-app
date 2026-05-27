/**
 * Direct fetch-based service layer for Google Drive v3 API.
 * Adheres strictly to the least-privilege principle, interacting ONLY
 * with the private and hidden sandboxed application directory `appDataFolder`.
 */

export interface GoogleDriveFile {
  id: string;
  name: string;
  modifiedTime?: string;
}

const GOOGLE_DRIVE_BACKUP_FILENAME = "mynote-backup.json";

export const googleDriveService = {
  /**
   * Queries the hidden appDataFolder to find any existing backup file.
   */
  async findBackupFile(accessToken: string): Promise<GoogleDriveFile | null> {
    try {
      const url = `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&fields=files(id,name,modifiedTime)`;
      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      if (!res.ok) {
        throw new Error(`Google API list error: ${res.statusText} (${res.status})`);
      }

      const data = await res.json();
      const files: GoogleDriveFile[] = data.files || [];
      const backupFile = files.find((f) => f.name === GOOGLE_DRIVE_BACKUP_FILENAME);
      return backupFile || null;
    } catch (err) {
      console.error("Failed to query Google Drive appDataFolder:", err);
      throw err;
    }
  },

  /**
   * Downloads and parses the content of the backup file.
   */
  async downloadBackupContent(accessToken: string, fileId: string): Promise<any> {
    try {
      const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      if (!res.ok) {
        throw new Error(`Google API download error: ${res.statusText} (${res.status})`);
      }

      return await res.json();
    } catch (err) {
      console.error("Failed to download backup from Google Drive:", err);
      throw err;
    }
  },

  /**
   * Saves (creates or updates) the backup in Google Drive using multipart upload protocol.
   */
  async saveBackup(accessToken: string, backupData: any, existingFileId?: string | null): Promise<GoogleDriveFile> {
    try {
      const boundary = "314159265358979323846";
      const delimiter = `\r\n--${boundary}\r\n`;
      const closeDelimiter = `\r\n--${boundary}--`;

      const metadata: any = {
        name: GOOGLE_DRIVE_BACKUP_FILENAME,
        mimeType: "application/json"
      };

      // Only specify parents on creation
      if (!existingFileId) {
        metadata.parents = ["appDataFolder"];
      }

      const multipartRequestBody =
        delimiter +
        "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
        JSON.stringify(metadata) +
        delimiter +
        "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
        JSON.stringify(backupData, null, 2) +
        closeDelimiter;

      const url = existingFileId
        ? `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=multipart&fields=id,name,modifiedTime`
        : `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,modifiedTime`;

      const res = await fetch(url, {
        method: existingFileId ? "PATCH" : "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": `multipart/related; boundary=${boundary}`
        },
        body: multipartRequestBody
      });

      if (!res.ok) {
        throw new Error(`Google API upload error: ${res.statusText} (${res.status})`);
      }

      return await res.json();
    } catch (err) {
      console.error("Failed to upload backup to Google Drive:", err);
      throw err;
    }
  }
};
