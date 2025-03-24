import React, { useEffect } from "react";
import ChildFolder from "./ChildFolder";
import { useDispatch, useSelector } from "react-redux";
import { setFolderData } from "../store/folderSlice.js";
import { getAllFolders } from "../db/indexDB.js";

function Folder() {
  const dispatch = useDispatch();
  const folderData = useSelector((state) => state.folder.folderData);
  const searchData = useSelector((state) => state.folder.searchData);
  const sortData = useSelector((state) => state.folder.sortData);

  //console.log(searchData);

  useEffect(() => {
    const getFolders = async () => {
      const getIndexDbFolders = await getAllFolders();
      if (getIndexDbFolders) {
        dispatch(setFolderData(getIndexDbFolders));
      }
    };

    getFolders();
  }, []);

  if (!folderData || folderData.length === 0) {
    return (
      <div className="text-white text-center p-3">No folders available</div>
    );
  }

  const folders =
    searchData.length > 0
      ? searchData
      : sortData.length > 0
      ? sortData
      : folderData;

  return (
    <div className=" bg-slate-900 place-self-center rounded-md w-full p-10 min-h-[80dvh]">
      {folders.map((data, index) => (
        <ChildFolder key={index} folder={data} />
      ))}
    </div>
  );
}

export default React.memo(Folder);
