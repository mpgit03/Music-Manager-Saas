import Project from "../models/Project.js";
import { asynchandler } from "../middleware/asynchandler.js";


export const createProject = asynchandler(
    async (req,res)=>{
    const {name,description} = req.body;

    const project = await Project.create({
        name,
        description,
        owner:req.user._id
    });
    res.status(201).json(project);

}
)

export const getProjects = asynchandler(
    async (req,res)=>{
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;

    const skip =(page-1)*limit;
    const search = req.query.search ?
       { name:{$regex:req.query.search , $options :"i"}}
       :{};
    const sort = req.query.sort|| "-createdAt"


    const [projects,total]  = await Promise.all([
                     Project.find({owner : req.user._id,...search})
                     .sort(sort)
                     .skip(skip)
                     .limit(limit), 
                     Project.countDocuments({
                        owner:req.user.id,
                         ...search
                            })
                        ]);

    
    res.json({
        page,
        totalPages: Math.ceil(total/limit),
        totalProjects:total,
        projects

    });

}
)

export const getProject = asynchandler(
    async (req,res)=>{
    const project = req.resource;
    res.json(project);
}
)

export const updateProject = asynchandler(
     async (req,res)=>{
    const project = req.resource;

    

    project.name = req.body.name || project.name;
    project.description = req.body.description || project.description;

    const updatedproject = await project.save();
    res.json(updatedproject);

}
)

export const deleteProject = asynchandler(
    async (req,res) => {
    const project = req.resource;
    
    await project.deleteOne();
    res.json({message:"Project deleted"});

}
)

