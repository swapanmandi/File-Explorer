import { useDispatch, useSelector } from "react-redux";
import { setFolderData } from "../store/folderSlice.js";

export const useFolder = () => {
  const dispatch = useDispatch();
  const folderData = useSelector((state) => state.folder.folderData);

  const addFolder = (parentFolder, newFolderName) => {
    //console.log("p id-", parentFolder.id)
    const createFolder = {
      id: crypto.randomUUID() || Date.now(),
      name: newFolderName,
      type: "folder",
      createDate: new Date(),
      modifyDate: new Date(),
      content: "",
      size:"",
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

    const updatedFolders = addFolderRecursive(folderData)
    dispatch(setFolderData(updatedFolders));
    localStorage.setItem("data", JSON.stringify(updatedFolders));
  };

  const deleteFolder = (folderToDelete) => {
    const updatedFolders = (folders) => {
      return folders
        .filter((folder) => folder.name !== folderToDelete.name)
        .map((folder) => {
          if (folder?.children?.length > 0) {
            return { ...folder, children: updatedFolders(folder.children) };
          }
          return folder;
        });
    };

    const updatedData = updatedFolders(folderData);
    dispatch(setFolderData(updatedData));
    localStorage.setItem("data", JSON.stringify(updatedData));
  };

  const renameFolder = (folderToRename, newFolderName) => {
    const updatedFolders = (folders) => {
      return folders.map((folder) => {
        // Check if this is the folder to rename
        if (folder.name === folderToRename.name) {
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

  return { addFolder, renameFolder, deleteFolder };
};
