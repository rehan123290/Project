// Sample student data (in a real application, this would come from a server/database)
const studentDatabase = [
    {
        hallTicket: "12345678",
        dob: "2002-05-15",
        name: "Raj Kumar",
        subjects: [
            { name: "Mathematics", obtained: 42, max: 40 },
            { name: "Physics", obtained: 38, max: 40 },
            { name: "Chemistry", obtained: 37, max: 40 },
            { name: "English", obtained: 35, max: 40 }
        ],
        rank: 1256,
        percentile: 98.67
    },
    {
        hallTicket: "87654321",
        dob: "2001-10-20",
        name: "Priya Sharma",
        subjects: [
            { name: "Mathematics", obtained: 39, max: 40 },
            { name: "Physics", obtained: 35, max: 40 },
            { name: "Chemistry", obtained: 38, max: 40 },
            { name: "English", obtained: 36, max: 40 }
        ],
        rank: 3421,
        percentile: 92.45
    },
    {
        hallTicket: "23456789",
        dob: "2003-01-10",
        name: "Arjun Reddy",
        subjects: [
            { name: "Mathematics", obtained: 36, max: 40 },
            { name: "Physics", obtained: 32, max: 40 },
            { name: "Chemistry", obtained: 34, max: 40 },
            { name: "English", obtained: 30, max: 40 }
        ],
        rank: 12567,
        percentile: 78.91
    }
];

// Cache DOM Elements
const loginForm = document.getElementById('login-form');
const hallTicketInput = document.getElementById('hallticket');
const dobInput = document.getElementById('dob');
const notification = document.getElementById('notification');
const notificationText = document.getElementById('notification-text');
const resultContainer = document.getElementById('result-container');
const studentNameElement = document.getElementById('student-name');
const resultHallTicket = document.getElementById('result-hallticket');
const resultDob = document.getElementById('result-dob');
const marksTableBody = document.getElementById('marks-tbody');
const totalObtained = document.getElementById('total-obtained');
const totalMax = document.getElementById('total-max');
const eamcetRank = document.getElementById('eamcet-rank');
const percentile = document.getElementById('percentile');
const printBtn = document.getElementById('print-btn');
const closeBtn = document.getElementById('close-btn');
const currentYear = document.getElementById('current-year');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Set current year in the footer
    currentYear.textContent = new Date().getFullYear();
    
    // Add event listeners
    loginForm.addEventListener('submit', handleFormSubmit);
    printBtn.addEventListener('click', () => window.print());
    closeBtn.addEventListener('click', closeResult);
    
    // Pre-fill test credentials for demo
    hallTicketInput.value = "12345678";
    dobInput.value = "2002-05-15";
});

/**
 * Handle form submission
 * @param {Event} e - Form submit event
 */
function handleFormSubmit(e) {
    e.preventDefault();
    
    const hallTicket = hallTicketInput.value.trim();
    const dob = dobInput.value;
    
    // Reset notification
    notification.className = 'notification';
    
    // Validate inputs
    if (!hallTicket || !dob) {
        showNotification('Please fill all the required fields.', 'error');
        return;
    }
    
    // Find student in database
    const student = findStudent(hallTicket, dob);
    
    if (student) {
        // Show success notification
        showNotification('Login successful! Loading your results...', 'success');
        
        // Short delay to show the notification before displaying results
        setTimeout(() => displayResults(student), 800);
    } else {
        showNotification('Invalid Hall Ticket Number or Date of Birth. Please try again.', 'error');
    }
}

/**
 * Find student in database
 * @param {string} hallTicket - Hall ticket number
 * @param {string} dob - Date of birth
 * @returns {Object|undefined} - Student data or undefined
 */
function findStudent(hallTicket, dob) {
    return studentDatabase.find(student => 
        student.hallTicket === hallTicket && 
        student.dob === dob
    );
}

/**
 * Show notification message
 * @param {string} message - Message to display
 * @param {string} type - Notification type ('error' or 'success')
 */
function showNotification(message, type) {
    notificationText.textContent = message;
    notification.className = `notification ${type}`;
}

/**
 * Display student results
 * @param {Object} student - Student data
 */
function displayResults(student) {
    // Hide login container and show result container
    document.querySelector('.login-container').style.display = 'none';
    resultContainer.style.display = 'block';
    
    // Fill student details
    studentNameElement.textContent = student.name;
    resultHallTicket.textContent = student.hallTicket;
    resultDob.textContent = formatDate(student.dob);
    
    // Clear existing table rows
    marksTableBody.innerHTML = '';
    
    // Fill marks table
    let totalMarks = 0;
    let totalMaxMarks = 0;
    
    // Create document fragment for better performance
    const fragment = document.createDocumentFragment();
    
    student.subjects.forEach(subject => {
        const row = document.createElement('tr');
        
        // Subject name cell
        const subjectNameCell = document.createElement('td');
        subjectNameCell.textContent = subject.name;
        
        // Marks obtained cell
        const marksObtainedCell = document.createElement('td');
        marksObtainedCell.textContent = subject.obtained;
        
        // Max marks cell
        const maxMarksCell = document.createElement('td');
        maxMarksCell.textContent = subject.max;
        
        row.append(subjectNameCell, marksObtainedCell, maxMarksCell);
        fragment.appendChild(row);
        
        // Update totals
        totalMarks += subject.obtained;
        totalMaxMarks += subject.max;
    });
    
    // Append all rows at once
    marksTableBody.appendChild(fragment);
    
    // Fill totals
    totalObtained.textContent = totalMarks;
    totalMax.textContent = totalMaxMarks;
    
    // Fill rank and percentile
    eamcetRank.textContent = student.rank;
    percentile.textContent = student.percentile.toFixed(2);
}

/**
 * Format date string to local format
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {string} - Formatted date string
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

/**
 * Close result and reset form
 */
function closeResult() {
    resultContainer.style.display = 'none';
    document.querySelector('.login-container').style.display = 'block';
    loginForm.reset();
    notification.className = 'notification';
} 