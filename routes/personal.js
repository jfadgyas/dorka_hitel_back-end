import express from 'express'
import Personal from '../models/Personal.js'

const router = express.Router()

// Get all loan records
router.get('/', async (req, res) => {
    console.log('Listing all personal loan records')
    try {
        const personalRecords = await Personal.find()
        res.json(personalRecords)
    }
    catch(err){
        res.status(500).json({error: err})
    }
})

// Incoming request from front end:
// Check if the request is in the right format (string)
// Convert to numbers
// Filter the records with a query based on the received data (loan years, salary, loan amount)
// Respond with the bank, product name, and the monthly payment, and total payback amount
router.post('/', async (req, res) => {
    if (
        typeof req.body.year !== 'string' ||
        typeof req.body.salary !== 'string' ||
        typeof req.body.loan !== 'string'
    ) return res.status(400).json({error: 'Bad request received'})
    const reqData = {
        year: parseInt(req.body.year.replace(/\s+/g, '')),
        salary: parseInt(req.body.salary.replace(/\s+/g, '')),
        loan: parseInt(req.body.loan.replace(/\s+/g, ''))
    }
    const loanPer100K = Math.floor(reqData.loan/100000) // how many times you must count the installment (loan=2M => 2M/100k = 20*term)
    const query = {
        year: {$eq: reqData.year},
        minSalary: {$lte: reqData.salary},
        maxSalary: {$gte: reqData.salary},
        minLoan: {$lte: reqData.loan},
        maxLoan: {$gte: reqData.loan},
    }
    try{
        Personal.aggregate(
            [{$match: query},
            {$project: {
                bank: 1,
                product: 1,
                term: 1,
                monthlyPay: {$multiply: ['$term', loanPer100K]},
                fullPay: {$multiply: ['$term', loanPer100K, '$year', 12]}
                }
            },
            {$sort: {monthlyPay: 1}}]
        ).then(function (personalRecords, err){
            if (err) return res.status(400).json({error: err})
            res.send(personalRecords)
        })
    }
    catch(err){
        res.status(500).json({error: err})
    }
})


// Load the helper data to the database
// router.post('/', async (req, res) => {
//     console.log(req.body)
//     let counter = 0
//     try {
//         await Promise.all(
//             req.body.map(async item => {
//                 const newLoan = new Personal(item)
//                 counter ++
//                 return await newLoan.save()
//             })
//         )
//         res.json(`Successfully created ${counter} records`)
//     }
//     catch(err){
//         res.status(500).json({error: err})
//     }
// })
    
export default router