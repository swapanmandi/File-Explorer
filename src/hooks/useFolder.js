import { useDispatch, useSelector } from "react-redux";
import { setFolderData } from "../store/folderSlice.js";
import {
  saveFolderToDB,
  getAllFolders,
  deleteAllFolders,
} from "../db/indexDB.js";

export const useFolder = () => {
  const dispatch = useDispatch();
  const folderData = useSelector((state) => state.folder.folderData);
  const isSelect = useSelector((state) => state.folder.isSelect);

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

  const addFolder = async (parentFolder, newFolderName) => {
    const createFolder = {
      id: crypto.randomUUID() || Date.now(),
      name: newFolderName,
      type: "folder",
      createDate: new Date(),
      modifyDate: new Date(),
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
    const existedFolder = await getAllFolders();

    await saveFolderToDB({ id: existedFolder[0].id, data: updatedFolders });
    dispatch(setFolderData(updatedFolders));
  };

  const deleteItem = async (deleteItems) => {
    //console.log("d i", deleteItems)

    const deleteItemsSet = new Set(deleteItems.map((item) => item));

    const updatedItems = (folders) => {
      return folders.reduce((acc, item) => {
        if (deleteItemsSet.has(item.id)) return acc;

        const updatedItem = { ...item };
        if (item.children?.length) {
          updatedItem.children = updatedItems(item.children);
        }
        acc.push(updatedItem);
        return acc;
      }, []);
    };

    const updatedData = await updatedItems(folderData);
    dispatch(setFolderData(updatedData));
    const existedFolder = await getAllFolders();

    await saveFolderToDB({ id: existedFolder[0].id, data: updatedData });
  };

  const renameFolder = (folderToRename, newFolderName) => {
    const updatedFolders = (folders) => {
      return folders.map((folder) => {
        // Check if this is the folder to rename
        if (folder?.id === folderToRename?.id) {
          return { ...folder, name: newFolderName }; // Update the folder name
        } else if (folder?.children?.length > 0) {
          // If the folder has children, recursively call updatedFolders
          return { ...folder, children: updatedFolders(folder.children) };
        }
        return folder;
      });
    };

    const updatedData = updatedFolders(folderData);
    dispatch(setFolderData(updatedData));
    localStorage.setItem("data", JSON.stringify(updatedData));
  };

  const copyItem = async (items, parentFolder) => {
    const moveItems = folderData
      .filter((item) => items.includes(item.id))
      .map((item) => ({ ...item, id: crypto.randomUUID() }));

    const addFolderRecursive = (folders) => {
      if (!parentFolder?.id) return [...folders, ...moveItems];

      return folders.map((folder) => {
        if (folder.id === parentFolder.id) {
          return { ...folder, children: [...folder.children, ...moveItems] };
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

    const existedFolder = await getAllFolders();

    await saveFolderToDB({ id: existedFolder[0].id, data: updatedFolders });
    dispatch(setFolderData(updatedFolders));
  };

  const moveItem = async (items, parentFolder) => {
    console.log("items", items)
    const moveItems = folderData
      .filter((item) => items.includes(item.id))
      .map((item) => ({ ...item, id: crypto.randomUUID() }));


    const addFolderRecursive = (folders) => {
      if (!parentFolder?.id) return [...folders, ...moveItems];

      return folders.map((folder) => {
        if (folder.id === parentFolder.id) {
          return { ...folder, children: [...folder.children, ...moveItems] };
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

    const deleteItemsSet = new Set(items.map((item) => item));

    const deleteItems = (folders) => {
      return folders.reduce((acc, item) => {
        if (deleteItemsSet.has(item.id)) return acc;

        const updatedItem = { ...item };
        if (item.children?.length) {
          updatedItem.children = deleteItems(item.children);
        }
        acc.push(updatedItem);
        return acc;
      }, []);
    };

    const updatedDeleteItems = deleteItems(updatedFolders);

    const existedFolder = await getAllFolders();
    if (!existedFolder?.length) {
      console.error("No existing folder found to update!");
      return;
    }

    await saveFolderToDB({ id: existedFolder[0].id, data: updatedDeleteItems });

    dispatch(setFolderData(updatedDeleteItems));
  };

  return {
    addFolder,
    renameFolder,
    deleteItem,
    calculateFolderSize,
    moveItem,
    copyItem,
  };
};
