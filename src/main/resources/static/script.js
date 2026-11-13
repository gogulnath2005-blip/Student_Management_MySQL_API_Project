
const API_URL = "/api/students";

const form = document.getElementById("studentForm");
const table = document.getElementById("studentTable");
const message = document.getElementById("message");

let students = [];

// Show messages
function showMessage(text, success = true) {
    message.textContent = text;
    message.style.color = success ? "green" : "red";
}

// Load all students
async function loadStudents() {
    try {
        document.getElementById("serverStatus").textContent =
            "Checking...";

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Unable to fetch students");
        }

        students = await response.json();

        displayStudents(students);

        document.getElementById("totalStudents").textContent =
            students.length;

        document.getElementById("serverStatus").textContent =
            "Connected";

    } catch (error) {
        document.getElementById("serverStatus").textContent =
            "Offline";

        table.innerHTML = `
            <tr>
                <td colspan="6">
                    Cannot connect to Spring Boot API.
                    Check your backend and API URL.
                </td>
            </tr>
        `;

        showMessage(error.message, false);
    }
}

// Display student records
function displayStudents(data) {
    table.innerHTML = "";

    if (data.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="6">No students found.</td>
            </tr>
        `;
        return;
    }

    data.forEach(student => {
        const row = document.createElement("tr");

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

        const actionCell = document.createElement("td");

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.className = "edit-btn";
        editButton.addEventListener("click", () => editStudent(student));

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";
        deleteButton.addEventListener("click", () =>
            deleteStudent(student.id)
        );

        actionCell.append(editButton, deleteButton);
        row.appendChild(actionCell);

        table.appendChild(row);
    });
}

// Add or update student
form.addEventListener("submit", async function(event) {
    event.preventDefault();

    const id = document.getElementById("studentId").value;

    const student = {
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        course: document.getElementById("course").value.trim(),
        age: Number(document.getElementById("age").value)
    };

    if (!student.name || !student.email ||
        !student.course || student.age < 1) {
        showMessage("Please enter valid student details.", false);
        return;
    }

    const url = id ? `${API_URL}/${id}` : API_URL;
    const method = id ? "PUT" : "POST";

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(student)
        });

        if (!response.ok) {
            throw new Error("Unable to save student");
        }

        showMessage(id
            ? "Student updated successfully!"
            : "Student added successfully!"
        );

        resetForm();
        await loadStudents();

    } catch (error) {
        showMessage(error.message, false);
    }
});

// Edit student
function editStudent(student) {
    document.getElementById("studentId").value = student.id;
    document.getElementById("name").value = student.name;
    document.getElementById("email").value = student.email;
    document.getElementById("course").value = student.course;
    document.getElementById("age").value = student.age;

    document.getElementById("formTitle").textContent =
        "Update Student";

    document.getElementById("submitBtn").textContent =
        "Update Student";

    document.getElementById("cancelBtn").hidden = false;

    document.getElementById("student-form").scrollIntoView({
        behavior: "smooth"
    });
}

// Delete student
async function deleteStudent(id) {
    if (!confirm("Are you sure you want to delete this student?")) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Unable to delete student");
        }

        showMessage("Student deleted successfully!");
        await loadStudents();

    } catch (error) {
        showMessage(error.message, false);
    }
}

// Reset form
function resetForm() {
    form.reset();

    document.getElementById("studentId").value = "";

    document.getElementById("formTitle").textContent =
        "Add New Student";

    document.getElementById("submitBtn").textContent =
        "Add Student";

    document.getElementById("cancelBtn").hidden = true;
}

// Cancel editing
document.getElementById("cancelBtn").addEventListener(
    "click", resetForm
);

// Search students
document.getElementById("searchInput").addEventListener(
    "input", function() {

        const searchValue = this.value.toLowerCase();

        const filteredStudents = students.filter(student =>
            String(student.id).includes(searchValue) ||
            (student.name || "").toLowerCase().includes(searchValue) ||
            (student.email || "").toLowerCase().includes(searchValue) ||
            (student.course || "").toLowerCase().includes(searchValue)
        );

        displayStudents(filteredStudents);
    }
);

// Start application
loadStudents();
