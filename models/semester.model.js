const { Schema, model } = requrie('mongoose')



const Semester = Schema(
    {
        name : {
            type : String,
            enum : ['Semester 1','Semester 2'],
            required : [true , "nameRequired"]
        }, 
        dateBegin : {
            type: Date , 
            required :  [true ,"DateBegin"]
        } , 
        dateEnd : {
            Type : Date , 
            required : [true , "DateEnded"]
        },
        coefficient : {
            type : Number,
            required : [true, "CoefficientRequired"]
        },
        active : {
            type : Boolean,
            default : true
        }
    },
    {
        timestamp : true
    }
)

module.exports = model("Semester" ,Semester)





