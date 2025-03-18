import React, { useRef, useState, useEffect, memo } from "react";
import { useFolder } from "../hooks/useFolder.js";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentFolder, setSelectedItems, toggleFolder } from "../store/folderSlice.js";

const ChildFolder = memo(({ folder }) => {
  const [isRightClickOnFolder, setIsRightClickOnFolder] = useState(false);
  const [isClickNewFolder, setIsClickNewFolder] = useState(false);
  const [isClickRenameFolder, setIsClickRenameFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [renameFolderName, setRenameFolderName] = useState("");
  const [isRightClickOnFile, setIsRightClickOnFile] = useState(false);

  const currentFolder = useSelector((state) => state.folder.currentFolder);
  const openFolders = useSelector((state) => state.folder.openFolders);
  const isSelect  = useSelector((state) => state.folder.isSelect)
  const selectedItems = useSelector((state)=> state.folder.selectedItems)

 //console.log(selectedItems)

  const closeRef = useRef();

  

  const dispatch = useDispatch();

  const { addFolder, renameFolder, deleteItem } = useFolder();

  // if (!folder || Object.keys(folder).length === 0) {
  //   return <div className="text-white">Loading...</div>;
  // }

  const handleClickFolder = (item) => {
    dispatch(toggleFolder(item.id));
    dispatch(setCurrentFolder(item));
    setIsRightClickOnFolder(false);
  };

  const isFolderOpen = openFolders.includes(folder?.id);

  //console.log(isFolderOpen)

  const handleRightClickFolder = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsRightClickOnFolder(!isRightClickOnFolder);
  };

  const handleNewFolderSave = (parentFolder) => {
    //console.log("parent id:", id)
    addFolder(parentFolder, newFolderName);
    setIsClickNewFolder(false);
  };
  const handleDeleteFolder = async (data) => {
    await deleteItem([data.id]);
  };

  const handleRenameFolderSave = (data) => {
    renameFolder(data, renameFolderName);
    setIsClickRenameFolder(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      //
      if (closeRef.current && !closeRef.current.contains(e.target)) {
        setIsRightClickOnFolder(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const openFile = (file) => {
    try {
      const newTab = window.open();
      if (file.type.split("/")[0] === "audio") {
        newTab.document.write(`
          <audio controls>
          <source src="${file.content}" type="audio/mpeg">
          </audio>`);
      } else if (file.type.split("/")[0] === "image") {
        newTab.document.write(
          `<img style="height:400px; width:600px" src="${file.content}" />`
        );
      } else if (file.type.split("/")[0] === "video") {
        newTab.document.write(
          `<video width="320" height="240" controls>
  <source src="${file.content}" type="video/mp4">
</video>`
        );
      }
    } catch (error) {
      console.error("Error to open this file-", error);
    }
  };


  const handleRightClickOnFile = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsRightClickOnFolder(false);
  setIsRightClickOnFile(!isRightClickOnFile);
  }

 const handleDeleteFile = async (file) => {
  await deleteItem([file.id]);
    
  }

  const onChangeSelect =(e)=>{
    const {checked, value} = e.target;

    dispatch(
      setSelectedItems(
        checked
          ? [...selectedItems, value]
          : selectedItems.filter((item) => item !== value)
      )
    );
  }

  return (
    <div ref={closeRef} className="w-full">
      <div className={`flex flex-col justify-start`}>
        {/* main folder list */}
        <div>
          {folder?.type === "folder" && (
            <div
              onContextMenu={handleRightClickFolder}
              className="flex space-x-2"
            >
              {isClickRenameFolder ? (
                <div className="">
                  📁
                  <input
                    className=" bg-amber-50 text-black"
                    value={renameFolderName}
                    onChange={(e) => setRenameFolderName(e.target.value)}
                  ></input>
                  <button onClick={() => handleRenameFolderSave(folder)}>
                    Save
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => handleClickFolder(folder)}
                  className={` w-full m-1 grid grid-cols-2 hover:bg-amber-500 ${
                    currentFolder.id == folder.id ? "bg-slate-400 " : ""
                  }`}
                >
                  <div className="flex">
                    {isSelect && <input type="checkbox" value={folder.id} checked={selectedItems?.includes(folder?.id)}  onChange={onChangeSelect}></input>}
                
                  <h1 className="  text-left">📁{folder?.name}</h1>
                  </div>
                  <div className="">
                    {folder?.size < 1024000
                      ? (folder?.size / 1024)
                          .toFixed(2)
                          .toString()
                          .concat(" KB")
                      : (folder?.size / 1024000)
                          .toFixed(2)
                          .toString()
                          .concat(" MB")}
                  </div>
                </div>
              )}

              {isRightClickOnFolder && (
                <div className=" absolute ml-40 z-20 h-40 w-30 bg-amber-500">
                  <h1
                    onClick={() => {
                      setIsClickNewFolder(true);
                      setIsRightClickOnFolder(false);
                    }}
                  >
                    New Folder
                  </h1>
                  <h1
                    onClick={() => {
                      setIsClickRenameFolder(true);
                      setIsRightClickOnFolder(false);
                    }}
                  >
                    Rename
                  </h1>

                  <h1 onClick={() => handleDeleteFolder(folder)}>Delete</h1>
                </div>
              )}
            </div>
          )}

          {/* //create new folder */}
          {isClickNewFolder && (
            <div>
              📁
              <input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className=" bg-amber-50 text-black"
              ></input>
              <button onClick={() => handleNewFolderSave(folder)}>Save</button>
            </div>
          )}

          {folder?.type !== "folder" && (
            <div>
            <div onContextMenu={handleRightClickOnFile} className="grid grid-cols-2">
              <div className="flex">
            {isSelect && <input type="checkbox" value={folder.id} checked={selectedItems.includes(folder.id)}  onChange={onChangeSelect}></input>}
              <h1
                onClick={() => openFile(folder)}
                className=" w-full hover:bg-orange-400 m-1 flex"
              >
                📄{folder?.name}
              </h1>
              </div>
              <div className="">
                {folder?.size < 1024000
                  ? (folder?.size / 1024).toFixed(2).toString().concat(" KB")
                  : (folder?.size / 1024000)
                      .toFixed(2)
                      .toString()
                      .concat(" MB")}
              </div>
            </div>
             {isRightClickOnFile && (
              <div className=" absolute ml-40 z-20 h-40 w-30 bg-amber-500">
  

                <h1 onClick={() => handleDeleteFile(folder)}>Delete</h1>
              </div>
            )}
            </div>
          )}
         
          <div className=" flex justify-start pl-4">
            {isFolderOpen &&
              folder?.type === "folder" &&
              folder?.children.length == 0 && <div className="">Empty</div>}
          </div>
        </div>
        <div>
          {isFolderOpen && (
            <div className=" ml-2">
              {folder?.children.map((childItem, index) => (
                <ChildFolder key={index} folder={childItem} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default ChildFolder;
