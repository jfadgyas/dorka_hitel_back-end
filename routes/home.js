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
    const loanPer100K = Math.floor(req.body.loan/100000) // how many times you must count the installment (loan=2M => 2M/100k = 20*term)
    const query = {
        year: {$eq: req.body.year},
        minSalary: {$lte: req.body.salary},
        maxSalary: {$gte: req.body.salary},
        minLoan: {$lte: req.body.loan},
        maxLoan: {$gte: req.body.loan},
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

export default router