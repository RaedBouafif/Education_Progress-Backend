const {model , Schema} = require("mongoose") 



const Planning = Schema(
    {
    week: {
        type : Number , 
        required : [true , "weekRequired"] , 
        min : [0 , "invalidWeek"]
    } , 
    dateBegin : {
        type : Date , 
       required : [true , "dateBeginRequired"]
    } , 
    dateEnd :{
        type:Date , 
        required : [true , "dateBeginRequired"]
    }  , 
    group : {
        type: Schema.Types.ObjectId,
        ref : "Group" , 
        required : [true , "groupRequired"]
    }, 
    sessions : [{
        type: Schema.Types.ObjectId , 
        ref : "Session" , 
    }]
}, 
{
    timestamps : true
}
)


module.exports = model("Planning" , Planning)