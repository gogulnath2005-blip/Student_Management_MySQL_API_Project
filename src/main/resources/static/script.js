
// ======================================
// STUDENTHUB - STUDENT MANAGEMENT SYSTEM
// ======================================

// API CONFIGURATION
const API_URL = "/api/students";

// DOM ELEMENTS
const form = document.getElementById("studentForm");
const table = document.getElementById("studentTable");
const message = document.getElementById("message");

const submitBtn = document.getElementById("submitBtn");
const cancelBtn = document.getElementById("cancelBtn");

let students = [];
let searchValue = "";

// SHOW MESSAGE
function showMessage(text, success = true) {

    message.textContent = text;

    message.style.color = success ? "#16a085" : "#e74c3c";

    message.classList.remove("message-animation");

    void message.offsetWidth;

    message.classList.add("message-animation");
}

// API REQUEST HANDLER
async function apiRequest(url, options = {}) {

    const response = await fetch(url, options);

    if (!response.ok) {

        let errorMessage = `Request failed: ${response.status}`;

        try {
            const errorData = await response.json();

            if (errorData.message) {
                errorMessage = errorData.message;
            }
        } catch {
            // Keep the default error message.
        }

        throw new Error(errorMessage);
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

// LOAD ALL STUDENTS
async function loadStudents() {

    const status = document.getElementById("serverStatus");

    status.textContent = "Checking...";

    try {

        students = await apiRequest(API_URL);

        if (!Array.isArray(students)) {
            throw new Error("Unexpected API response format.");
        }

        status.textContent = "Connected";
        status.style.color = "#16a085";

        document.getElementById("totalStudents").textContent =
            students.length;

        displayStudents(students);

    } catch (error) {

        console.error("API Error:", error);

        status.textContent = "Offline";
        status.style.color = "#e74c3c";

        table.innerHTML = `
            <tr>
                <td colspan="6">
                    Unable to connect to Student API.
                    Please check your backend connection.
                </td>
            </tr>
        `;

        document.getElementById("totalStudents").textContent = "0";

        showMessage(error.message, false);
    }
}

// DISPLAY STUDENTS
function displayStudents(data) {

    table.innerHTML = "";

    if (data.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="6">
                    No student records found.
                </td>
            </tr>
        `;

        return;
    }

    data.forEach((student, index) => {

        const row = document.createElement("tr");

        row.style.animationDelay = `${index * 0.06}s`;

        const values = [
            student.id,
            student.name,
            student.email,
            student.course,
            student.age
        ];

        values.forEach(value => {

            const cell = document.createElement("td");

            cell.textContent = value ?? "";

            row.appendChild(cell);
        });

        // ACTION BUTTONS
        const actionCell = document.createElement("td");

        const editButton = document.createElement("button");

        editButton.textContent = "✎ Edit";
        editButton.className = "edit-btn";

        editButton.addEventListener("click", () => {
            editStudent(student);
        });

        const deleteButton = document.createElement("button");

        deleteButton.textContent = "✕ Delete";
        deleteButton.className = "delete-btn";

        deleteButton.addEventListener("click", () => {
            deleteStudent(student.id);
        });

        actionCell.append(editButton, deleteButton);

        row.appendChild(actionCell);

        table.appendChild(row);
    });
}

// SEARCH STUDENTS
function searchStudents() {

    const filteredStudents = students.filter(student => {

        return (

            String(student.id).toLowerCase().includes(searchValue) ||

            (student.name || "").toLowerCase().includes(searchValue) ||

            (student.email || "").toLowerCase().includes(searchValue) ||

            (student.course || "").toLowerCase().includes(searchValue)

        );

    });

    displayStudents(filteredStudents);
}

document.getElementById("searchInput").addEventListener(
    "input",
    function () {

        searchValue = this.value.trim().toLowerCase();

        searchStudents();
    }
);

// ADD OR UPDATE STUDENT
form.addEventListener("submit", async function(event) {

    event.preventDefault();

    const id = document.getElementById("studentId").value;

    const student = {

        name: document.getElementById("name").value.trim(),

        email: document.getElementById("email").value.trim(),

        course: document.getElementById("course").value.trim(),

        age: Number(document.getElementById("age").value)

    };

    if (
        !student.name ||
        !student.email ||
        !student.course ||
        !Number.isInteger(student.age) ||
        student.age < 1
    ) {

        showMessage("Please enter valid student details.", false);

        return;
    }

    const url = id ? `${API_URL}/${id}` : API_URL;

    const method = id ? "PUT" : "POST";

    const originalText = submitBtn.innerHTML;

    submitBtn.disabled = true;

    submitBtn.innerHTML = "⏳ Saving...";

    try {

        await apiRequest(url, {

            method: method,

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(student)

        });

        showMessage(
            id
                ? "Student updated successfully! ✓"
                : "Student added successfully! ✓"
        );

        resetForm();

        await loadStudents();

        document.getElementById("searchInput").value = "";

        searchValue = "";

        showMessage(
            id
                ? "Student updated successfully! ✓"
                : "Student added successfully! ✓"
        );

    } catch (error) {

        console.error(error);

        showMessage(error.message, false);

    } finally {

        submitBtn.disabled = false;

        submitBtn.innerHTML = originalText;
    }

});

// EDIT STUDENT
function editStudent(student) {

    document.getElementById("studentId").value = student.id;

    document.getElementById("name").value = student.name;

    document.getElementById("email").value = student.email;

    document.getElementById("course").value = student.course;

    document.getElementById("age").value = student.age;

    document.getElementById("formTitle").textContent =
        "Update Student";

    submitBtn.innerHTML = "✎ Update Student";

    cancelBtn.hidden = false;

    document.getElementById("student-form").scrollIntoView({

        behavior: "smooth",

        block: "start"

    });

    showMessage("Editing student ID: " + student.id);
}

// DELETE STUDENT
async function deleteStudent(id) {

    if (!confirm("Are you sure you want to delete this student?")) {
        return;
    }

    try {

        await apiRequest(`${API_URL}/${id}`, {

            method: "DELETE"

        });

        showMessage("Student deleted successfully! ✓");

        await loadStudents();

    } catch (error) {

        console.error(error);

        showMessage(error.message, false);
    }
}

// RESET FORM
function resetForm() {

    form.reset();

    document.getElementById("studentId").value = "";

    document.getElementById("formTitle").textContent =
        "Add New Student";

    submitBtn.innerHTML = "<span>＋</span> Add Student";

    cancelBtn.hidden = true;
}

// CANCEL EDITING
cancelBtn.addEventListener("click", () => {

    resetForm();

    showMessage("Editing cancelled.");

});

// INITIALIZE APPLICATION
document.addEventListener("DOMContentLoaded", () => {

    loadStudents();

});
