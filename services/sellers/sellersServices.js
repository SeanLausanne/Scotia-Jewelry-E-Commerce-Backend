const Sellers = require("../../models/sellers/sellerModel");
const Product = require("../../models/products/productsModel");
const bcrypt= require('bcryptjs');
const { response } = require('express');
const { param } = require("express/lib/request");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dkjbxujnu",
  api_key: "384624719665962",
  api_secret: "v-gEZoflAk5eakpiLrUKFjMr1-U",
});

async function sellerLogin({email,password}, callback)
{
    const seller = await Sellers.findOne({email});
    if(seller !=null){
        if(bcrypt.compareSync(password,seller.password))
        {
            return callback(null,seller.toJSON())
        }
        else{
            return callback({
                message:"Invalid Username/Password"
            })
        }
    }
    else{
        return callback({
            message:"Email not registered with us"
        })
    }
}

async function sellerRegister(params,callback){
    if(params.firstname==null)
    {
        return callback({
            message:"firstname is Required"
        })
    }
    else if(params.lastname==null)
    {
        return callback({
            message:"lastname is Required"
        })
    }

    const seller= new Sellers(params);
    seller.save()
    .then((response)=>{
        return callback(null, response);
    })
    .catch((error)=>{
        return callback(error);
    });
}

async function sellerProfile(sellerId,callback)
{
    const sellerProfile = await Sellers.findOne({_id:sellerId});
    if(sellerProfile !=null)
    {
            return callback(null,{...sellerProfile.toJSON()})
    }
    else{
        return callback({
            message:"Email doesn't exist in records"
        })
    }
    
}


async function editProfile(params,callback){
    if(params.email==null)
    {
        return callback({
            message:"Error is updating profile (email missing)"
        })
    }
    const email =params.email
    const sellerProfile = await Sellers.findOneAndUpdate({email},
        { $set:
            {
              "firstname":params.firstname,
              "lastname":params.lastname,
              "phone":params.phone,
              "country":params.country,
              "bankname":params.bankname,
              "accountno" :params.accountno
             }
         }, { returnOriginal: false } );

         if(sellerProfile !=null)
         {
                 return callback(null,{...sellerProfile.toJSON()})
         }
         else{
             return callback({
                 message:"Unable to update records"
             })
         }

}

async function getAllSellers(params,callback){
   
    const sellers  = await Sellers.find({});

         if(sellers !=null)
         {
                 return callback(null,{...sellers})
         }
         else{
             return callback({
                 message:"Unable to get sellers records"
             })
         }
}

async function deleteSellerProfile(id,callback){
    const result =await Sellers.deleteOne({ email: id });
    if(result.deletedCount>0)
    {
        return callback(null,"Seller Deleted Successfully")
    }
    else{
        return callback({
            message:"Seller Not found"
        })
    }
}

async function changePassword (params,callback){
    
    if(params==null)
    {
        return callback({
            message:"Password is required"
        })
    }
    const email =params.email;
    const password=params.password;
    const sellerProfile = await Sellers.findOneAndUpdate({email},
        { $set:
            {
                "password":password
             }
         }, { returnOriginal: false } );
    if(sellerProfile !=null)
         {
            //console.log("Service : "+sellerProfile)
            return callback(null)
         }
    else{
        return callback({message:"Unable to update password"})
        }  
}

async function forgotPassword(params,callback){
    if(params==null)
    {
        return callback({
            message:"Details are required"
        })
    }

    const filter ={email:params.email,phone:params.phone}
    const update = { password: params.password };
    const sellerProfile = await Sellers.findOneAndUpdate(filter,update, { returnOriginal: false });
    if(sellerProfile !=null|| sellerProfile!=undefined)
         {
            return callback(null,sellerProfile)
         }
    else{
        return callback({message:"Incorrect Details"})
        }  
}


async function addproduct(params,callback){

    let ts = Date.now();
    let file;
    let productObj = JSON.parse(req.body.product);
    let url;
    if (params.image) {
        url = await uploadImageToCloudinary(params.image);
      }
      console.log(url);
try{ 
    const product = new Product({
        name: productObj.name,
        description: productObj.description,
        About: productObj.About,
        brand: productObj.brand,
        price: productObj.price,
        category: productObj.category,
        image: url[0],
        images:url,
        stock: productObj.stock,
        isFlash: productObj.isFlash,
      });
      await product
        .save()
        .then((prod) => {
            return callback(null, prod);
        })
        .catch((error)=>{
            return callback(error);
        });
    } catch (err) {
        console.log(err);
        res.status(500).send("Something went wrong");
      }
}

const uploadImageToCloudinary = async (file) => {
    let imageArray = [];
    if (file.length > 1) {
      for (let i = 0; i < file.length; i++) {
        let result = await cloudinary.uploader.upload(file[i], {
          folder: "test",
        });
        imageArray.push(result.url);
      }
      return imageArray;
    } else {
      let result = await cloudinary.uploader.upload(file, {
        folder: "test",
      });
      imageArray.push(result.url);
      return imageArray;
    }
  };



module.exports={
    sellerLogin,
    sellerRegister,
    sellerProfile,
    editProfile,
    getAllSellers,
    deleteSellerProfile,
    forgotPassword,
    changePassword,
    addproduct
}