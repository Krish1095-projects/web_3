import React, { useEffect, useRef } from "react";
import HeroComponent from "./Hero";
import HeaderComponent from "./Header";
import DetailsComponent from "./DetailsComponent";

const DetailsPage = () => {
  return (
    <div className="m-0 p-0">
    <HeaderComponent/>
    <HeroComponent />
    <DetailsComponent/>
    </div>
  );
};
export default DetailsPage;
