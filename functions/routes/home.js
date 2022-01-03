import express from 'express'
import Home from '../models/Home.js'

const router = express.Router()

// Get all loan records
router.get('/', async (req, res) => {
    console.log('Listing all home loan records')
    try{
        const homeRecords = await Home.find()
        res.json(homeRecords)
    }
    catch(err){
        res.status(500).json({error: err})
    }
})

// Incoming request from front end:
// Filter the records with a query based on the received data (loan years, salary, loan amount)
// Respond with the bank, product name, and the monthly payment, total payback amount. (rate period is fixed interest rate for this period)
router.post('/', async (req, res) => {
    // console.log('Incoming home request')
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
        Home.aggregate([
            {$match: query},
            {$project: {
                bank: 1,
                product: 1,
                term: 1,
                ratePeriod: 1,
                monthlyPay: {$multiply: ['$term', loanPer100K]},
                fullPay: {$multiply: ['$term', loanPer100K, '$year', 12]}
                }
            },
            {$sort: {ratePeriod: 1, monthlyPay: 1}}]
        ).then(function (homeRecords, err){
            if (err) return res.status(400).json({error: err})
            res.json(homeRecords)
        })
    }
    catch(err){
        res.status(500).json({error: err})
    }
})

// Request for more offers from the same bank
router.post('/:bank', async (req, res) => {
    if (
        typeof req.body.year !== 'string' ||
        typeof req.body.salary !== 'string' ||
        typeof req.body.loan !== 'string'
    ) return res.status(400).json({error: 'Bad request received'})
    const reqData = {
        bank: req.params.bank,
        salary: parseInt(req.body.salary.replace(/\s+/g, '')),
        loan: parseInt(req.body.loan.replace(/\s+/g, ''))
    }
    const loanPer100K = Math.floor(reqData.loan/100000) // how many times you must count the installment (loan=2M => 2M/100k = 20*term)
    const query = {
        bank: reqData.bank,
        minSalary: {$lte: reqData.salary},
        maxSalary: {$gte: reqData.salary},
        minLoan: {$lte: reqData.loan},
        maxLoan: {$gte: reqData.loan},
    }
    try{
        Home.aggregate(
            [{$match: query},
            {$project: {
                bank: 1,
                product: 1,
                year: 1,
                term: 1,
                ratePeriod: 1,
                monthlyPay: {$multiply: ['$term', loanPer100K]},
                fullPay: {$multiply: ['$term', loanPer100K, '$year', 12]}
                }
            },
            {$sort: {monthlyPay: 1}}]
        ).then(function (homeRecords, err){
            if (err) return res.status(400).json({error: err})
            res.send(homeRecords)
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
//                 const newLoan = new Home(item)
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

//update screwed up terms for raifeisen and k&h
// router.patch('/', async (req, res) => {
//     console.log(req.body.bank)
//     const updateRec = await Home.updateMany(
//         {
//             bank: {$in: req.body.bank}
//         },
//         [{
//             $set: {
//                 term: {
//                     $round: {
//                         $multiply: ["$term", 0.2]
//                     }
//                 }
//             }
//         }]
//     )
//     res.json(updateRec) 
// })

// update screwed up bank name for Erste
// router.patch('/', async (req, res) => {
//     console.log(req.body.bank)
//     const updateRec = await Home.updateMany(
//         {
//             bank: req.body.bank
//         },
//         {
//             $set: {
//                 bank: 'Erste Bank'
//             }
//         }
//     )
//     res.json(updateRec) 
// })

export default router