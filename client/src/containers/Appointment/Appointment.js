import React, { Component } from "react";

import Header from "../../components/Header/Header";
import Button from "../../components/UI/Button/Button";
import Table from "../../components/UI/Table/Table";

import classes from "./Appointment.module.css";

const SLOTS = {
    "CT" : 7,
    "MRI" : 6,
    "LAB" : null
}

class Appointment extends Component {
    initialState = {
        patientData: {
            patient: '',
            gender: 'Male',
            dob: '',
            age: '',
            apptDate: '',
            phone:'',
            ageQuantifier: 'years',
            salutation: 'mr',
            address :{
                street: '',
                street1: '',
                city: '',
                state: '',
                zipCode: '',
                country: ''
            }
        },
        billDetails: [],
        medicalBills: [],
        selectedMedicalBill: '',
        selectedBillAmount: 0,
        selectedModality: '',
        validDiscount: 0,
        inValidDiscountError: false,
        disableAdd: true,
        slotsAvailable: true
    };

    state = this.initialState;

    updatePatientData = (e) => {
        const newpatientData = {...this.state.patientData};
        newpatientData[e.target.name] = e.target.value; 
        if(e.target.name === "apptDate" && !this.state.inValidDiscountError) {
            this.setState({ 
                patientData: newpatientData, 
                disableAdd: false
            });
        }
        this.setState({ patientData: newpatientData });
    }

    onSalutationChange = (e) => {
        const newpatientData = {...this.state.patientData};
        newpatientData[e.target.name] = e.target.value;
        let input = e.target.value;

        if (input === "mr") {
            newpatientData.gender = "Male";
        }
        else if (input === "ms") {
            newpatientData.gender = "Female";
        }
        this.setState({ patientData: newpatientData });
    }

    onGenderChange = (e) => {
        const newpatientData = {...this.state.patientData};
        newpatientData[e.target.name] = e.target.value;
        let input = e.target.value;

        if(input === "Male") {
            newpatientData.salutation = "mr";
        }
        else if (input === "Female") {
            newpatientData.salutation = "ms";
        }
        this.setState({ patientData: newpatientData });
    }

    onDobChange = (e) => {
        const newpatientData = {...this.state.patientData};
        newpatientData[e.target.name] = e.target.value; 

        let today = new Date();
        let inputDate;
        let ageQuantifier;
        if(e.target.name === "ageQuantifier") {
            inputDate = (this.state.patientData.dob) ? new Date(this.state.patientData.dob) : "";
            ageQuantifier = e.target.value;
        }
        else {
                inputDate = new Date(e.target.value);
                ageQuantifier = this.state.patientData.ageQuantifier;
        }
        console.log(inputDate);
        if(inputDate !== "") {
            let timeDiff = today - inputDate;
            
            let years = Math.floor(timeDiff / (365 * 24 * 60 * 60 * 1000));
            if(ageQuantifier == "years") {
                newpatientData.age = years;
            }
            if(ageQuantifier == "months") {
                newpatientData.age = Math.floor(years * 12);
            }
            if(ageQuantifier == "days") {
                newpatientData.age = Math.floor(timeDiff / (24 * 60 * 60 * 1000));
            }
        }

        this.setState({ patientData: newpatientData });
    }

    onAgeChange= (e) => {
        const newpatientData = {...this.state.patientData};
        newpatientData[e.target.name] = e.target.value;

        let input = e.target.value;
        let ageQuantifier = this.state.patientData.ageQuantifier;
        let timeNow = new Date().getTime();

        if(ageQuantifier == "years") {          
            let newDob = new Date(timeNow - (input * 365 * 24 * 60 * 60 * 1000));
            newpatientData.dob = newDob.toISOString().split('T')[0];
        }
        if(ageQuantifier == "months") {
            let newDob = new Date(timeNow - (input * 30 * 24 * 60 * 60 * 1000));
            newpatientData.dob = newDob.toISOString().split('T')[0];
        }
        if(ageQuantifier == "days") {
            let newDob = new Date(timeNow - (input * 24 * 60 * 60 * 1000));
            newpatientData.dob = newDob.toISOString().split('T')[0];
        }
        this.setState({ patientData: newpatientData });
    }

    updatePatientAddress = (e) => {
        const updatedAddress = {...this.state.patientData["address"]};
        updatedAddress[e.target.name] = e.target.value;
        const updatedPatientData = {
            ...this.state.patientData,
            address: updatedAddress
        }
        this.setState({ patientData: updatedPatientData });
    }

    componentDidMount () {
        fetch("http://localhost:3001/medicalbills")
        .then(res => res.json())
        .then(data => this.setState({ medicalBills: data.medicalBills })
        )
        .catch(err => {
            console.log(err);
        })
    }

    onBillSelect = (e) => {
        let billName = e.target.value;
        this.state.medicalBills.map(medicalBill => {
            if(medicalBill.medicalBillName === billName){
                this.setState({
                    selectedBillAmount: medicalBill.amount,
                    selectedMedicalBill: medicalBill.medicalBillName,
                    selectedModality: medicalBill.modality
                })
            }
        })
    }

    validateInputDiscount = (e) => {
        let inputDiscount = e.target.value;
        let actualDiscount = 0;
        let billAmount = 0;
        if (inputDiscount < 0) {
            this.setState({inValidDiscountError: true});
            return;
        }
        this.state.medicalBills.map(medicalBill => {
            if(medicalBill.medicalBillName == this.state.selectedMedicalBill){
                billAmount = medicalBill.amount;
                actualDiscount = medicalBill.maxDiscount;
            }
        });
        if(actualDiscount.trim().endsWith("INR")) {
            actualDiscount = parseInt(actualDiscount.replace("INR",'').trim());
        }
        else if(actualDiscount.trim().endsWith("%")) {
            actualDiscount =  billAmount * ( parseInt(actualDiscount.replace("%",'').trim()) / 100 );
        }
        if (inputDiscount <= actualDiscount) {
            this.setState({
                validDiscount: inputDiscount,
                inValidDiscountError: false
            })
        } else {
            this.setState({
                inValidDiscountError: true
            });
        }
    }

    addMedicallBill = (e) => {
        e.preventDefault();
        
        const { selectedModality } = this.state;
        const { patientData: { apptDate} } = this.state;
        
        if (selectedModality !== "LAB") {
            fetch("http://localhost:3001/billslots?date="+apptDate+"&modality=" +selectedModality)
            .then(res => res.json())
            .then(data => {
                let slots= data.slots;
                if (slots < SLOTS[selectedModality]) {
                    this.saveSlotsForDateHandler();
                }
                else{
                    this.setState({ slotsAvailable: false })
                }
            })
            .catch(err => console.log(err));
        } else {
            this.saveSlotsForDateHandler();
        }
        
    }

    saveSlotsForDateHandler = () => {
        const { selectedMedicalBill, selectedBillAmount, validDiscount, selectedModality } = this.state;
        const { patientData: { apptDate} } = this.state;

        if( selectedMedicalBill !== '' && selectedBillAmount !==0 && validDiscount !==0) {
            let addedBill = {
                scanName: selectedMedicalBill,
                scanAmount: selectedBillAmount,
                discount: validDiscount,
                totalAmount: selectedBillAmount - validDiscount
            }
            let updatedBillDetails = this.state.billDetails.concat(addedBill);
            let slotPerDay = {
                date: apptDate,
                modality: selectedModality,
                slots: 1
            }
            fetch("http://localhost:3001/billslots", {
                method: "POST",
                body: JSON.stringify(slotPerDay),
                headers: { 
                    "Content-type": "application/json; charset=UTF-8"
                } 
            })
            .then(res => res.json())
            .then(result => console.log(result))
            .catch(error => console.log(error))
            this.setState({
                slotsAvailable: true,
                billDetails: updatedBillDetails});
        }
    }

    savePatientDetails = (e) => {
        let id = 'P_' + Math.random().toString(16).substr(2, 6);

        const { patientData : { patient, age, gender, apptDate }, billDetails } = this.state;
        let amount=0, totalDiscount=0, totalBalance=0, amountPaid;

        billDetails.map(bill => {
            amount += parseInt(bill.scanAmount);
            totalDiscount += parseInt(bill.discount);
            totalBalance += parseInt(bill.totalAmount);
        })
        
        let patientFormData = {
            id: id,
            status: "Not Yet Billed",
            name: patient,
            age: age,
            gender: gender,
            apptDate: apptDate,
            amount: amount,
            totalDiscount: totalDiscount,
            totalBalance: totalBalance,
            amountPaid: 0,
            transactions : []
        }

        fetch("http://localhost:3001/patient", {
            method: "POST",
            body: JSON.stringify(patientFormData),
            headers: { 
                "Content-type": "application/json; charset=UTF-8"
            } 
        })
        .then(res => res.json())
        .then(result => {
            console.log(result);
        })
        .catch(error => console.log(error));
    }

    render() {
        const { patientData: { patient, gender, dob, age, apptDate, phone, ageQuantifier, salutation } } = this.state;
        const { patientData: { address: { street, street1, city, state, zipCode, country } } } = this.state;
        let tableHeaders = {
            sNo: "SNo",
            scanName: "Scan Name",
            scanAmount: "Scan Amount",
            discount: "Discount",
            totalAmount: "Total Amount"
        };
        return (
            <div>
                <form>
                    <Header name="Patient Details"/>
                    <div className={classes.ApptForm}>
                        <div>
                            <label className={classes.Label}>Patient name</label>
                            <select name="salutation" value={salutation} onChange={this.onSalutationChange}>
                                <option value="mr">Mr.</option>
                                <option value="ms">Mrs./Ms.</option>
                            </select>
                            <input
                                name="patient"
                                type="text"
                                value={patient}
                                onChange={this.updatePatientData}
                                required
                            />
                        </div>
                        <div>
                            <label>Gender</label>
                            <input
                                name="gender"
                                type="radio"
                                value="Male"
                                checked={gender === "Male"}
                                onChange={this.onGenderChange}
                            />
                            <span>Male</span>
                            <input
                                name="gender"
                                type="radio"
                                value="Female"
                                checked={gender === "Female"}
                                onChange={this.onGenderChange}
                            />
                            <span>Female</span>
                        </div>
                        <div>
                            <label>DOB</label>
                            <input
                                name="dob"
                                type="date"
                                value={dob}
                                onChange={this.onDobChange}
                                required
                            />
                        </div>
                        <div>
                            <label>Age</label>
                            <input
                                name="age"
                                type="text"
                                value={age}
                                onChange={this.onAgeChange}
                                required
                            />
                            <select name="ageQuantifier" id="ageQ" value={ageQuantifier} onChange={this.onDobChange}>
                                <option value="years">Years</option>
                                <option value="months">Months</option>
                                <option value="days">Days</option>
                            </select>
                        </div>
                        <div>
                            <label>Appointment Date</label>
                            <input
                                name="apptDate"
                                type="date"
                                value={apptDate}
                                onChange={this.updatePatientData}
                                required
                            />
                        </div>
                        <div>
                            <label>Phone No</label>
                            <input
                                name="phone"
                                type="text"
                                value={phone}
                                onChange={this.updatePatientData}
                                required
                            />
                        </div>
                        <div className={classes.AddressLayout}>
                            <label>Address</label>
                            <input
                                name="street"
                                type="text"
                                value={street}
                                placeholder="Street Address"
                                onChange={this.updatePatientAddress}
                                required
                            />
                            <input
                                name="street1"
                                type="text"
                                value={street1}
                                placeholder="Street Address 2"
                                onChange={this.updatePatientAddress}
                                required
                            />
                            <input
                                name="city"
                                type="text"
                                value={city}
                                placeholder="City"
                                onChange={this.updatePatientAddress}
                                required
                            />
                            <input
                                name="state"
                                type="text"
                                value={state}
                                placeholder="State/Province"
                                onChange={this.updatePatientAddress}
                                required
                            />
                            <input
                                name="zipCode"
                                type="text"
                                value={zipCode}
                                placeholder="Postal/Zipcode"
                                onChange={this.updatePatientAddress}
                                required
                            />
                            <input
                                name="country"
                                type="text"
                                value={country}
                                placeholder="Country"
                                onChange={this.updatePatientAddress}
                                required
                            />
                        </div>
                    </div>
                    <Header name="Medical Scan Details"/>
                    <div className={classes.ScanForm}>
                        <div>
                            <label>Scan List</label>
                            <input list="billNames" id="billName" onChange={this.onBillSelect} required></input>
                            <datalist id="billNames">
                                {this.state.medicalBills.map(medicalBill => 
                                    <option value={medicalBill.medicalBillName} key={medicalBill.id}/>
                                )}
                            </datalist>
                            <label>Scan Amount</label>
                            <span style={{color: 'blue', fontWeight: 'bold'}}>{this.state.selectedBillAmount}</span>
                            <label>Discount</label>
                            <input type="text" onChange={this.validateInputDiscount} required/>
                            {this.state.inValidDiscountError && <span style={{color: 'red'}}>Enter a valid discount amount</span>}
                            <Button clicked={this.addMedicallBill} disabled={this.state.disableAdd}>Add</Button>
                            {!this.state.slotsAvailable && <p style={{color: 'red'}}>Slots not available!</p>}
                            {this.state.billDetails.length > 0 ? 
                                <>
                                    <Table tableData={this.state.billDetails} tableHeader={tableHeaders}/>
                                    <Button clicked={this.savePatientDetails}>Save</Button>
                                </> : null }
                        </div>
                    </div>
                </form>
            </div>
        )
    }
}

export default Appointment;