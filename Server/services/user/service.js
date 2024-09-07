//@ts-check
"use strict";

const { ServiceBase } = require("../utilities/servicebase");
const {User} = require("./mongoDBUserModel")

class UserService extends ServiceBase {
    static Instance = null
  constructor() {
    super();
    this.Useractions();
  }
  async Useractions() {
    this.router.route("/register").post(UserService.Instance.HandleRegister)
  }
  async HandleRegister(req, res) {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        ServiceBase.SendBadRequestResponse(
          res,
          "Username, password, and email are required"
        );
        return;
        
      }
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        ServiceBase.SendBadRequestResponse(res, "User already exists with this email");
        return;
    }

      
    } catch (err) {}
  }

  async HandleLogin(req,res){
    try {
        
    } catch (err) {
        // TODO
    }
  }
  async HandleLogout(req,res){
    try {
        
    } catch (err) {
        //TODO
    }
  }
}
module.exports = new UserService()