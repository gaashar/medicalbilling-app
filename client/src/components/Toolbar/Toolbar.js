import React, { Component } from "react";

import NavigationItems from "../NavigationItems/NavigationItems";
import classes from "./Toolbar.module.css";

class Toolbar extends Component {
    render() {
        return(
            <header className={classes.Toolbar}>
            <nav className={classes.DesktopOnly}>
                <NavigationItems />
            </nav>
        </header>
        )
    }
}

export default Toolbar;