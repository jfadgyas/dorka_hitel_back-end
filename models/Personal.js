import mongoose from 'mongoose'

// Schema
const LoanSchema = mongoose.Schema({
    year: Number,
    bank: String,
    product: String,
    minSalary: Number,
    maxSalary: Number,
    minLoan: Number,
    maxLoan: Number,
    term: Number
})

export default mongoose.model('Personal', LoanSchema)