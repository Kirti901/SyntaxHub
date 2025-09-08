import React, { useEffect, useState } from 'react';
import Navbar from "../components/Navbar";
import Select from 'react-select';
import { api_base_url } from '../helper';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Home = () => {
  const fullName = localStorage.getItem("fullName") || "User";
  const [isCreateModelShow, setIsCreateModelShow] = useState(false);
  const [languageOptions, setLanguageOptions] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [isEditModelShow, setIsEditModelShow] = useState(false);
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [projects, setProjects] = useState(null);
  const [editProjId, setEditProjId] = useState("");

  const customStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: '#1a1a1a',
      borderColor: '#333',
      color: '#fff',
      padding: '5px',
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: '#1a1a1a',
      color: '#fff',
      width: "100%"
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? '#333' : '#1a1a1a',
      color: '#fff',
      cursor: 'pointer',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#fff',
    }),
    placeholder: (provided) => ({
      ...provided,
      color: '#aaa',
    }),
  };

  const getRunTimes = async () => {
    let res = await fetch("https://emkc.org/api/v2/piston/runtimes");
    let data = await res.json();
    const filteredLanguages = ["python", "javascript", "c", "c++", "java"];
    const options = data
      .filter(runtime => filteredLanguages.includes(runtime.language))
      .map(runtime => ({
        label: `${runtime.language} (${runtime.version})`,
        value: runtime.language,
        version: runtime.version,
      }));
    setLanguageOptions(options);
  };

  const handleLanguageChange = (selectedOption) => {
    setSelectedLanguage(selectedOption);
  };

  const getProjects = async () => {
    fetch(api_base_url + "/getProjects", {
      mode: "cors",
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        token: localStorage.getItem("token")
      })
    }).then(res => res.json()).then(data => {
      if (data.success) {
        setProjects(data.projects);
      } else {
        toast.error(data.msg);
      }
    });
  };

  useEffect(() => {
    getProjects();
    getRunTimes();
  }, []);

  const createProj = () => {
    fetch(api_base_url + "/createProj", {
      mode: "cors",
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: name,
        projLanguage: selectedLanguage.value,
        token: localStorage.getItem("token"),
        version: selectedLanguage.version
      })
    }).then(res => res.json()).then(data => {
      if (data.success) {
        setName("");
        navigate("/editor/" + data.projectId);
      } else {
        toast.error(data.msg);
      }
    });
  };

  const deleteProject = (id) => {
    let conf = confirm("Are you sure you want to delete this project?");
    if (conf) {
      fetch(api_base_url + "/deleteProject", {
        mode: "cors",
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          projectId: id,
          token: localStorage.getItem("token")
        })
      }).then(res => res.json()).then(data => {
        if (data.success) {
          getProjects();
        } else {
          toast.error(data.msg);
        }
      });
    }
  };

  const updateProj = () => {
    fetch(api_base_url + "/editProject", {
      mode: "cors",
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        projectId: editProjId,
        token: localStorage.getItem("token"),
        name: name,
      })
    }).then(res => res.json()).then(data => {
      setIsEditModelShow(false);
      setName("");
      setEditProjId("");
      getProjects();
      if (!data.success) toast.error(data.msg);
    });
  };

  return (
    <>
      <Navbar />
      <div className="flex items-center px-[100px] justify-between mt-5">
        <h3 className="text-2xl text-white">👋 Hi, {fullName}</h3>
        <button 
          onClick={() => { setIsCreateModelShow(true) }} 
          className="px-5 py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white transition-all"
        >
          Create Project
        </button>
      </div>

      <div className="projects px-[100px] mt-5 pb-10 min-h-[70vh]">
        {projects && projects.length > 0 ? (
          projects.map((project, index) => (
            <div 
              key={index}
              className="w-full p-[15px] flex items-center justify-between bg-[#1a1a1a] rounded-lg border border-gray-800 shadow-sm hover:shadow-md hover:border-gray-600 transition-all duration-200 mb-4"
            >
              <div 
                onClick={() => { navigate("/editor/" + project._id) }} 
                className="flex w-full items-center gap-[15px] cursor-pointer hover:scale-[1.01] transition-transform"
              >
                <img 
                  className="w-[130px] h-[100px] object-cover rounded-md"
                  src={
                    project.projLanguage === "python" ? "https://images.ctfassets.net/em6l9zw4tzag/oVfiswjNH7DuCb7qGEBPK/b391db3a1d0d3290b96ce7f6aacb32b0/python.png" :
                    project.projLanguage === "javascript" ? "https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png" :
                    project.projLanguage === "c++" ? "https://upload.wikimedia.org/wikipedia/commons/3/32/C%2B%2B_logo.png" :
                    project.projLanguage === "c" ? "https://upload.wikimedia.org/wikipedia/commons/1/19/C_Logo.png" :
                    project.projLanguage === "java" ? "https://static.vecteezy.com/system/resources/previews/022/100/214/original/java-logo-transparent-free-png.png" :
                    project.projLanguage === "bash" ? "https://www.milinux.es/wp-content/uploads/2018/07/terminal-logo-512x512.png" : ""
                  }
                  alt=""
                />
                <div>
                  <h3 className="text-lg font-semibold text-white">{project.name}</h3>
                  <p className="text-[14px] text-gray-400">{new Date(project.date).toDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-[10px]">
                <button 
                  className="px-4 py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white text-sm transition-all"
                  onClick={() => {
                    setIsEditModelShow(true);
                    setEditProjId(project._id);
                    setName(project.name);
                  }}
                >
                  Edit
                </button>
                <button 
                  onClick={() => { deleteProject(project._id) }} 
                  className="px-4 py-2 rounded-md bg-red-500 hover:bg-red-600 text-white text-sm transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center mt-20">
            <img 
              src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png" 
              alt="No Projects"
              className="w-[180px] opacity-80 mb-4"
            />
            <h3 className="text-gray-300 text-lg">No Project Found!</h3>
            <p className="text-gray-500 text-sm mb-4">Start by creating your first project 🚀</p>
            
          </div>
        )}
      </div>

      {isCreateModelShow && (
        <div 
          onClick={(e) => {
            if (e.target.classList.contains("modelCon")) {
              setIsCreateModelShow(false);
              setName("");
            }
          }} 
          className="modelCon flex flex-col items-center justify-center w-screen h-screen fixed top-0 left-0 bg-[rgba(0,0,0,0.5)]"
        >
          <div className="modelBox flex flex-col items-start rounded-xl p-[20px] w-[25vw] bg-[rgba(30,30,30,0.95)] backdrop-blur-md border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-3">Create Project</h3>
            <div className="inputBox w-full mb-3">
              <input 
                onChange={(e) => { setName(e.target.value) }} 
                value={name} 
                type="text" 
                placeholder="Enter your project name" 
                className="w-full px-3 py-2 rounded-md text-black"
              />
            </div>
            <Select
              placeholder="Select a Language"
              options={languageOptions}
              styles={customStyles}
              onChange={handleLanguageChange}
            />
            {selectedLanguage && (
              <>
                <p className="text-[14px] text-green-500 mt-2">
                  Selected Language: {selectedLanguage.label}
                </p>
                <button 
                  onClick={createProj} 
                  className="mt-3 px-5 py-2 w-full rounded-md bg-blue-500 hover:bg-blue-600 text-white transition-all"
                >
                  Create
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {isEditModelShow && (
        <div 
          onClick={(e) => {
            if (e.target.classList.contains("modelCon")) {
              setIsEditModelShow(false);
              setName("");
            }
          }} 
          className="modelCon flex flex-col items-center justify-center w-screen h-screen fixed top-0 left-0 bg-[rgba(0,0,0,0.5)]"
        >
          <div className="modelBox flex flex-col items-start rounded-xl p-[20px] w-[25vw] bg-[rgba(30,30,30,0.95)] backdrop-blur-md border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-3">Edit Project Name</h3>
            <div className="inputBox w-full mb-3">
              <input 
                onChange={(e) => { setName(e.target.value) }} 
                value={name} 
                type="text" 
                placeholder="Enter your project name" 
                className="w-full px-3 py-2 rounded-md text-black"
              />
            </div>
            <button 
              onClick={updateProj} 
              className="px-5 py-2 rounded-md bg-blue-500 w-full hover:bg-blue-600 text-white transition-all"
            >
              Update
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
