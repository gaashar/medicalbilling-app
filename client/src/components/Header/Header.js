import React from "react";

import classes from "./Header.module.css";

const Header = (props) => {
    return(
        <div className={classes.Header}>
            <h4>
                {props.name}
            </h4>
            <hr></hr>
        </div>
    );
};

export default Header;