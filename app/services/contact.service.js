const { ObjectId } = require("mongodb");

class ContactService{
    constructor(client){
        this.Contact = client.db().collection("contacts");
    }
    //định nghĩa các phương thức truy xuất CSDL sử dụng mongodb API
    extractContactData(payload){
        const contact = {
            name: payload.name,
            email: payload.email,
            address: payload.address,
            phone: payload.phone,
            favorite: payload.favorite,
        }; 

        //remove undefined fields
        Object.keys(contact).forEach(
            (key) => contact[key] === undefined && delete contact[key]
        );
        return contact;
    }
    
    //phương thức create()
    async create(payload){
        const contact = this.extractContactData(payload);
        const result = await this.Contact.findOneAndUpdate(
            contact,
            { $set: { favorite: contact.favorite === true } },
            { returnDocument: "after", upsert: true }
        );
        return result.value;
    }

    //contactService.find(condition) và contactService.findByName(name) => conditioncondition
    async find(filter){
        const cursor = await this.Contact.find(filter);
        return await cursor.toArray(); //chuyển đổi kq cho 1 array
    }
    async findByName(name){
        return await this.find({
            name: { $regex: new RegExp(name), $option: "i"},
        });
    }

    //định nghĩa phương thức tìm kiếm theo id
    async findById(id){
        return await this.Contact.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
    }

    //Phương thức update(id, document)
    async update(id, payload){
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        };

        const update = this.extractContactData(payload);
        const result = await this.Contact.findOneAndUpdate(
            filter,
            { $set: update },
            { returnDocument : "after" }
        );
        return result.value;
    }
    //Phương thức delete(id)
    async delete(id){
        const result = await this.Contact.findOneAndDelete({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
        return result.value;
    }

    //Phương thức findFavorite()
    async findFavorite(){
        return await this.find({favorite: true });
    }

    //Phương thức deleteAll()
    async deleteAll() {
        const result = await this.Contact.deleteMany({});
        return result.deletedCount;
    }

}

module.exports = ContactService;