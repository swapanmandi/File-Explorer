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

export const saveFolderToDB = async (folder) => {
  if (!folder.id) throw new Error("Folder Object Id is Missing");
  const db = await initDB();
  const tx = db.transaction(FOLDER_STORE, "readwrite");
  await tx.store.put(folder);
  await tx.done;
};

export const getAllFolders = async () => {
  const db = await initDB();
  return db.getAll(FOLDER_STORE);
};

export const deleteAllFolders = async () => {
  const db = await initDB();
  return db.clear(FOLDER_STORE);
};
