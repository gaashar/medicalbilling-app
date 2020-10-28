import React, { Component } from "react";

import Header from "../../components/Header/Header";
import Button from "../../components/UI/Button/Button";
import Table from "../../components/UI/Table/Table";
import { NavLink, withRouter } from "react-router-dom";

import classes from "./ViewAppointment.module.css";

class ViewAppointment extends Component {
    state = {
        fromDate: "",
        toDate: "",
        status: 'Not Yet Billed',
        search: "",
        tableInput: []
    }

    formInputHandler = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    getPatientsHandler = () => {
        const { fromDate, toDate, status } = this.state;
        let updatedTableData = [];
        fetch("http://localhost:3001/patient?fDate=" + fromDate + "&tDate=" + toDate + "&status=" + status)
        .then(res => res.json())
        .then(data => {
            data.map(patient => {
                let payBillLink = <NavLink to={{
                        pathname: "/patientBilling",
                        search: "?patientId=" + patient.id
                    }} 
                    activeStyle={{
                        fontWeight: "bold",
                        textDecoration: "none"
                    }}
                    exact>Click to Pay</NavLink>
                let tableValues = {
                    patientName : patient.name,
                    ageGender : patient.age + "-" + patient.gender,
                    apptDate : patient.apptDate,
                    balanceAmount : patient.totalBalance,
                    action: payBillLink
                }
                updatedTableData.push(tableValues);
            })
            this.setState({ tableInput: updatedTableData })
        })
        .catch(error => console.log(error))
    }

    render() {
        const { fromDate, toDate, status, search } = this.state;
        let tableHeaders = {
            sNo: "SNo",
            patientName: "Patient Name",
            ageGender: "Age-Gender",
            apptDate: "Appointment Date",
            balanceAmount: "Balance Amount",
            action: "Action"
        };
        
        return (
            <div>
                <Header name="View Appointment"/>
                <div className={classes.SearchForm}>
                    <label>From Date</label>
                    <input
                        name="fromDate"
                        type="date"
                        value={fromDate}
                        onChange= {this.formInputHandler}
                        required
                    />
                    <label>To Date</label>
                    <input
                        name="toDate"
                        type="date"
                        value={toDate}
                        onChange= {this.formInputHandler}
                        required
                    />
                    <label>Status</label>
                    <select name="status" value={status} onChange= {this.formInputHandler}>
                        <option value="Not Yet Billed">Not Yet Billed</option>
                        <option value="Due Billed">Due Billed</option>
                        <option value="Fully Billed">Fully Billed</option>
                    </select>
                    <label>Common Search</label>
                    <input
                        name="search"
                        type="text"
                        value={search}
                        onChange= {this.formInputHandler}
                    />
                    <Button clicked={this.getPatientsHandler} disabled={false}>Search</Button>
                    {this.state.tableInput.length > 0 ? <Table tableData={this.state.tableInput} tableHeader={tableHeaders}/> : null }
                </div>
            </div>
        )
    }
}

export default withRouter(ViewAppointment);