const userModel = require("../Models/userModel");
const projectModel = require("../Models/projectModel")
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
const secret = "secret";


function getStartupCode(language) {
  if (language.toLowerCase() === "python") {
    return 'print("Hello World")';
  } else if (language.toLowerCase() === "java") {
    return 'public class Main { public static void main(String[] args) { System.out.println("Hello World"); } }';
  } else if (language.toLowerCase() === "javascript") {
    return 'console.log("Hello World");';
  } else if (language.toLowerCase() === "c++" || language.toLowerCase==="cpp") {
    return '#include <iostream>\n\nint main() {\n    std::cout << "Hello World" << std::endl;\n    return 0;\n}';
  } else if (language.toLowerCase() === "c") {
    return '#include <stdio.h>\n\nint main() {\n    printf("Hello World\\n");\n    return 0;\n}';
  } else if (language.toLowerCase() === "go") {
    return 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Hello World")\n}';
  } else if (language.toLowerCase() === "bash") {
    return 'echo "Hello World"';
  } else {
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

//to export all these at once : module.exports:{getProject,signUp etc} at the end 