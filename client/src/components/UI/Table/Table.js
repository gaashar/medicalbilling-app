import React from "react";

import classes from "./Table.module.css";

const table = (props) => {

    let sNo = 0;
    const headerKeys = Object.keys(props.tableHeader);
    const items = props.tableData;
    const getTableHeaderRow = () => {
        return headerKeys.map((key, index) => {
            return <th key={key}>{props.tableHeader[key]}</th>
         })
    }

    const getTableRow = () => {
        return items.map((row, index) => (
            <tr key={index}>{headerKeys.map((key, index) => {
                if(index === 0) {
                    sNo+=1;
                    return <td key={row[key]}>{sNo}</td>
                }
                return <td key={row[key]}>{row[key]}</td>
            })}</tr>
        ))
    }

    return (
        <table className= {classes.Table}>
            <tbody>
                <tr>{getTableHeaderRow()}</tr>
                {getTableRow()}
            </tbody>
        </table>
    )
}

export default table;