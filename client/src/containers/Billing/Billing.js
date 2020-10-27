import React,{ Component } from "react";
import { withRouter } from "react-router-dom";

import Header from "../../components/Header/Header";
import Button from "../../components/UI/Button/Button";
import Table from "../../components/UI/Table/Table";

import classes from "./Billing.module.css";

class Billing extends Component {
    state ={
        patientDetails: {},
        payableAmount: 0,
        payMode: 'Cash',
        inValidAmount: false,
        tableInput: [],
        disablePay: false
    }

    componentDidMount() {
        const query = new URLSearchParams(this.props.location.search);
        
        let patientId;
        for (let param of query.entries()) {
            if (param[0] === 'patientId') {
                patientId = param[1];
                
                fetch("http://localhost:3001/patient/" + patientId)
                .then(res => res.json())
                .then(data => {
                    if(data.transactions.length > 0) {
                        this.checkTransactionTableDisplay(data)
                    } 
                    else {
                        this.setState({ patientDetails: data })
                    }
                })
                .catch(err => console.log(err))
            }
        }
        
    }

    checkTransactionTableDisplay = (data) => {
        let updatedTableData = [];
        data.transactions.map(txn => {
            let tableData = {
                date: txn.txnDate,
                paidAmount: txn.paidAmount,
                paymentMode: txn.paymentMode
            }
            updatedTableData.push(tableData);
        })
        if(data.totalBalance == 0) {
            this.setState({
                patientDetails: data,
                tableInput: updatedTableData,
                disablePay: true
            })
        }

        this.setState({
            patientDetails: data,
            tableInput: updatedTableData
        })
    }

    onPaymentDetailsInput = (e) => {
        let fieldName = e.target.name;
        let totalBalance = this.state.patientDetails.totalBalance;
        let noOfTransactions = this.state.patientDetails.transactions.length;
        if (fieldName === 'payableAmount') {
            let payingAmount = e.target.value;
            let validPayableAmount = totalBalance * (20 / 100);
            if (noOfTransactions < 2 && payingAmount !== 0 && ( payingAmount >= validPayableAmount && payingAmount <= totalBalance)) {
                this.setState({
                    [fieldName] : payingAmount,
                    inValidAmount: false
                });
            }
            else if(noOfTransactions == 2 && payingAmount !== 0 && payingAmount == totalBalance ) {
                this.setState({
                    [fieldName] : totalBalance,
                    inValidAmount: false
                });
            }
            else {
                this.setState({inValidAmount: true})
            }
        }

        this.setState({[fieldName] : e.target.value});
    }

    saveBillingTransaction = (e) => {
        e.preventDefault();
        const { payableAmount, payMode, patientDetails : { id, totalBalance, amountPaid}, patientDetails } = this.state;
        if( totalBalance > 0 && payableAmount > 0 && payableAmount <= totalBalance) {
            let transactionDetails = {
                txnDate: (new Date()).toLocaleDateString(),
                paidAmount: payableAmount,
                paymentMode: payMode
            }
            let updatedPatientDetails = {...this.state.patientDetails};
            updatedPatientDetails["totalBalance"] = parseInt(totalBalance) - parseInt(payableAmount);
            updatedPatientDetails["amountPaid"] = parseInt(amountPaid) + parseInt(payableAmount);
            if(updatedPatientDetails.totalBalance > 0) {
                updatedPatientDetails["status"] = "Due Billed";
            }
            else if(updatedPatientDetails.totalBalance == 0) {
                updatedPatientDetails["status"] = "Fully Billed";
            }
            updatedPatientDetails.transactions.push(transactionDetails);
            fetch("http://localhost:3001/patient/" + id, {
                method: "PUT",
                body: JSON.stringify(updatedPatientDetails),
                headers: { 
                    "Content-type": "application/json; charset=UTF-8"
                } 
            })
            .then(res => res.json())
            .then(data => {
                this.checkTransactionTableDisplay(updatedPatientDetails);
            })
            .catch(error => console.log(error))
        }
        else {
            this.setState({inValidAmount: true})
        }
    }

    render() {
        const { patientDetails : { id, name, age, gender, amount, totalDiscount, totalBalance, amountPaid}, payableAmount, payMode, inValidAmount } = this.state;

        let cardInputFields = null;
        if(payMode == "Card") {
            cardInputFields = (<div className={classes.CardDetails}>
                <input name="cardHolderName" type="text" placeholder="CardHolder's Name"/>
                <input name="cardNumber" type="text" placeholder="CardNumber"/>
                <div>
                    <label>Expiry</label>
                    <input name="expiryDate" type="month" />
                </div>
                <input name="cvv" type="text" placeholder="CVV"/>
                <span>128-bit Secured</span>
            </div>);
        }

        let tableHeaders = {
            sNo: "SNo",
            date: "Date",
            paidAmount: "Paid Amount",
            paymentMode: "Payment Mode"
        }

        return (
            <div>
                <Header name="Patient Billing" />
                <div className={classes.Billing}>
                    <div>
                        <div className={classes.PatientDetails}>
                            <p>Current Billing Status</p>
                            <table>
                                <tbody>
                                    <tr><td>Patient Name</td><td>{name}</td></tr>
                                    <tr><td>PatientID</td><td>{id}</td></tr>
                                    <tr><td>Age/Gender</td><td>{age}/{gender}</td></tr>
                                    <tr><td>Total Amount</td><td>{amount} INR</td></tr>
                                    <tr><td>Discount</td><td>{totalDiscount} INR</td></tr>
                                    <tr><td>Paid Amount</td><td>{amountPaid} INR</td></tr>
                                    <tr><td>Balance</td><td>{totalBalance} INR</td></tr>
                                </tbody>
                            </table>
                        </div>
                        <div className={classes.PayBill}>
                            <div>
                                <label>Payable Amount:</label>
                                <input
                                    name="payableAmount"
                                    type="text"
                                    value={payableAmount}
                                    onChange={this.onPaymentDetailsInput}
                                    disabled={this.state.disablePay}
                                    required
                                />
                                {inValidAmount && <span style={{color: 'red'}}>Invalid Amount</span>}
                            </div>
                            <div>
                                <label>Payment Mode:</label>
                                <select name="payMode" value={payMode} onChange= {this.onPaymentDetailsInput} disabled={this.state.disablePay}>
                                    <option value="Cash">Cash</option>
                                    <option value="Card">Card</option>
                                </select>
                            </div>
                            <div>
                                {cardInputFields}
                            </div>
                        </div>
                        <Button clicked={this.saveBillingTransaction} disabled={this.state.disablePay}>Save</Button>
                    </div>
                    <div>
                        {this.state.tableInput.length > 0 &&
                        <>
                            <p>Previous Transactions</p>
                            <Table tableData={this.state.tableInput} tableHeader={tableHeaders}/>
                        </>}
                    </div>
                </div>
            </div>
        )
    }
}

export default withRouter(Billing);