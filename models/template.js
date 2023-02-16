const { Schema, model } = requrie('mongoose')



const Template = Schema({
    semester : {
            name : {
                type : String,
                enum : ['Semester 1','Semester 2'],
                required : [true , semester]
            } , 
            dateBegin : {
                type: Date , 
                required :  [true ,"semestre_dateBeginRequired"]
            } , 
            dateEnd : {
                Type : Date , 
                required : [true , "semestre_dateEndRequired"]
            }
    },
    year : {
        type : Date,
        required : [true,"yearRequired"]
    },
    group : {
        type : Schema.Types.ObjectId,
        ref : "Group",
        required : true
    },
    sessions : [{
        type : Schema.Types.ObjectId,
        ref : "Session",
    }],
    active : {
        type : Boolean,
        default : true
    }
})








module.exports = model("Template" ,Template)





