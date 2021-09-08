import mongoose from "mongoose"

const BabySchema = mongoose.Schema({
    year: Number,
    bank: String,
    product: String,
    minLoan: Number,
    maxLoan: Number,
    term: Number
})

export default mongoose.model('Baby', BabySchema)