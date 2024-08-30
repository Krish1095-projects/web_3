import React from "react";
import HeroComponent from "./Hero";
import HeaderComponent from "./Header";
import ProposedWork from './ProposedWork';

const ProposedPage = () => {
  return (
    <div className="m-0 p-0">
    <HeaderComponent/>
    <HeroComponent />
    <ProposedWork />
    </div>
  );
};
export default ProposedPage;
