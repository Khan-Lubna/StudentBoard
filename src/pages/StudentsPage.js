import "./styles.css";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebaseConfig";
import { signOut } from "firebase/auth";

function StudentsPage() {
  const navigate = useNavigate();
  const [ students, setStudents ] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ showModal, setShowModal ] = useState(false);
  const [ currentEditId, setCurrentEditId ] = useState(null);
  const [ viewData, setViewData ] = useState(null);
  const [ formData, setFormData ] = useState({
    id: "",
    name: "",
    class: "",
    section: "",
    rollNumber: "",
    age: "",
    address: "",
    phone: "",
    email: "",
    parentName: "",
    parentPhone: "",
    city: "",
  });
  
  const studentsCollectionRef = collection(db, "students");

  //Fetch students from Firestore
  useEffect(() => {
    const fetchStudents = async () => {
      try{
      const data = await getDocs(studentsCollectionRef);
      setStudents(data.docs.map((doc) => ({ ...doc.data(), id:doc.id})));
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };
    fetchStudents();
  }, [studentsCollectionRef]);

  //Handle Logout
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  //Handle Add/Edit Student Modal 
  const handleAddStudent = async () => {
    try{
      if(currentEditId) {
        const studentDocRef = doc(db, "students", currentEditId);
        await updateDoc(studentDocRef, formData);
      } else {
        await addDoc(studentsCollectionRef, formData);
      }
    setShowModal(false);
    setFormData( {
      name: "",
      class: "",
      section: "",
      rollNumber: "",
      age: "",
      address: "",
      phone: "",
      email: "",
      parentName: "",
      parentPhone: "",
      city: "",
    });
    setCurrentEditId(null);

    //Refresh data without reloading
    const updatedData = await getDocs(studentsCollectionRef);
    setStudents(updatedData.docs.map((doc) => ({ ...doc.data(), id: doc.id})));
  } catch (error) {
    console.error("Error adding student:", error);
  }
  };
  
  //Handle Edit Student Modal
  const handleEdit = (student) => {
    setCurrentEditId(student.id);
    setFormData({
      name: student.name,
      class: student.class,
      section: student.section,
      rollNumber: student.rollNumber,
      age: student.age,
      address: student.address,
      phone: student.phone,
      email: student.email,
      parentName: student.parentName,
      parentPhone: student.parentPhone,
      city: student.city,
    });
    setShowModal(true);
  };
  
  //Handle View Student
  const handleView = (student) => {
    setViewData(student);
  };
  { viewData && (
    <div className="fixed insect-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded w-1/2">
       <h2 className="text-xl font-bold mb-4">Student Details</h2>
       <div className="grid grid-cols-2 gap-4">
        {Object.keys(viewData).map((key) => (
          <div key={key}>
            <p className="text-sm font-bold captalize">{key}:</p>
            <p>{viewData[key]}</p>
          </div>
        ))}
       </div>
       <div className="mt-4 flex justify-end">
        <button onClick={() => setViewData(null)} className="px-4 py-2 bg-gray-400 text-white rounded">Close</button>
       </div>
      </div>
    </div>
  )}

  //Handle delete student
  const handleDelete = async (id) => {
    console.log("Deleting student with ID:", id);
    try {
    const studentDocRef = doc(db, "students", id);
    await deleteDoc(studentDocRef);
    //Refresh data without reloading
    setStudents((prevStudents) => prevStudents.filter((student) => student.id !== id));
    console.log("Students deletd successfully!");
    } catch (error) {
      console.error("Error deleting student:", error);
    }
  };

  //Auhtentication Check
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate("/");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  return (
    <>
    {/* Navbar for smaller screen */}
    <div className="navbar">
      <button className="menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}></button>
      <h2 className="title">Student Board</h2>
      <button className="logout-btn" onClick={handleLogout}>Logout</button>
    </div>
    <div class="container">
      <div class="sidebar">
       <h1>Dashboard</h1>
       <ul>
        <li onClick={() => navigate("/students")}>Students Page</li>
        <li onClick={handleLogout}>Logout</li>
       </ul>
      </div>

      <div class="main-content">
        <div class="add-student">
        <h1>Student Page</h1>
        <button onClick={() => setShowModal(true)}>Add Student</button>
        </div>
       <table class="table">
        <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Class</th>
          <th>Section</th>
          <th>Roll Number</th>
          <th>Actions</th>
        </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td>{student.id}</td>
              <td>{student.name}</td>
              <td>{student.class}</td>
              <td>{student.section}</td>
              <td>{student.rollNumber}</td>
              <td class="table-actions">
                <button class="view" onClick={() => handleView(student)}>View</button>
                <button class="edit" onClick={() => handleEdit(student)}>Edit</button>
                <button class="delete" onClick={() => { console.log("Delete button clicked for ID:", student.id); 
                  handleDelete(student.id)}}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
       </table>

       { showModal && (
        <div className="modal-overlay fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" >
          <div className="modal bg-white w-full max-w-lg md:max-w-2xl lg:max-w-3xl rounded-lg shadow-lg p-6">
           <h2 className="text-center font-bold text-lg mb-6">{currentEditId ? "Edit Student" : "Add Student"}</h2>
           <form onSubmit={(e) => {
            e.preventDefault();
            handleAddStudent();
           }}
           className="grid grid-cols-1 md:grid-cols-2 gap-4"
           >
            {Object.keys(formData).map((field) => (
              <div key={field} className="form-group flex flex-col">
                <label className="text-gray-700 font-semibold capitalize mb-1">{field.replace(/([A-Z])/g, "$1").trim()}</label>
                <input
                  type="text"
                  className="form-input border border-gray-300 p-2 md:p-3 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData[field]}
                  onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                />
              </div>
            ))}
              <div className="modal-buttons  col-span-1 md:col-span-2 flex flex-col md:flex-row justify-end mt-4 gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="cancel-btn bg-gray-400 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition w-full md:w-auto">Cancel</button>
                <button type="submit" className="submit-btn bg-blue-500 text-white px-5 py-2 rounded-md hover:bg-blue-600 transition w-full md:w-auto">{currentEditId ? "Save Changes" : "Add Student"}</button>
              </div> 
              </form>
             </div>
          </div>
       )}

{viewData && (
          <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-6 rounded shadow-lg w-1/3">
              <h2 className="text-xl font-bold mb-4 text-center">Student Details</h2>
              <div className="flex flex-col space-y-2 student-details">
              <p><strong>ID:</strong> {viewData.id}</p>
              <p><strong>Name:</strong> {viewData.name}</p>
              <p><strong>Class:</strong> {viewData.class}</p>
              <p><strong>Section:</strong> {viewData.section}</p>
              <p><strong>Roll Number:</strong> {viewData.rollNumber}</p>
              <p><strong>Age:</strong> {viewData.age}</p>
              <p><strong>Address:</strong> {viewData.address}</p>
              <p><strong>Phone:</strong> {viewData.phone}</p>
              <p><strong>Email:</strong> {viewData.email}</p>
              <p><strong>Parent Name:</strong> {viewData.parentName}</p>
              <p><strong>Parent Phone:</strong> {viewData.parentPhone}</p>
              <p><strong>City:</strong> {viewData.city}</p>
              </div>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => setViewData(null)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
}
export default StudentsPage;