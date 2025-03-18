import React, { memo, useEffect, useState } from "react";
import ChildFolder from "./ChildFolder";
import { useDispatch, useSelector } from "react-redux";
import { setFolderData } from "../store/folderSlice.js";
import { getAllFolders } from "../db/indexDB.js";

 function Folder() {
  const [getFolders, setGetFolders] = useState([]);
  const dispatch = useDispatch();
  const folderData = useSelector((state) => state.folder.folderData);
  const searchData = useSelector((state) => state.folder.searchData);
  const sortData = useSelector((state) => state.folder.sortData);

  //console.log(searchData);

  useEffect(() => {
    const getFolders = async () => {
      const getIndexDbFolders = await getAllFolders();
      //console.log(getIndexDbFolders[0].data);
      if (getIndexDbFolders[0].data) {
        dispatch(setFolderData(getIndexDbFolders[0].data));
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
    <div className=" bg-slate-900 place-self-center rounded-md w-full lg:w-[60dvw] p-3 min-h-[80dvh]">
      {folders.map((data, index) => (
        <ChildFolder key={index} folder={data} />
      ))}
    </div>
  );
}


export default React.memo(Folder)