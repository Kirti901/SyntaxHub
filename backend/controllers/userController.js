const userModel = require("../Models/userModel");
const projectModel = require("../Models/projectModel")
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const secret = "secret";


function getStartupCode(language) {
  if (language.toLowerCase() === "python") {
    return 'print("Hello World")';
  } else if (language.toLowerCase() === "java") {
    return 'public class Main { public static void main(String[] args) { System.out.println("Hello World"); } }';
  } else if (language.toLowerCase() === "javascript") {
    return 'console.log("Hello World");';
  } else if (language.toLowerCase() === "c++" || language.toLowerCase()==="cpp") {
    return '#include <iostream>\n\nint main() {\n    std::cout << "Hello World" << std::endl;\n    return 0;\n}';
  } else if (language.toLowerCase() === "c") {
    return '#include <stdio.h>\n\nint main() {\n    printf("Hello World\\n");\n    return 0;\n}';
  } 
  else {
    return 'Language not supported';
  }
}


exports.signUp = async (req, res) => {
  try {
    const { email, pwd, fullName } = req.body;
    const emailCheck = await userModel.findOne({ email });
    if (emailCheck) {
      return res.status(400).json({
        success: false,
        msg: "Email already exists",
      });
    }
    const allowedDomains=["gmail.com","yahoo.com","outlook.com","hotmail.com"];
    const domain=email.split("@")[1];
    if(!allowedDomains.includes(domain)){
      return res.status(400).json({
        success:false,
        msg:"Please use valid Email Provider like Gmail"
      })
    }
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(pwd, salt, async function (err, hash) {
        let user = await userModel.create({
          email: email,
          password: hash,
          fullName: fullName,
        });
        return res.status(200).json({
          success: true,
          msg: "User created successfully",
        });
      });
    });
  }
  catch (err) {
    res.status(500).json({
      success: false,
      msg: err.message
    })
  }
}

exports.login = async (req, res) => {
  try {
    let { email, pwd } = req.body;
    let user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    bcrypt.compare(pwd, user.password, function (err, result) {
      if (result) {

        let token = jwt.sign({ userId: user._id }, secret)

        return res.status(200).json({
          success: true,
          msg: "User logged in successfully",
          token
        });
      }
      else {
        return res.status(401).json({
          success: false,
          msg: "Invalid password"
        });
      }
    })

  }
  catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message
    })
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email, newPwd } = req.body;
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found"
      });
    }
    // You can add password strength validation here if you want
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newPwd, salt, async function (err, hash) {
        user.password = hash;
        await user.save();
        return res.status(200).json({
          success: true,
          msg: "Password changed successfully"
        });
      });
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      msg: err.message
    });
  }
};
exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  const user = await userModel.findOne({ email });
  if (!user) return res.status(404).json({ success: false, msg: "User not found" });

  // Create reset token (valid for 1 hour)
  const token = jwt.sign({ userId: user._id }, process.env.SECRET, { expiresIn: '1h' });

  // Send email
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const resetLink = `http://localhost:5173/reset-password/${token}`;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password. This link expires in 1 hour.</p>`
    });
    res.json({ success: true, msg: "Password reset email sent!" });
  } catch (err) {
    console.error("Email error:", err); // <-- This will show the real error in your terminal
    res.status(500).json({ success: false, msg: "Error sending email." });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, newPwd } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    const user = await userModel.findById(decoded.userId);
    if (!user) return res.status(404).json({ success: false, msg: "User not found" });

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPwd, salt);
    await user.save();

    res.json({ success: true, msg: "Password reset successful!" });
  } catch (err) {
    res.status(400).json({ success: false, msg: "Invalid or expired token." });
  }
};
exports.createProj = async (req, res) => {
  try {

    let { name, projLanguage, token ,version } = req.body;
    let decoded = jwt.verify(token, secret);
    let user = await userModel.findOne({ _id: decoded.userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found"
      });
    };

    let project = await projectModel.create({
      name: name,
      projLanguage: projLanguage,
      userName: user._id,
      code: getStartupCode(projLanguage),
      version:version
    });


    return res.status(200).json({
      success: true,
      msg: "Project created successfully",
      projectId: project._id
    });


  }
  catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message
    })
  }
};

exports.saveProject = async (req, res) => {
  try {
    let { token, projectId, code } = req.body;
    let decoded = jwt.verify(token, secret);
    let user = await userModel.findOne({ _id: decoded.userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found"
      });
    };
    let project = await projectModel.findOneAndUpdate({ _id:projectId });
    project.code = code;
    await project.save();
    return res.status(200).json({
      success: true,
      msg: "Project saved successfully",
    })
  }
  catch (err) {
    return res.status(500).json({
      success: false,
      msg: err.message
    })
  }
}
exports.getProjects = async (req, res) => {
  try {
    let { token } = req.body;
    let decoded = jwt.verify(token, secret);
    let user = await userModel.findOne({ _id: decoded.userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found"
      });
    };
    let projects = await projectModel.find({ userName: user._id });
    return res.status(200).json({
      success: true,
      msg: "Projects fetched successfully",
      projects,
    })
  }
  catch (err) {
    return res.status(500).json({
      success: false,
      msg: err.message,
    })
  }
}
exports.getProject = async (req, res) => {
  try {
    let { token, projectId } = req.body;
    let decoded = jwt.verify(token, secret);
    let user = await userModel.findOne({ _id: decoded.userId });
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found"
      });
    };
    let project = await projectModel.findOne({ _id: projectId });
    if (project) {
      return res.status(200).json({
        success: true,
        msg: "Project fetched successfully",
        project: project
      });
    }
    else {
      return res.status(404).json({
        success: false,
        msg: "Project not found"
      });
    }
  }
  catch (err) {
    return res.status(500).json({
      success: false,
      msg: err.message
    })
  }
}
exports.deleteProject = async (req, res) => {
  try {
    let { token, projectId } = req.body;
    let decoded = jwt.verify(token, secret);
    let user = await userModel.findOne({ _id: decoded.userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found"
      });
    }

    let project = await projectModel.findOneAndDelete({ _id: projectId });

    return res.status(200).json({
      success: true,
      msg: "Project deleted successfully"
    })
  }
  catch (err) {
    return res.status(500).json({
      success: false,
      msg: err.message
    })
  }
}

exports.editProject = async (req, res) => {
  try {

    let { token, projectId, name } = req.body;
    let decoded = jwt.verify(token, secret);
    let user = await userModel.findOne({ _id: decoded.userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found"
      });
    };

    let project = await projectModel.findOne({ _id: projectId });
    if (project) {
      project.name = name;
      await project.save();
      return res.status(200).json({
        success: true,
        msg: "Project name edited successfully"
      })
    }
    else {
      return res.status(404).json({
        success: false,
        msg: "Project not found"
      })
    }

  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: error.message
    })
  }
};

