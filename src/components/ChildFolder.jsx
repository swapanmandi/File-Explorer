import React, { useRef, useState, useEffect } from "react";

export default function ChildFolder({
  folder,
  addFolder,
  deleteFolder,
  renameFolder,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isClickFolder, setIsClickFolder] = useState(false);
  const [isClickNewFolder, setIsClickNewFolder] = useState(false);
  const [isClickRenameFolder, setIsClickRenameFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [renameFolderName, setRenameFolderName] = useState("");

  const closeRef = useRef();

  const handleClickFolder = () => {
    setIsOpen(!isOpen);
  };

  const rightClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsClickFolder(!isClickFolder);
  };

  const handleNewFolderSave = (data) => {
    addFolder(data, newFolderName);
    setIsClickNewFolder(false);
  };
  const handleDeleteFolder = (data) => {
    deleteFolder(data);
  };

  const handleRenameFolderSave = (data) => {
    renameFolder(data, renameFolderName);
    setIsClickRenameFolder(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      //
      if (closeRef.current && !closeRef.current.contains(e.target)) {
        setIsClickFolder(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={closeRef} className=" flex items-center justify-center">
      <div className={`   bg-red-300 w-md  flex flex-col justify-start`}>
        <div>
          {folder.type === "folder" && (
            <div onContextMenu={rightClick} className="flex space-x-2">
              {isClickRenameFolder ? (
                <div>
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
                <h1
                  onClick={() => handleClickFolder(folder)}
                  className={`  m-1 w-fit flex`}
                >
                  📁{folder.name}
                </h1>
              )}

              {isClickFolder && (
                <div className=" absolute ml-40 z-20 h-40 w-30 bg-amber-500">
                  <h1
                    onClick={() => {
                      setIsClickNewFolder(true);
                      setIsClickFolder(false);
                    }}
                  >
                    New Folder
                  </h1>
                  <h1
                    onClick={() => {
                      setIsClickRenameFolder(true);
                      setIsClickFolder(false);
                    }}
                  >
                    Rename
                  </h1>

                  <h1 onClick={() => handleDeleteFolder(folder)}>Delete</h1>
                </div>
              )}
            </div>
          )}

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
          {folder.type === "file" && (
            <h1 className=" w-fit m-1 flex">📄{folder.name}</h1>
          )}
          <div className=" flex justify-start pl-4">
            {isOpen &&
              folder.type == "folder" &&
              folder.children.length == 0 && <div className="">Empty</div>}
          </div>
        </div>
        <div>
          {isOpen && (
            <div>
              {folder?.children?.map((childItem, index) => (
                <div className=" ml-2">
                  <ChildFolder
                    key={index}
                    folder={childItem}
                    addFolder={addFolder}
                    deleteFolder={deleteFolder}
                    renameFolder={renameFolder}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
