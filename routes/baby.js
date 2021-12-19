import express from 'express'
import Baby from '../models/Baby.js'

const router = express.Router()

// Get all loan records
router.get('/', async (req, res) => {
    console.log('Listing all baby loan records')
    try{
        const babyRecords = await Baby.find()
        res.json(babyRecords)
    }
    catch(err){
        res.status(500).json({error: err})
    }
})

// Incoming request from front end:
// Filter the records with a query based on the received data (loan years, loan amount)
// Respond with the bank, product name, and the monthly payment, and total payback amount
router.post('/', async (req, res) => {
    if (
        typeof req.body.year !== 'string' ||
        typeof req.body.loan !== 'string'
    ) return res.status(400).json({error: 'Bad request received'})
    const reqData = {
        year: parseInt(req.body.year.replace(/\s+/g, '')),
        loan: parseInt(req.body.loan.replace(/\s+/g, ''))
    }
    const loanPer100K = Math.floor(reqData.loan/100000) // how many times you must count the installment (loan=2M => 2M/100k = 20*term)
    const query = {
        year: {$eq: reqData.year},
        minLoan: {$lte: reqData.loan},
        maxLoan: {$gte: reqData.loan},
    }
    try{
        Baby.aggregate(
            [{$match: query},
            {$project: {
                bank: 1,
                product: 1,
                term: 1,
                monthlyPay: {$multiply: ['$term', loanPer100K]},
                fullPay: {$multiply: ['$term', loanPer100K, '$year', 12]}
                }
            },
            {$sort: {bank: 1}}]
        ).then(function (babyRecords, err){
            if (err) return res.status(400).json({error: err})
            res.json(babyRecords)
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
//                 const newLoan = new Baby(item)
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