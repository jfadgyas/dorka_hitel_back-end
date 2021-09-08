import mongoose from 'mongoose'

const HomeSchema = mongoose.Schema({
    year: Number,
    bank: String,
    product: String,
    minSalary: Number,
    maxSalary: Number,
    minLoan: Number,
    maxLoan: Number,
    ratePeriod: Number,
    term: Number
})

export default mongoose.model('Home', HomeSchema)