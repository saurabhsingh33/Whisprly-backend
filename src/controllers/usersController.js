const User = require("../model/userModel");
const bcrypt = require("bcrypt");

module.exports.register = async (req, res, next) => {
  try {
    const { userName, email, password } = req.body;
    const userNameCheck = await User.findOne({ userName });
    if (userNameCheck) {
      return res.json({ msg: "Username already used", status: false });
    }
    const emailCheck = await User.findOne({ email });
    if (emailCheck) {
      return res.json({ msg: "Email already used", status: false });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      userName,
      password: hashedPassword
    });
    delete user.password;
    return res.json({ status: true, user });
  } catch (error) {
    next(error);
  }
}

module.exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ msg: "Incorrect username or password", status: false });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.json({ msg: "Incorrect username or password", status: false });
    }
    delete user._doc.password;
    return res.json({ status: true, user });
  } catch (error) {
    next(error);
  }
}

module.exports.setAvatar = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const avatarImage = req.body.image;
    await User.findByIdAndUpdate(userId, {
      isAvatarImageSet: true,
      avatarImage
    });

    const userData = await User.findById(userId);

    return res.json({ isSet: userData.isAvatarImageSet, image: userData.avatarImage });
  } catch (error) {
    next(error)
  }
}

module.exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ _id: { $ne: req.params.id } }).select([
      "email", "userName", "avatarImage", "_id"
    ]);

    return res.json(users);
  } catch (error) {
    next(error);
  }
}