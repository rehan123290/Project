// Doctors Management JavaScript

document.addEventListener('DOMContentLoaded', () => {
    // Get utils from the main js file
    const { 
        showNotification, 
        formatDate, 
        generateId, 
        saveToLocalStorage, 
        getFromLocalStorage, 
        validateForm 
    } = window.hospitalUtils;

    // Cache DOM elements for better performance
    const domElements = {
        doctorsGrid: document.querySelector('.doctors-grid'),
        doctorForm: document.getElementById('doctor-form'),
        doctorModal: document.getElementById('doctor-modal'),
        confirmModal: document.getElementById('confirm-modal'),
        addDoctorBtn: document.getElementById('add-doctor-btn'),
        cancelDoctorBtn: document.getElementById('cancel-doctor'),
        doctorSearch: document.getElementById('doctor-search'),
        doctorFilter: document.getElementById('doctor-filter'),
        prevPageBtn: document.getElementById('prev-page'),
        nextPageBtn: document.getElementById('next-page'),
        pageInfo: document.getElementById('page-info'),
        modalTitle: document.getElementById('modal-title'),
        closeModalBtns: document.querySelectorAll('.close'),
        cancelConfirmBtn: document.getElementById('cancel-confirm'),
        confirmActionBtn: document.getElementById('confirm-action'),
        confirmMessage: document.getElementById('confirm-message')
    };
    
    // State management using a state object for better organization
    const state = {
        doctors: getFromLocalStorage('doctors') || [],
        currentPage: 1,
        itemsPerPage: 6, // Fewer items per page than patients for card layout
        editingDoctorId: null,
        selectedDoctorId: null,
        filteredDoctors: [],
        searchDebounceTimer: null
    };
    
    // Initialize the page
    initializePage();
    
    /**
     * Initialize with sample data if none exists
     */
    function initializePage() {
        if (state.doctors.length === 0) {
            state.doctors = getSampleDoctors();
            saveToLocalStorage('doctors', state.doctors);
        }
        
        // Initial render
        renderDoctorsGrid();
        
        // Add event listeners
        attachEventListeners();
    }
    
    /**
     * Attach all event listeners using delegation where appropriate
     */
    function attachEventListeners() {
        // Add doctor button
        domElements.addDoctorBtn.addEventListener('click', handleAddDoctorClick);
        
        // Form submission
        domElements.doctorForm.addEventListener('submit', handleDoctorFormSubmit);
        
        // Cancel button
        domElements.cancelDoctorBtn.addEventListener('click', () => closeModal(domElements.doctorModal));
        
        // Search input with debounce for performance
        domElements.doctorSearch.addEventListener('input', debounce(handleSearch, 300));
        
        // Filter change
        domElements.doctorFilter.addEventListener('change', handleFilter);
        
        // Pagination
        domElements.prevPageBtn.addEventListener('click', handlePrevPage);
        domElements.nextPageBtn.addEventListener('click', handleNextPage);
        
        // Close modal buttons
        domElements.closeModalBtns.forEach(btn => {
            btn.addEventListener('click', handleCloseModalClick);
        });
        
        // Cancel confirmation
        domElements.cancelConfirmBtn.addEventListener('click', () => closeModal(domElements.confirmModal));
        
        // Confirm action
        domElements.confirmActionBtn.addEventListener('click', handleConfirmAction);
        
        // Event delegation for doctor card actions
        domElements.doctorsGrid.addEventListener('click', handleDoctorGridClick);
    }
    
    /**
     * Handle click on add doctor button
     */
    function handleAddDoctorClick() {
        domElements.modalTitle.textContent = 'Add New Doctor';
        domElements.doctorForm.reset();
        state.editingDoctorId = null;
        document.getElementById('doctor-joining-date').valueAsDate = new Date();
        openModal(domElements.doctorModal);
    }
    
    /**
     * Handle doctor form submission
     * @param {Event} e - Submit event
     */
    function handleDoctorFormSubmit(e) {
        e.preventDefault();
        
        // Validate the form
        if (!validateForm(domElements.doctorForm)) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        // Get form data
        const doctorData = {
            id: state.editingDoctorId || generateId(),
            name: document.getElementById('doctor-name').value,
            specialty: document.getElementById('doctor-specialty').value,
            qualification: document.getElementById('doctor-qualification').value,
            experience: document.getElementById('doctor-experience').value,
            phone: document.getElementById('doctor-phone').value,
            email: document.getElementById('doctor-email').value,
            joiningDate: document.getElementById('doctor-joining-date').value,
            schedule: document.getElementById('doctor-schedule').value,
            bio: document.getElementById('doctor-bio').value || '',
            photo: document.getElementById('doctor-photo').value || 'https://via.placeholder.com/150?text=Doctor'
        };
        
        // Add or update doctor
        if (state.editingDoctorId) {
            updateDoctor(doctorData);
        } else {
            addDoctor(doctorData);
        }
        
        // Reset form and close modal
        domElements.doctorForm.reset();
        closeModal(domElements.doctorModal);
    }
    
    /**
     * Add a new doctor
     * @param {Object} doctorData - Doctor data
     */
    function addDoctor(doctorData) {
        state.doctors.push(doctorData);
        saveToLocalStorage('doctors', state.doctors);
        showNotification('Doctor added successfully', 'success');
        renderDoctorsGrid();
    }
    
    /**
     * Update existing doctor
     * @param {Object} doctorData - Doctor data
     */
    function updateDoctor(doctorData) {
        const index = state.doctors.findIndex(d => d.id === state.editingDoctorId);
        if (index !== -1) {
            state.doctors[index] = doctorData;
            saveToLocalStorage('doctors', state.doctors);
            showNotification('Doctor updated successfully', 'success');
            renderDoctorsGrid();
        }
    }
    
    /**
     * Handle search with debounce
     */
    function handleSearch() {
        state.currentPage = 1;
        renderDoctorsGrid();
    }
    
    /**
     * Handle filter change
     */
    function handleFilter() {
        state.currentPage = 1;
        renderDoctorsGrid();
    }
    
    /**
     * Handle previous page button click
     */
    function handlePrevPage() {
        if (state.currentPage > 1) {
            state.currentPage--;
            renderDoctorsGrid();
        }
    }
    
    /**
     * Handle next page button click
     */
    function handleNextPage() {
        const totalPages = Math.ceil(state.filteredDoctors.length / state.itemsPerPage);
        if (state.currentPage < totalPages) {
            state.currentPage++;
            renderDoctorsGrid();
        }
    }
    
    /**
     * Handle close modal button click
     */
    function handleCloseModalClick() {
        closeModal(domElements.doctorModal);
        closeModal(domElements.confirmModal);
    }
    
    /**
     * Handle doctor grid click using event delegation
     * @param {Event} e - Click event
     */
    function handleDoctorGridClick(e) {
        // Edit button click
        if (e.target.closest('.edit-doctor')) {
            const doctorId = e.target.closest('.doctor-card').dataset.id;
            handleEditDoctor(doctorId);
        }
        
        // Delete button click
        if (e.target.closest('.delete-doctor')) {
            const doctorId = e.target.closest('.doctor-card').dataset.id;
            handleDeleteDoctor(doctorId);
        }
    }
    
    /**
     * Handle edit doctor
     * @param {string} doctorId - Doctor ID
     */
    function handleEditDoctor(doctorId) {
        // Find the doctor
        const doctor = state.doctors.find(d => d.id === doctorId);
        if (!doctor) return;
        
        // Set form fields
        document.getElementById('doctor-id').value = doctor.id;
        document.getElementById('doctor-name').value = doctor.name;
        document.getElementById('doctor-specialty').value = doctor.specialty;
        document.getElementById('doctor-qualification').value = doctor.qualification;
        document.getElementById('doctor-experience').value = doctor.experience;
        document.getElementById('doctor-phone').value = doctor.phone;
        document.getElementById('doctor-email').value = doctor.email;
        document.getElementById('doctor-joining-date').value = doctor.joiningDate;
        document.getElementById('doctor-schedule').value = doctor.schedule;
        document.getElementById('doctor-bio').value = doctor.bio || '';
        document.getElementById('doctor-photo').value = doctor.photo || '';
        
        // Set editing state
        state.editingDoctorId = doctorId;
        domElements.modalTitle.textContent = 'Edit Doctor';
        
        // Open modal
        openModal(domElements.doctorModal);
    }
    
    /**
     * Handle delete doctor
     * @param {string} doctorId - Doctor ID
     */
    function handleDeleteDoctor(doctorId) {
        // Set selected doctor
        state.selectedDoctorId = doctorId;
        
        // Show confirmation modal
        domElements.confirmMessage.textContent = 'Are you sure you want to delete this doctor?';
        openModal(domElements.confirmModal);
    }
    
    /**
     * Handle confirm action (delete)
     */
    function handleConfirmAction() {
        if (state.selectedDoctorId) {
            // Filter out the doctor
            state.doctors = state.doctors.filter(d => d.id !== state.selectedDoctorId);
            
            // Save to local storage
            saveToLocalStorage('doctors', state.doctors);
            
            // Show notification
            showNotification('Doctor deleted successfully', 'success');
            
            // Reset state and close modal
            state.selectedDoctorId = null;
            closeModal(domElements.confirmModal);
            
            // Re-render the grid
            renderDoctorsGrid();
        }
    }
    
    /**
     * Render doctors grid
     */
    function renderDoctorsGrid() {
        // Filter doctors
        filterDoctors();
        
        // Calculate pagination
        calculatePagination();
        
        // Create and append doctor cards
        renderDoctorCards();
    }
    
    /**
     * Filter doctors based on search and filter
     */
    function filterDoctors() {
        const searchTerm = domElements.doctorSearch.value.toLowerCase();
        const filterValue = domElements.doctorFilter.value;
        
        state.filteredDoctors = state.doctors.filter(doctor => {
            // Apply search filter
            const matchesSearch = doctor.name.toLowerCase().includes(searchTerm) || 
                               doctor.specialty.toLowerCase().includes(searchTerm) || 
                               doctor.email.toLowerCase().includes(searchTerm);
            
            // Apply specialty filter
            const matchesFilter = filterValue === 'all' || 
                               doctor.specialty.toLowerCase() === filterValue;
            
            return matchesSearch && matchesFilter;
        });
    }
    
    /**
     * Calculate pagination values
     */
    function calculatePagination() {
        const totalPages = Math.ceil(state.filteredDoctors.length / state.itemsPerPage);
        
        // Update pagination display
        domElements.pageInfo.textContent = `Page ${state.currentPage} of ${totalPages || 1}`;
        domElements.prevPageBtn.disabled = state.currentPage === 1;
        domElements.nextPageBtn.disabled = state.currentPage === totalPages || totalPages === 0;
    }
    
    /**
     * Create and append doctor cards
     */
    function renderDoctorCards() {
        // Clear the grid
        domElements.doctorsGrid.innerHTML = '';
        
        // Get the doctors to display
        const start = (state.currentPage - 1) * state.itemsPerPage;
        const end = start + state.itemsPerPage;
        const doctorsToDisplay = state.filteredDoctors.slice(start, end);
        
        // Show message if no doctors
        if (doctorsToDisplay.length === 0) {
            domElements.doctorsGrid.innerHTML = `
                <div class="no-results">
                    <p>No doctors found. Try adjusting your search criteria.</p>
                </div>
            `;
            return;
        }
        
        // Create doctor cards
        const fragment = document.createDocumentFragment();
        
        doctorsToDisplay.forEach(doctor => {
            const doctorCard = createDoctorCard(doctor);
            fragment.appendChild(doctorCard);
        });
        
        domElements.doctorsGrid.appendChild(fragment);
    }
    
    /**
     * Create a doctor card
     * @param {Object} doctor - Doctor data
     * @returns {HTMLElement} - Doctor card element
     */
    function createDoctorCard(doctor) {
        const card = document.createElement('div');
        card.className = 'doctor-card';
        card.dataset.id = doctor.id;
        
        card.innerHTML = `
            <img src="${doctor.photo}" alt="Dr. ${doctor.name}" onerror="this.src='https://via.placeholder.com/150?text=Doctor'">
            <h3>Dr. ${doctor.name}</h3>
            <div class="doctor-specialty">${doctor.specialty}</div>
            <p>${doctor.qualification}</p>
            <div class="doctor-details">
                <p><i class="fas fa-calendar-check"></i> ${doctor.schedule}</p>
                <p><i class="fas fa-briefcase"></i> ${doctor.experience} years experience</p>
                <p><i class="fas fa-phone"></i> ${doctor.phone}</p>
            </div>
            <div class="doctor-actions">
                <button class="btn secondary edit-doctor">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn danger delete-doctor">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        
        return card;
    }
    
    /**
     * Open modal with animation
     * @param {HTMLElement} modal - Modal element
     */
    function openModal(modal) {
        modal.style.display = 'flex';
        // Force reflow to ensure animation works
        modal.offsetHeight;
        modal.classList.add('show');
    }
    
    /**
     * Close modal with animation
     * @param {HTMLElement} modal - Modal element
     */
    function closeModal(modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    }
    
    /**
     * Debounce function to limit function calls
     * @param {Function} func - Function to debounce
     * @param {number} delay - Delay in milliseconds
     * @returns {Function} - Debounced function
     */
    function debounce(func, delay) {
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(state.searchDebounceTimer);
            state.searchDebounceTimer = setTimeout(() => {
                func.apply(context, args);
            }, delay);
        };
    }
    
    /**
     * Get sample doctors
     * @returns {Array} - Sample doctor data
     */
    function getSampleDoctors() {
        return [
            {
                id: 'd1001',
                name: 'Murtuza',
                specialty: 'Cardiology',
                qualification: 'MD, FACC',
                experience: 15,
                phone: '(555) 123-7890',
                email: 'murtuza@example.com',
                joiningDate: '2018-02-15',
                schedule: 'Mon-Fri: 9AM-5PM',
                bio: 'Dr. Murtuza is a board-certified cardiologist with extensive experience in interventional cardiology and cardiac care.',
                photo: 'https://randomuser.me/api/portraits/men/36.jpg'
            },
            {
                id: 'd1002',
                name: 'Abdul Rahman',
                specialty: 'Pediatrics',
                qualification: 'MD, FAAP',
                experience: 8,
                phone: '(555) 234-5678',
                email: 'abdul.rahman@example.com',
                joiningDate: '2020-05-10',
                schedule: 'Mon-Thu: 8AM-4PM',
                bio: 'Dr. Abdul Rahman specializes in pediatric care and has a passion for working with children of all ages.',
                photo: 'https://randomuser.me/api/portraits/men/26.jpg'
            },
            {
                id: 'd1003',
                name: 'Syed Rehan Ahmed',
                specialty: 'Neurology',
                qualification: 'MD, PhD',
                experience: 12,
                phone: '(555) 345-6789',
                email: 'rehan.ahmed@example.com',
                joiningDate: '2017-11-20',
                schedule: 'Tue-Sat: 10AM-6PM',
                bio: 'Dr. Syed Rehan Ahmed is a neurologist specializing in neurodegenerative disorders and neurological rehabilitation.',
                photo: 'https://randomuser.me/api/portraits/men/22.jpg'
            },
            {
                id: 'd1004',
                name: 'Aditya',
                specialty: 'Dermatology',
                qualification: 'MD, FAAD',
                experience: 10,
                phone: '(555) 456-7890',
                email: 'aditya@example.com',
                joiningDate: '2019-03-05',
                schedule: 'Mon-Wed-Fri: 9AM-6PM',
                bio: 'Dr. Aditya specializes in medical and cosmetic dermatology, with expertise in skin cancer prevention and treatment.',
                photo: 'https://randomuser.me/api/portraits/men/65.jpg'
            },
            {
                id: 'd1005',
                name: 'Stalin',
                specialty: 'Orthopedics',
                qualification: 'MD, FAAOS',
                experience: 18,
                phone: '(555) 567-8901',
                email: 'stalin@example.com',
                joiningDate: '2015-08-12',
                schedule: 'Tue-Thu: 8AM-5PM',
                bio: 'Dr. Stalin is an orthopedic surgeon with expertise in sports medicine and joint replacement surgery.',
                photo: 'https://randomuser.me/api/portraits/men/45.jpg'
            },
            {
                id: 'd1006',
                name: 'Lisa Anderson',
                specialty: 'Oncology',
                qualification: 'MD, PhD',
                experience: 14,
                phone: '(555) 678-9012',
                email: 'lisa.a@example.com',
                joiningDate: '2016-04-22',
                schedule: 'Mon-Fri: 8:30AM-4:30PM',
                bio: 'Dr. Anderson is a medical oncologist specializing in breast cancer treatment and research.',
                photo: 'https://randomuser.me/api/portraits/women/49.jpg'
            }
        ];
    }
}); 