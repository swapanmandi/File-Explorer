import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFolder } from "../hooks/useFolder.js";
import { setSearchData } from "../store/folderSlice.js";

export default function Header() {
  const [isClickNewFolder, setIsClickNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [query, setQuery] = useState("");

  console.log("q", query);

  const dispatch = useDispatch();

  const { addFolder } = useFolder();
  const currentFolder = useSelector((state) => state.folder.currentFolder);
  const folderData = useSelector((state) => state.folder.folderData);

  const handleNewFolderSave = () => {
    addFolder(currentFolder, newFolderName);
    setIsClickNewFolder(false);
  };

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
        onChange={(e) => setQuery(e.target.value)}
        className=" bg-blue-50 text-black"
      ></input>
    </div>
  );
}
