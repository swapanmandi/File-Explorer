import { useDispatch, useSelector } from "react-redux";
import { setFolderData } from "../store/folderSlice.js";
import { saveFoldersToDB } from "../db/indexDB.js";

export const useFolder = () => {
  const dispatch = useDispatch();
  const folderData = useSelector((state) => state.folder.folderData);
  const currentFolder = useSelector((state) => state.folder.currentFolder);

  const calculateFolderSize = (folder) => {
    if (!folder?.children || folder?.children.length === 0) return 0;

    return folder.children.reduce((totalSize, child) => {
      if (child.type !== "folder") {
        return totalSize + child.size || 0;
      } else if (child.type === "folder") {
        return totalSize + calculateFolderSize(child);
      }
      return totalSize;
    }, 0);
  };

  const addFolder = async (parentFolder, newItemName) => {
    const createFolder = {
      id: crypto.randomUUID() || Date.now(),
      name: newItemName,
      type: "folder",
      createDate: new Date().toISOString(),
      modifyDate: new Date().toISOString(),
      content: "",
      size: "",
      children: [],
    };

    const addFolderRecursive = (folders) => {
      if (!parentFolder?.id) return [...folders, createFolder];

      return folders.map((folder) => {
        if (folder.id === parentFolder.id) {
          return { ...folder, children: [...folder.children, createFolder] };
        }
        if (folder.children?.length) {
          const updatedChildren = addFolderRecursive(folder.children);
          if (updatedChildren !== folder.children) {
            return { ...folder, children: updatedChildren };
          }
        }
        return folder;
      });
    };

    const updatedFolders = addFolderRecursive(folderData);

    await saveFoldersToDB(updatedFolders);
    dispatch(setFolderData(updatedFolders));
  };

  const addFile = async (folderData, newFile) => {
    const addFileRecursive = (data) => {
      return data.map((folder) => {
        if (folder?.id === currentFolder?.id) {
          const updatedChildren = [...folder.children, newFile];
          return {
            ...folder,
            children: updatedChildren,
            size: calculateFolderSize({ ...folder, children: updatedChildren }),
          };
        } else if (folder?.children?.length > 0) {
          const updatedChildren = addFileRecursive(folder.children);
          return {
            ...folder,
            children: updatedChildren,
            size: calculateFolderSize({ ...folder, children: updatedChildren }),
          };
        }
        return folder;
      });
    };

    const updatedFolders = addFileRecursive(folderData);
    dispatch(setFolderData(updatedFolders));
    await saveFoldersToDB(updatedFolders);
    setNewFolderName("");
  };

  const deleteItem = async (folderId) => {
    const updatedFolders =
      updateFolderRecursive(folderData, folderId[0], (folder) => null).filter(
        Boolean
      ) || [];

    dispatch(setFolderData(updatedFolders));
    await saveFoldersToDB(updatedFolders);
  };

  const updateFolderRecursive = (folders, folderId, updateCallback) => {
    return folders.map((folder) => {
      if (folder.id === folderId) {
        return updateCallback(folder);
      }
      if (folder.children?.length) {
        return {
          ...folder,
          children: updateFolderRecursive(
            folder.children,
            folderId,
            updateCallback
          ),
        };
      }
      return folder;
    }).filter(Boolean);
  };

  const renameItem = async (renameFolder, newName) => {
    const updatedFolders = updateFolderRecursive(
      folderData,
      renameFolder.id,
      (folder) => ({
        ...folder,
        name: newName,
        modifyDate: new Date().toISOString(),
      })
    );
    updatedFolders.map((item) => saveFoldersToDB(item));
    dispatch(setFolderData(updatedFolders));
  };

  const copyItem = async (folderId, newParentId) => {
    let copiedItem = null;

    const foldersWithMovedItem = updateFolderRecursive(
      folderData,
      folderId[0],
      (folder) => {
        copiedItem = { ...folder, id: crypto.randomUUID() };
        return folder;
      }
    );

    if (!copiedItem) return;

    const finalFolders = updateFolderRecursive(
      foldersWithMovedItem,
      newParentId.id,
      (folder) => ({
        ...folder,
        children: [...(folder.children || []), copiedItem],
      })
    );
    await saveFoldersToDB(finalFolders);
    dispatch(setFolderData(finalFolders));
  };

  const moveItem = async (folderId, newParentId) => {
    let movedItem = null;

    const foldersWithMovedItem =
      updateFolderRecursive(folderData, folderId[0], (folder) => {
        movedItem = { ...folder };
        return null;
      }).filter(Boolean);

    if (!movedItem) return;
    console.log("updated folders", foldersWithMovedItem)

    const finalFolders = updateFolderRecursive(
      foldersWithMovedItem,
      newParentId.id,
      (folder) => ({
        ...folder,
        children: [...(folder.children || []), movedItem],
      })
    );
    console.log("final folders", finalFolders);
    await saveFoldersToDB(finalFolders);
    dispatch(setFolderData(finalFolders));
  };

  return {
    addFolder,
    addFile,
    renameItem,
    deleteItem,
    moveItem,
    copyItem,
  };
};
