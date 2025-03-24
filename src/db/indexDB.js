import { openDB } from "idb";

const DB_NAME = "fileExplorerDB";
const DB_VERSION = 2;
const FOLDER_STORE = "folders";

const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(FOLDER_STORE)) {
        db.createObjectStore(FOLDER_STORE, { keyPath: "id" });
      }
    },
  });
};

export const saveFoldersToDB = async (folders) => {
  if (!folders || folders.length === 0) return;

  try {
     await deleteAllFolders()
      const db = await initDB();
      const tx = db.transaction(FOLDER_STORE, "readwrite");
      const promises = folders.map(folder => {
          if (!folder.id) {
              console.error("saveFoldersToDB: Folder missing id, skipped", folder);
              return Promise.resolve();
          }
          return tx.store.put(folder);
      });
      await Promise.all(promises);
      await tx.done;
  } catch (error) {
      console.error("saveFoldersToDB: Error saving folders to database:", error);
      throw error;
  }
};

export const getAllFolders = async () => {
  const db = await initDB();
  return db.getAll(FOLDER_STORE);
};

export const deleteAllFolders = async () => {
  const db = await initDB();
  return db.clear(FOLDER_STORE);
};
