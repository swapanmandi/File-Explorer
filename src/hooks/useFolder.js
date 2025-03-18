import { useDispatch, useSelector } from "react-redux";
import { setFolderData } from "../store/folderSlice.js";
import {saveFolderToDB, getAllFolders, deleteAllFolders} from "../db/indexDB.js"

export const useFolder = () => {
  const dispatch = useDispatch();
  const folderData = useSelector((state) => state.folder.folderData);

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
    //console.log("p id-", parentFolder.id)
    const createFolder = {
      id: crypto.randomUUID() || Date.now(),
      name: newFolderName,
      type: "folder",
      createDate: new Date(),
      modifyDate: new Date(),
      content: "",
      size: "",
      parent:parentFolder.id || new Date(),
      children: [],
    };

    const addFolderRecursive = (folders) => {
      if (!parentFolder?.id) return [...folders, createFolder];

      return folders.map((folder) => {
        //console.log("folder name :", folder.name)
        if (folder.id === parentFolder.id) {
          return { ...folder, children: [...folder.children, createFolder] };
        } else if (folder?.children?.length > 0) {
          return { ...folder, children: addFolderRecursive(folder.children) };
        }
        return folder;
      });
    };

    const updatedFolders = addFolderRecursive(folderData);
    const existedFolder = await getAllFolders()
   
    await saveFolderToDB({id:existedFolder[0].id, data:updatedFolders})
    dispatch(setFolderData(updatedFolders));
   
  };



  const deleteItem = async(fileToDelete) => {
    const updatedFolders = (folders) => {
      return folders
        .filter((folder) => folder?.id !== fileToDelete?.id)
        .map((folder) => {
          if (folder?.children?.length > 0) {
            return { ...folder, children: updatedFolders(folder.children) };
          }
          return folder;
        });
    };

    const updatedData = updatedFolders(folderData);
    dispatch(setFolderData(updatedData));
    const existedFolder = await getAllFolders()
   
    await saveFolderToDB({id:existedFolder[0].id, data:updatedData})
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

  return { addFolder, renameFolder, deleteItem, calculateFolderSize, };
};
