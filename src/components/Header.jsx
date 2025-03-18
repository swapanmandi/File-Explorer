import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFolder } from "../hooks/useFolder.js";
import {
  setSearchData,
  setFolderData,
  setSortData,
  setIsSelect,
} from "../store/folderSlice.js";
import { getAllFolders, saveFolderToDB } from "../db/indexDB.js";

export default function Header() {
  const [isClickNewFolder, setIsClickNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [query, setQuery] = useState("");
  const [order, setOrder] = useState("asc");
  const [sortBy, setSortBy] = useState("");

  //console.log("q", query);
  //console.log(files);

  const dispatch = useDispatch();

  const { addFolder, calculateFolderSize, deleteItem } = useFolder();
  const currentFolder = useSelector((state) => state.folder.currentFolder);
  const folderData = useSelector((state) => state.folder.folderData);
  const isSelect = useSelector((state) => state.folder.isSelect);
  const selectedItems = useSelector((state) => state.folder.selectedItems);

  const uploadRef = useRef();

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
    const existedFolders = await getAllFolders();
    await saveFolderToDB({ id: existedFolders[0].id, data: updatedFolders });

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
        //await saveFileToDB(newFile);
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

  const handleDeleteItems = async () => {
    await deleteItem(selectedItems);
  };

  return (
    <div>
      {isSelect ? (
        <div className="flex">
          <button>COPY</button>
          <button>PASTE</button>
          <button>MOVE</button>
          <button onClick={handleDeleteItems}>DELETE</button>
        </div>
      ) : (
        <div className=" bg-slate-500 flex justify-between items-center p-2">
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
            <input
              type="radio"
              name="order"
              value="asc"
              onChange={(e) => setOrder(e.target.value)}
              checked
            />
            <label>ASC</label>
            <input
              type="radio"
              name="order"
              value="dsc"
              onChange={(e) => setOrder(e.target.value)}
            />
            <label>DSC</label>

            <select
              onChange={(e) => setSortBy(e.target.value)}
              className=" bg-slate-500"
            >
              <option value="name">Name</option>
              <option value="date">Date</option>
              <option value="size">Size</option>
            </select>
          </div>
          <button onClick={() => uploadRef.current.click()}>Upload</button>
          <input
            className=" hidden"
            ref={uploadRef}
            type="file"
            onChange={handleFileUpload}
          />
          <button onClick={() => dispatch(setIsSelect(!isSelect))}>
            Slect
          </button>
        </div>
      )}
    </div>
  );
}
