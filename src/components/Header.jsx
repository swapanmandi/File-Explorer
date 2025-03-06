import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFolder } from "../hooks/useFolder.js";
import {
  setSearchData,
  setFolderData,
  setSortData,
} from "../store/folderSlice.js";

export default function Header() {
  const [isClickNewFolder, setIsClickNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [query, setQuery] = useState("");
  const [order, setOrder] = useState("asc");
  const [sortBy, setSortBy] = useState("");

  //console.log("q", query);
  //console.log(sortType)
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

  useEffect(() => {
    const sortFolder = (data, order, sortBy) => {
      return [...data]
        .map((folder) => ({
          ...folder,
          children: folder.children ? sortFolder(folder.children, order) : [],
        }))
        .sort((a, b) => {
          if (sortBy === "size") {
            return order === "asc" ? a.size.split(" ")[0] - b.size.split(" ")[0] : b.size.split(" ")[0] - a.size.split(" ")[0];
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
    console.log("sd", sortFolder(folderData, order));
    dispatch(setSortData(sortFolder(folderData, order, sortBy)));
  }, [folderData, order, sortBy]);

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
      />
      <div className=" space-x-2">
        <button onClick={() => setOrder("asc")}>asc</button>
        <button onClick={() => setOrder("dsc")}>dsc</button>
        <button onClick={() => setSortBy("date")}>date</button>
        <button onClick={() => setSortBy("size")}>size</button>
      </div>
    </div>
  );
}
