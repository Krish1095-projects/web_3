import React from "react";
import Faq from "./faq";
import { Implementation } from "./implementation";
import HeroComponent from "./Hero";
import HeaderComponent from "./Header";
import ProjectDetails from "./Project";
import DescriptionComponent from "./descriptionComponent";

const HomePage = () => {
  return (
    <div className="m-0 p-0">
    <HeaderComponent/>
    <HeroComponent />
    <Implementation/>
    <ProjectDetails/>
    <Faq/>
    <DescriptionComponent/>
    
    </div>
  );
};
export default HomePage;
