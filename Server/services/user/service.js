//@ts-check
"use strict";

const { ServiceBase } = require("../utilities/servicebase");

const  User  = require("./mongoDBUserModel");


class UserService extends ServiceBase {
  static Instance = null;
  constructor() {
    super();
    UserService.Instance = this;
    this.Useractions();
  }
  async Useractions() {
    this.router.route("/register").post(UserService.Instance.HandleRegister);
    
  }
  async HandleRegister(req, res) {
    try {
      if (
        !ServiceBase.MandateJsonData(req, res, [
          "username",
          "email",
          "password",
        ])
      )
        return;

      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser) {
        ServiceBase.SendBadRequestResponse(
          res,
          "User already exists with this email"
        );
        return;
      }

      const userData = await User.create(req.body);
      res.status(201).send({
        msg:"Registration is successful!",
        error: false,
        userData
    }) 
      
    } catch (err) {
      console.error("Cannot create user: ", err);
      ServiceBase.SendErrorResponse(res);
    }
  }

  async HandleLogin(req, res) {
    try {
    } catch (err) {
      // TODO
    }
  }
  async HandleLogout(req, res) {
    try {
    } catch (err) {
      //TODO
    }
  }
}
module.exports = new UserService();
