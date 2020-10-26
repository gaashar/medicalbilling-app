const express = require("express");
const cors= require('cors');

const bodyParser = require("body-parser") 

const app = express();

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const data = {
    "medicalBills" : [
        {
            "id" : "1",
            "medicalBillName" : "CT Brain",
            "amount" : "2000",
            "maxDiscount" : "100 INR",
            "modality" : "CT"
        },
        {
            "id" : "2",
            "medicalBillName" : "CT PNS",
            "amount" : "1000",
            "maxDiscount" : "200 INR",
            "modality" : "CT"
        },
        {
            "id" : "3",
            "medicalBillName" : "MRI Brain",
            "amount" : "3000",
            "maxDiscount" : "300 INR",
            "modality" : "MRI"
        },
        {
            "id" : "4",
            "medicalBillName" : "MRI PNS",
            "amount" : "2400",
            "maxDiscount" : "30 %",
            "modality" : "MRI"
        },
        {
            "id" : "5",
            "medicalBillName" : "GLUCOSE FASTING",
            "amount" : "130",
            "maxDiscount" : "10 %",
            "modality" : "LAB"
        },
        {
            "id" : "6",
            "medicalBillName" : "SUGAR TESTING",
            "amount" : "300",
            "maxDiscount" : "5 %",
            "modality" : "LAB"
        }
    ]
}

const medicalBillNames = ["CT Brain","CT PNS","MRI Brain","MRI PNS","GLUCOSE FASTING","SUGAR TESTING"];

const patientSlots = [{ date: '2020-10-20', modality: 'CT', slots: 1 }];

const patientDetails = [];

app.get("/medicalbills", (req, res, next) => {
    let nameSearchQuery = req.query.billnamesearch;
    let result = {"medicalBills": []};
    if(nameSearchQuery != undefined && nameSearchQuery !== "") {
        for(let i = 0; i < medicalBillNames.length; i++) {
            if(medicalBillNames[i].includes(nameSearchQuery)) {
                result["medicalBills"].push(data["medicalBills"][i]);
            }
        }
    }
    else {
        result = data;
    }
    res.json(result);
});

app.post("/billslots", (req, res, next) => {
    const slotDetails = req.body;
    let slotAdded = false
    patientSlots.map(slot => {
        if(slotDetails.date === slot.date && slotDetails.modality === slot.modality) {
            slot.slots+=1;
            slotAdded = true;
        }
    })
    if(!slotAdded) {
        patientSlots.push(slotDetails);
        slotAdded = false;
    }
    res.status(201).json({
        message: "slots for the day added successfully"
    })
});

app.get("/billslots", (req, res, next) => {
    let dateSearchParam = req.query.date.toString();
    let modalityParam = req.query.modality.toString();
    let result = {"slots": 0};
    patientSlots.map(slot => {
        if(dateSearchParam == slot.date.toString() && modalityParam == slot.modality.toString()) {
            result.slots = slot.slots
        }
    });
    res.json(result);
});

app.post("/patient", (req, res, next) => {
    const patient = req.body;
    patientDetails.push(patient);
    res.status(201).json({
        message: "patient information added successfully"
    })
});

app.get("/patient", (req, res, next) => {
    let fromDate = req.query.fDate;
    let toDate = req.query.tDate;
    let status = req.query.status;
    let result = [];
    let filterQueryFound = false;
    //Filter by fromDate
    if((fromDate != undefined && fromDate !== "")) {
        patientDetails.map(patient => {
            if( new Date(patient.apptDate) >= new Date(fromDate) ) {
                result.push(patient)
            }
         })
         filterQueryFound = true;
    }
    //Filter by toDate
    if((toDate != undefined && toDate !== "")) {
        let patientDetailsToFilter;

        if(filterQueryFound) {
            patientDetailsToFilter = result;
            result = [];
        }
        else {
            patientDetailsToFilter = patientDetails;
        }
        patientDetailsToFilter.map(patient => {
            if( new Date(patient.apptDate) <= new Date(toDate) ) {
                result.push(patient)
            }
         })
        filterQueryFound = true;
    }
    //Filter by status
    if((status != undefined && status !== "")) {
        let patientDetailsToFilter;

        if(filterQueryFound) {
            patientDetailsToFilter = result;
            result = [];
        }
        else {
            patientDetailsToFilter = patientDetails;
        }
        patientDetailsToFilter.map(patient => {
            if(patient.status.toString() == status.toString()) {
                result.push(patient)
            }
        })
        filterQueryFound = true;
    }

    if(!filterQueryFound) {
        result = patientDetails;
    }
    res.json(result);
});

app.get('/patient/:id', (req,res,next) => {
    let id = req.params.id;
    let result;
    if((id != undefined && id !== "")) {
        patientDetails.map(patient => {
            if( patient.id == id ) {
                result = patient
            }
         })
    }
    res.json(result);
})

app.put('/patient/:id', (req,res,next) => {
    let id = req.params.id;
    let newPatientData = req.body;
    patientDetails.map((patient,index) => {
        if( patient.id.toString() === id.toString() ) {
            patientDetails[index]= newPatientData;
        }
    })
    res.status(200).json({
        message: "patient information updated successfully"
    })
})

app.listen(3001, () => {
 console.log("Server running on port 3001");
});