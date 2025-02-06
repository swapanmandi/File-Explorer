import React, { useEffect, useState } from "react";
import ChildFolder from "./ChildFolder";

export default function Folder() {
  const [folderData, setFolderData] = useState([
    {
      name: "Documents",
      type: "folder",
      children: [
        {
          name: "PDF",
          type: "folder",
          children: [
            {
              name: "book.pdf",
              type: "file",
              children: [],
            },
          ],
        },
        {
          name: "react.txt",
          type: "file",
          children: [],
        },
      ],
    },
    {
      name: "Downloads",
      type: "folder",
      children: [
        {
          name: "image.jpeg",
          type: "file",
          children: [],
        },
      ],
    },
    {
      name: "Videos",
      type: "folder",
      children: [],
    },
    {
      name: "nextJs.mp4",
      type: "file",
      children: [],
    },
  ]);

  useEffect(() => {
    const localStorageData = JSON.parse(localStorage.getItem("data"));
    if (localStorageData?.length > 0) setFolderData(localStorageData);
  }, []);

  const addFolder = (parentFolder, newFolderName) => {
    const createFolder = { name: newFolderName, type: "folder", children: [] };

    const updatedFolders = (folders) => {
      return folders.map((folder) => {
        if (folder == parentFolder) {
          return { ...folder, children: [...folder.children, createFolder] };
        } else if (folder?.children?.length > 0) {
          return { ...folder, children: updatedFolders(folder.children) };
        }
        return folder;
      });
    };
    setFolderData(updatedFolders(folderData));
    localStorage.setItem("data", JSON.stringify(updatedFolders(folderData)));
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
    setFolderData(updatedData);
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
    setFolderData(updatedData);
    localStorage.setItem("data", JSON.stringify(updatedData));
  };

  return (
    <div className=" bg-amber-200 place-self-center">
      <div>
        {folderData?.map((data, index) => (
          <ChildFolder
            key={index}
            folder={data}
            addFolder={addFolder}
            deleteFolder={deleteFolder}
            renameFolder={renameFolder}
          />
        ))}
      </div>
    </div>
  );
}
