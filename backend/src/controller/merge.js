const schema = mongoose.Schema;

const messageSchema = new schema ({
    conversationId:{
        type: mongoose.Schema.Types.ObjectId, ref: 'Lead',
    },
    sender:{
        type: mongoose.Schema.Types.ObjectId, ref: 'Invoice',
    },
    message:{
        type:String
    },
    dateTime:{
        type:Date,default: Date.now
    }
})


const message = module.export = mongoose.model('Message',messageSchema);