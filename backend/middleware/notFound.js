const notFound = (req,res,next)=>{
    const error = new Error(`NOT FOUND ${req.originalUrl}`)
    res.status(404)
    next(error)
}
export default notFound