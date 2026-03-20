import { asynchandler } from "./asynchandler.js"
import Project from "../models/Project.js";
import Task from "../models/Task.js";

export const checkProjectOwnership = asynchandler(
    async(req,res,next)=>{
       const project = await Project.findById(req.params.projectId);
       console.log(req.params);
        
       if(!project){
       res.status(404)
       throw new Error("Project not found")
       }

       if(project.owner.toString()!==req.user._id.toString()){
        throw new Error("Not Authorizzed to access this project");
        }
        req.project = project;
        next();
    }

)




 export const checkOwnership = (Model)=>asynchandler(async(req,res,next)=>{
    const resource = await Model.findById(req.params.id);
    if(!resource){
        res.status(404);
        throw new Error("Resource not found");
    }
    
    if(resource.owner.toString()!==req.user._id.toString()){
        res.status(403);
        throw new Error("Not authorized");
    }
    req.resource = resource;
    next();
})

export const checktaskOwnership = asynchandler(
    async(req,res,next)=>{
        const task = await Task.findById(req.params.taskId).populate("project");
        if(!task){
        res.status(404)
        throw new Error("Task not found")
        } 

        if(task.project.owner.toString() !== req.user._id.toString()){
            res.status(403)
            throw new Error("Not authorized to access this task")
        }
        req.task = task;
        next();
        }
    
)
    