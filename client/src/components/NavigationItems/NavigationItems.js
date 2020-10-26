import React from "react";

import classes from "./NavigationItems.module.css";
import NavigationItem from "./NavigationItem/NavigationItem";

const navigationItems = (props) => {
    return(
        <ul className={classes.NavigationItems}>
            <NavigationItem link="/" exact>Create Appointment</NavigationItem>
            <NavigationItem link="/View" exact>View Appointment</NavigationItem>
        </ul>
    );
};

export default navigationItems;