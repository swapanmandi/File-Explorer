import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFolder } from "../hooks/useFolder.js";
import {
  setSearchData,
  setFolderData,
  setSortData,
} from "../store/folderSlice.js";
import {
  saveFileToDB,
  getFilesFromDB,
  deleteFileFromDB,
} from "../db/indexDB.js";

export default function Header() {
  const [isClickNewFolder, setIsClickNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [query, setQuery] = useState("");
  const [order, setOrder] = useState("asc");
  const [sortBy, setSortBy] = useState("");

  //console.log("q", query);
  //console.log(files);

  const dispatch = useDispatch();

  const { addFolder, calculateFolderSize } = useFolder();
  const currentFolder = useSelector((state) => state.folder.currentFolder);
  const folderData = useSelector((state) => state.folder.folderData);

  //console.log("c folder", currentFolder)

  const handleNewFolderSave = () => {
    addFolder(currentFolder, newFolderName);
    setIsClickNewFolder(false);
  };

  //search
  useEffect(() => {
    const searchResults = [];
    const searchData = (data) => {
      data.forEach((item) => {
        const matchParentFolder =
          item.name.toLowerCase().includes(query.trim().toLowerCase()) &&
          query.trim() != "";

        if (matchParentFolder) {
          searchResults.push(item);
        }

        if (item.children && item.children.length > 0) {
          searchData(item.children);
        }
      });
    };
    searchData(folderData);
    dispatch(setSearchData(searchResults));
  }, [query]);

  //sort
  useEffect(() => {
    const sortFolder = (data, order, sortBy) => {
      return [...data]
        .map((folder) => ({
          ...folder,
          children: folder?.children ? sortFolder(folder.children, order) : [],
        }))
        .sort((a, b) => {
          if (sortBy === "size") {
            return order === "asc" ? a.size - b.size : b.size - a.size;
          } else if (sortBy === "date") {
            return order === "asc"
              ? new Date(a.createDate) - new Date(b.createDate)
              : new Date(b.createDate) - new Date(a.createDate);
          } else {
            return order === "asc"
              ? a.name.localeCompare(b.name)
              : b.name.localeCompare(a.name);
          }
        });
    };
    //console.log("sd", sortFolder(folderData, order));
    dispatch(setSortData(sortFolder(folderData, order, sortBy)));
  }, [order, sortBy]);

  const addFile = (folderData, newFile) => {
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

    localStorage.setItem("data", JSON.stringify(updatedFolders));

    setNewFolderName("");
  };

  const handleFileUpload = (e) => {
    const uploadFile = e.target.files[0];
    if (!uploadFile) return;

    if (uploadFile.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit.");
      return;
    }

    const reader = new FileReader();

    reader.readAsDataURL(uploadFile);

    reader.onload = async () => {
      const newFile = {
        id: crypto.randomUUID() || Date.now(),
        name: uploadFile.name,
        type: uploadFile.type,
        children: [],
        size: uploadFile.size,
        createDate: new Date(),
        modifyDate: new Date(),
        content: reader.result,
      };

      try {
        await saveFileToDB(newFile);
        addFile(folderData, newFile);
      } catch (error) {
        console.error("Error saving file:", error);
        alert("Failed to save file. Please try again.");
      }
    };

    reader.onerror = () => {
      console.error("File reading failed");
      alert("Failed to read file.");
    };
  };

  return (
    <div>
      <button onClick={() => setIsClickNewFolder(true)}>New Folder</button>
      {isClickNewFolder && (
        <div>
          📁
          <input
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            className=" bg-amber-50 text-black"
          ></input>
          <button onClick={() => handleNewFolderSave()}>Save</button>
        </div>
      )}

      <input
        value={query}
        placeholder="search"
        onChange={(e) => setQuery(e.target.value)}
        className=" bg-blue-50 text-black"
      />
      <div className=" space-x-2">
        <button onClick={() => setOrder("asc")}>asc</button>
        <button onClick={() => setOrder("dsc")}>dsc</button>
        <button onClick={() => setSortBy("date")}>date</button>
        <button onClick={() => setSortBy("size")}>size</button>
      </div>
      <input type="file" onChange={handleFileUpload} />
    </div>
  );
}
