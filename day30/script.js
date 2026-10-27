const STORAGE_KEY = "edutrackStudents";
const ATTENDANCE_KEY = "edutrackAttendance";

const pages = document.querySelectorAll(".page");
const navItems = document.querySelectorAll(".nav-item");

const studentTable = document.getElementById("studentTable");
const attendanceTable = document.getElementById("attendanceTable");
const gradesTable = document.getElementById("gradesTable");

const studentModal = document.getElementById("studentModal");
const studentForm = document.getElementById("studentForm");

const searchStudent = document.getElementById("searchStudent");
const filterClass = document.getElementById("filterClass");
const attendanceDate = document.getElementById("attendanceDate");

const toast = document.getElementById("toast");

let toastTimer;

function loadData(key, fallback) {
  try {
    const data = JSON.parse(localStorage.getItem(key));
    return data ?? fallback;
  } catch {
    return fallback;
  }
}

const sampleStudents = [
  {
    id: "STU001",
    name: "John Okafor",
    email: "john@example.com",
    className: "SS 2",
    age: 16,
    status: "Active",
    grade: 85
  },
  {
    id: "STU002",
    name: "Grace Williams",
    email: "grace@example.com",
    className: "SS 1",
    age: 15,
    status: "Active",
    grade: 92
  },
  {
    id: "STU003",
    name: "Michael James",
    email: "michael@example.com",
    className: "JSS 3",
    age: 14,
    status: "Active",
    grade: 73
  },
  {
    id: "STU004",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    className: "SS 3",
    age: 17,
    status: "Inactive",
    grade: 64
  },
  {
    id: "STU005",
    name: "David Peter",
    email: "david@example.com",
    className: "JSS 2",
    age: 13,
    status: "Active",
    grade: 78
  }
];

let students = loadData(STORAGE_KEY, null);

if (!Array.isArray(students)) {
  students = sampleStudents;
}

let attendance = loadData(ATTENDANCE_KEY, {});

if (!attendance || typeof attendance !== "object" ||
    Array.isArray(attendance)) {
  attendance = {};
}

function saveData() {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(students)
    );
    localStorage.setItem(
      ATTENDANCE_KEY,
      JSON.stringify(attendance)
    );
  } catch (error) {
    console.warn("Unable to save data:", error);
    showToast("Unable to save. Browser storage may be full.");
  }
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

/* Navigation */

function showPage(pageName) {
  pages.forEach(page => {
    page.classList.toggle(
      "active",
      page.id === pageName + "Page"
    );
  });

  navItems.forEach(item => {
    item.classList.toggle(
      "active",
      item.dataset.page === pageName
    );
  });

  const titles = {
    dashboard: "Dashboard Overview",
    students: "Student Records",
    attendance: "Attendance Management",
    grades: "Student Grades"
  };

  document.getElementById("pageTitle").textContent =
    titles[pageName];

  document.getElementById("sidebar")
    .classList.remove("open");

  renderAll();
}

navItems.forEach(item => {
  item.addEventListener("click", () => {
    showPage(item.dataset.page);
  });
});

document.getElementById("menuBtn")
  .addEventListener("click", () => {
    document.getElementById("sidebar")
      .classList.toggle("open");
  });

/* Student Modal */

function openStudentModal(student = null) {
  studentForm.reset();

  document.getElementById("editStudentId").value =
    student ? student.id : "";

  document.getElementById("modalTitle").textContent =
    student ? "Edit Student" : "Add New Student";

  if (student) {
    document.getElementById("studentName").value =
      student.name;

    document.getElementById("studentEmail").value =
      student.email;

    document.getElementById("studentClass").value =
      student.className;

    document.getElementById("studentAge").value =
      student.age;

    document.getElementById("studentStatus").value =
      student.status;
  }

  studentModal.classList.remove("hidden");
  document.getElementById("studentName").focus();
}

function closeStudentModal() {
  studentModal.classList.add("hidden");
}

document.getElementById("addStudentBtn")
  .addEventListener("click", () => {
    openStudentModal();
  });

document.getElementById("closeModalBtn")
  .addEventListener("click", closeStudentModal);

studentModal.addEventListener("click", event => {
  if (event.target === studentModal) {
    closeStudentModal();
  }
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeStudentModal();
  }
});

/* Register or Edit Student */

function generateStudentId() {
  let id;

  do {
    id = "STU" +
      Math.random().toString(36).slice(2, 10)
        .toUpperCase();
  } while (students.some(student => student.id === id));

  return id;
}

studentForm.addEventListener("submit", event => {
  event.preventDefault();

  const editId =
    document.getElementById("editStudentId").value;

  const name =
    document.getElementById("studentName").value.trim();

  const email =
    document.getElementById("studentEmail").value
      .trim().toLowerCase();

  const className =
    document.getElementById("studentClass").value;

  const age = Number(
    document.getElementById("studentAge").value
  );

  const status =
    document.getElementById("studentStatus").value;

  if (!name || !email || !className ||
      age < 5 || age > 30) {
    showToast("Please enter valid student information.");
    return;
  }

  const duplicateEmail = students.some(student =>
    student.email.toLowerCase() === email &&
    student.id !== editId
  );

  if (duplicateEmail) {
    showToast("A student with this email already exists.");
    return;
  }

  if (editId) {
    const student = students.find(s => s.id === editId);

    if (!student) return;

    Object.assign(student, {
      name,
      email,
      className,
      age,
      status
    });

    showToast("Student updated successfully!");
  } else {
    students.push({
      id: generateStudentId(),
      name,
      email,
      className,
      age,
      status,
      grade: null
    });

    showToast("Student registered successfully!");
  }

  saveData();
  closeStudentModal();
  renderAll();
});

/* Student Table */

function createCell(text, className = "") {
  const cell = document.createElement("td");
  cell.textContent = text;

  if (className) {
    cell.className = className;
  }

  return cell;
}

function renderStudents() {
  studentTable.replaceChildren();

  const keyword = searchStudent.value.toLowerCase();
  const selectedClass = filterClass.value;

  const filtered = students.filter(student => {
    const matchesSearch =
      student.name.toLowerCase().includes(keyword) ||
      student.id.toLowerCase().includes(keyword) ||
      student.email.toLowerCase().includes(keyword);

    const matchesClass =
      !selectedClass || student.className === selectedClass;

    return matchesSearch && matchesClass;
  });

  if (!filtered.length) {
    const row = document.createElement("tr");
    const cell = createCell("No students found.");
    cell.colSpan = 6;
    row.appendChild(cell);
    studentTable.appendChild(row);
    return;
  }

  filtered.forEach(student => {
    const row = document.createElement("tr");

    const nameCell = document.createElement("td");

    const name = document.createElement("div");
    name.className = "student-name";
    name.textContent = student.name;

    const email = document.createElement("div");
    email.className = "student-email";
    email.textContent = student.email;

    nameCell.append(name, email);

    const statusCell = document.createElement("td");
    const badge = document.createElement("span");

    badge.className =
      "status-badge " + student.status.toLowerCase();

    badge.textContent = student.status;
    statusCell.appendChild(badge);

    const actions = document.createElement("td");

    const editBtn = document.createElement("button");
    editBtn.className = "action-btn edit-btn";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => {
      openStudentModal(student);
    });

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "action-btn delete-btn";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => {
      deleteStudent(student.id);
    });

    actions.append(editBtn, deleteBtn);

    row.append(
      nameCell,
      createCell(student.id),
      createCell(student.className),
      createCell(
        student.grade == null ? "—" : student.grade + "%"
      ),
      statusCell,
      actions
    );

    studentTable.appendChild(row);
  });
}

function deleteStudent(id) {
  if (!confirm("Delete this student permanently?")) {
    return;
  }

  students = students.filter(student => student.id !== id);

  Object.keys(attendance).forEach(date => {
    delete attendance[date][id];
  });

  saveData();
  renderAll();
  showToast("Student deleted successfully.");
}

searchStudent.addEventListener("input", renderStudents);
filterClass.addEventListener("change", renderStudents);

/* Grades */

function getLetterGrade(score) {
  if (score == null) return "—";
  if (score >= 70) return "A";
  if (score >= 60) return "B";
  if (score >= 50) return "C";
  if (score >= 45) return "D";
  if (score >= 40) return "E";
  return "F";
}

function renderGrades() {
  gradesTable.replaceChildren();

  students.forEach(student => {
    const row = document.createElement("tr");

    const scoreCell = document.createElement("td");
    const scoreInput = document.createElement("input");

    scoreInput.type = "number";
    scoreInput.min = "0";
    scoreInput.max = "100";
    scoreInput.step = "1";
    scoreInput.className = "grade-input";
    scoreInput.placeholder = "Score";

    scoreInput.value =
      student.grade == null ? "" : student.grade;

    const letterCell = createCell(
      getLetterGrade(student.grade)
    );

    scoreInput.addEventListener("change", () => {
      const value = scoreInput.value.trim();

      if (value === "") {
        student.grade = null;
      } else {
        const score = Number(value);

        if (!Number.isInteger(score) ||
            score < 0 || score > 100) {
          showToast("Grade must be between 0 and 100.");
          scoreInput.value =
            student.grade == null ? "" : student.grade;
          return;
        }

        student.grade = score;
      }

      letterCell.textContent =
        getLetterGrade(student.grade);

      saveData();
      renderDashboard();
      renderStudents();
      showToast("Grade saved successfully.");
    });

    scoreCell.appendChild(scoreInput);

    row.append(
      createCell(student.name),
      createCell(student.className),
      scoreCell,
      letterCell
    );

    gradesTable.appendChild(row);
  });
}

/* Attendance */

function getLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

attendanceDate.value = getLocalDate();

function renderAttendance() {
  attendanceTable.replaceChildren();

  const date = attendanceDate.value;

  if (!date) return;

  if (!attendance[date]) {
    attendance[date] = {};
  }

  students.forEach(student => {
    const row = document.createElement("tr");

    const statusCell = document.createElement("td");
    const select = document.createElement("select");

    select.className = "attendance-select";

    [
      ["", "Not Marked"],
      ["Present", "Present"],
      ["Absent", "Absent"],
      ["Late", "Late"]
    ].forEach(([value, label]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = label;
      select.appendChild(option);
    });

    select.value = attendance[date][student.id] || "";

    select.addEventListener("change", () => {
      if (select.value) {
        attendance[date][student.id] = select.value;
      } else {
        delete attendance[date][student.id];
      }

      saveData();
      renderDashboard();
      showToast("Attendance updated.");
    });

    statusCell.appendChild(select);

    row.append(
      createCell(student.name),
      createCell(student.className),
      statusCell
    );

    attendanceTable.appendChild(row);
  });
}

attendanceDate.addEventListener("change", () => {
  renderAttendance();
  renderDashboard();
});

/* Dashboard Statistics */

function renderDashboard() {
  const total = students.length;

  const active = students.filter(
    student => student.status === "Active"
  ).length;

  const graded = students.filter(
    student => typeof student.grade === "number"
  );

  const average = graded.length
    ? graded.reduce((sum, student) =>
        sum + student.grade, 0) / graded.length
    : 0;

  let present = 0;
  let marked = 0;

  Object.values(attendance).forEach(day => {
    Object.entries(day).forEach(([id, status]) => {
      if (!students.some(s => s.id === id)) return;

      if (["Present", "Absent", "Late"].includes(status)) {
        marked++;
        if (status === "Present" || status === "Late") {
          present++;
        }
      }
    });
  });

  const attendanceRate = marked
    ? Math.round((present / marked) * 100)
    : 0;

  document.getElementById("totalStudents").textContent =
    total;

  document.getElementById("activeStudents").textContent =
    active;

  document.getElementById("attendanceRate").textContent =
    attendanceRate + "%";

  document.getElementById("averageGrade").textContent =
    graded.length ? average.toFixed(1) + "%" : "—";

  renderChart();
  renderRecentStudents();
}

/* Performance Chart */

function renderChart() {
  const chart = document.getElementById("performanceChart");
  chart.replaceChildren();

  const gradeGroups = {
    A: 0,
    B: 0,
    C: 0,
    D: 0,
    E: 0,
    F: 0
  };

  students.forEach(student => {
    if (student.grade != null) {
      gradeGroups[getLetterGrade(student.grade)]++;
    }
  });

  const maximum = Math.max(1, ...Object.values(gradeGroups));

  Object.entries(gradeGroups).forEach(([grade, count]) => {
    const column = document.createElement("div");
    column.className = "chart-column";

    const countLabel = document.createElement("small");
    countLabel.textContent = count;

    const bar = document.createElement("div");
    bar.className = "chart-bar";
    bar.style.height = `${(count / maximum) * 145}px`;

    const label = document.createElement("span");
    label.textContent = grade;

    column.append(countLabel, bar, label);
    chart.appendChild(column);
  });
}

/* Recently Added Students */

function renderRecentStudents() {
  const container =
    document.getElementById("recentStudents");

  container.replaceChildren();

  const recent = [...students].reverse().slice(0, 5);

  if (!recent.length) {
    container.textContent = "No students registered yet.";
    return;
  }

  const wrapper = document.createElement("div");
  wrapper.className = "table-wrapper";

  const table = document.createElement("table");
  const tbody = document.createElement("tbody");

  recent.forEach(student => {
    const row = document.createElement("tr");

    row.append(
      createCell(student.name),
      createCell(student.className),
      createCell(student.status)
    );

    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  wrapper.appendChild(table);
  container.appendChild(wrapper);
}

/* Quick Actions */

document.querySelectorAll("[data-action]").forEach(button => {
  button.addEventListener("click", () => {
    const action = button.dataset.action;

    if (action === "add") {
      showPage("students");
      openStudentModal();
    } else {
      showPage(action);
    }
  });
});

/* CSV Export */

function exportStudents() {
  if (!students.length) {
    showToast("No student records to export.");
    return;
  }

  const headers = [
    "Student ID",
    "Full Name",
    "Email",
    "Class",
    "Age",
    "Status",
    "Grade"
  ];

  const escapeCSV = value => {
    let text = String(value ?? "");

    // Prevent spreadsheet formula execution.
    if (/^[\s]*[=+\-@]/.test(text)) {
      text = "'" + text;
    }

    return '"' + text.replace(/"/g, '""') + '"';
  };

  const rows = students.map(student => [
    student.id,
    student.name,
    student.email,
    student.className,
    student.age,
    student.status,
    student.grade ?? ""
  ]);

  const csv = [headers, ...rows]
    .map(row => row.map(escapeCSV).join(","))
    .join("\r\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "edutrack-students.csv";

  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);

  showToast("Student records exported successfully.");
}

document.getElementById("exportBtn")
  .addEventListener("click", exportStudents);

/* Render Everything */

function renderAll() {
  renderStudents();
  renderAttendance();
  renderGrades();
  renderDashboard();
}

renderAll();