import { validationResult } from "express-validator";

export const validateRequest = (req, res, next) => {

  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    });
  }
  next();

  next();
};

const validate = (validations)=>{
   return async (req,res,next)=>{
    for( let validation in validations){
            await validation.run(req);
        }
        const errors = validationResult(req);
        

        if (!errors.isEmpty()) {
         return res.status(400).json({
         errors: errors.array()
      });
    }

    }
    
}