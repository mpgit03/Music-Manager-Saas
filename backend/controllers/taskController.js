import { asynchandler } from "../middleware/asynchandler.js";
import Project from "../models/Project.js";
import Task from "../models/Task.js";


export const createTask = asynchandler(
    async(req,res)=>{
        const {title,description} = req.body;
        // console.log(req.params.id);
        const attachment = req.file ? req.file.path:null;

        const project = req.project;
        const createdBy = req.user._id;

        const task = await Task.create({
            title,description,
            project: project._id,
            createdBy,
            attachment
        });
        res.status(201).json(task);

    }
)


export const getProjectTasks = asynchandler(
    async(req,res)=>{
        const projectId = req.params.projectId;
        const tasks = await Task.find({project:projectId});
        res.json(tasks)
    }
)


export const updateTask = asynchandler(
    async (req,res)=>{
        const task = req.task;
       
        Object.assign(task,req.body);
        const updated =  await task.save();
        res.json(updated);

    }
)

export const deleteTask =asynchandler(
    async(req,res)=>{
        const task =req.task;
        

        await task.deleteOne()
        res.json({message:"task deleted"});
    }
)

