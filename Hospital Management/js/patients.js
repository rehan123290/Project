// Patients Management JavaScript

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
        patientsTable: document.getElementById('patients-table'),
        patientForm: document.getElementById('patient-form'),
        patientModal: document.getElementById('patient-modal'),
        confirmModal: document.getElementById('confirm-modal'),
        addPatientBtn: document.getElementById('add-patient-btn'),
        cancelPatientBtn: document.getElementById('cancel-patient'),
        patientSearch: document.getElementById('patient-search'),
        patientFilter: document.getElementById('patient-filter'),
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
        patients: getFromLocalStorage('patients') || [],
        currentPage: 1,
        itemsPerPage: 10,
        editingPatientId: null,
        selectedPatientId: null,
        filteredPatients: [],
        searchDebounceTimer: null
    };
    
    // Initialize the page
    initializePage();
    
    /**
     * Initialize with sample data if none exists
     */
    function initializePage() {
        if (state.patients.length === 0) {
            state.patients = getSamplePatients();
            saveToLocalStorage('patients', state.patients);
        }
        
        // Initial render
        renderPatientsTable();
        
        // Add event listeners
        attachEventListeners();
    }
    
    /**
     * Attach all event listeners using delegation where appropriate
     */
    function attachEventListeners() {
        // Add patient button
        domElements.addPatientBtn.addEventListener('click', handleAddPatientClick);
        
        // Form submission
        domElements.patientForm.addEventListener('submit', handlePatientFormSubmit);
        
        // Cancel button
        domElements.cancelPatientBtn.addEventListener('click', () => closeModal(domElements.patientModal));
        
        // Search input with debounce for performance
        domElements.patientSearch.addEventListener('input', debounce(handleSearch, 300));
        
        // Filter change
        domElements.patientFilter.addEventListener('change', handleFilter);
        
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
        
        // Table actions (event delegation)
        domElements.patientsTable.addEventListener('click', handleTableClick);
    }
    
    /**
     * Handle click on add patient button
     */
    function handleAddPatientClick() {
        domElements.modalTitle.textContent = 'Add New Patient';
        domElements.patientForm.reset();
        state.editingPatientId = null;
        document.getElementById('patient-admission-date').valueAsDate = new Date();
        openModal(domElements.patientModal);
    }
    
    /**
     * Handle patient form submission
     * @param {Event} e - Submit event
     */
    function handlePatientFormSubmit(e) {
        e.preventDefault();
        
        // Validate the form
        if (!validateForm(domElements.patientForm)) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        // Get form data
        const patientData = {
            id: state.editingPatientId || generateId(),
            name: document.getElementById('patient-name').value,
            age: document.getElementById('patient-age').value,
            gender: document.getElementById('patient-gender').value,
            phone: document.getElementById('patient-phone').value,
            email: document.getElementById('patient-email').value || '',
            address: document.getElementById('patient-address').value || '',
            admissionDate: document.getElementById('patient-admission-date').value,
            status: document.getElementById('patient-status').value,
            medicalHistory: document.getElementById('patient-medical-history').value || '',
        };
        
        // Add or update patient
        if (state.editingPatientId) {
            updatePatient(patientData);
        } else {
            addPatient(patientData);
        }
        
        // Reset form and close modal
        domElements.patientForm.reset();
        closeModal(domElements.patientModal);
    }
    
    /**
     * Add a new patient
     * @param {Object} patientData - Patient data
     */
    function addPatient(patientData) {
        state.patients.push(patientData);
        saveToLocalStorage('patients', state.patients);
        showNotification('Patient added successfully', 'success');
        renderPatientsTable();
    }
    
    /**
     * Update existing patient
     * @param {Object} patientData - Patient data
     */
    function updatePatient(patientData) {
        const index = state.patients.findIndex(p => p.id === state.editingPatientId);
        if (index !== -1) {
            state.patients[index] = patientData;
            saveToLocalStorage('patients', state.patients);
            showNotification('Patient updated successfully', 'success');
            renderPatientsTable();
        }
    }
    
    /**
     * Handle search with debounce
     */
    function handleSearch() {
        state.currentPage = 1;
        renderPatientsTable();
    }
    
    /**
     * Handle filter change
     */
    function handleFilter() {
        state.currentPage = 1;
        renderPatientsTable();
    }
    
    /**
     * Handle previous page button click
     */
    function handlePrevPage() {
        if (state.currentPage > 1) {
            state.currentPage--;
            renderPatientsTable();
        }
    }
    
    /**
     * Handle next page button click
     */
    function handleNextPage() {
        const totalPages = Math.ceil(state.filteredPatients.length / state.itemsPerPage);
        if (state.currentPage < totalPages) {
            state.currentPage++;
            renderPatientsTable();
        }
    }
    
    /**
     * Handle close modal button click
     */
    function handleCloseModalClick() {
        closeModal(domElements.patientModal);
        closeModal(domElements.confirmModal);
    }
    
    /**
     * Handle table clicks using event delegation
     * @param {Event} e - Click event
     */
    function handleTableClick(e) {
        // Edit button click
        if (e.target.closest('.edit')) {
            const patientId = e.target.closest('tr').dataset.id;
            handleEditPatient(patientId);
        }
        
        // Delete button click
        if (e.target.closest('.delete')) {
            const patientId = e.target.closest('tr').dataset.id;
            handleDeletePatient(patientId);
        }
    }
    
    /**
     * Handle edit patient
     * @param {string} patientId - Patient ID
     */
    function handleEditPatient(patientId) {
        // Find the patient
        const patient = state.patients.find(p => p.id === patientId);
        if (!patient) return;
        
        // Set form fields
        document.getElementById('patient-id').value = patient.id;
        document.getElementById('patient-name').value = patient.name;
        document.getElementById('patient-age').value = patient.age;
        document.getElementById('patient-gender').value = patient.gender;
        document.getElementById('patient-phone').value = patient.phone;
        document.getElementById('patient-email').value = patient.email || '';
        document.getElementById('patient-address').value = patient.address || '';
        document.getElementById('patient-admission-date').value = patient.admissionDate;
        document.getElementById('patient-status').value = patient.status;
        document.getElementById('patient-medical-history').value = patient.medicalHistory || '';
        
        // Set editing state
        state.editingPatientId = patientId;
        domElements.modalTitle.textContent = 'Edit Patient';
        
        // Open modal
        openModal(domElements.patientModal);
    }
    
    /**
     * Handle delete patient
     * @param {string} patientId - Patient ID
     */
    function handleDeletePatient(patientId) {
        // Set selected patient
        state.selectedPatientId = patientId;
        
        // Show confirmation modal
        domElements.confirmMessage.textContent = 'Are you sure you want to delete this patient?';
        openModal(domElements.confirmModal);
    }
    
    /**
     * Handle confirm action (delete)
     */
    function handleConfirmAction() {
        if (state.selectedPatientId) {
            // Filter out the patient
            state.patients = state.patients.filter(p => p.id !== state.selectedPatientId);
            
            // Save to local storage
            saveToLocalStorage('patients', state.patients);
            
            // Show notification
            showNotification('Patient deleted successfully', 'success');
            
            // Reset state and close modal
            state.selectedPatientId = null;
            closeModal(domElements.confirmModal);
            
            // Re-render the table
            renderPatientsTable();
        }
    }
    
    /**
     * Render patients table
     */
    function renderPatientsTable() {
        // Filter patients
        filterPatients();
        
        // Calculate pagination
        calculatePagination();
        
        // Create and append table rows
        renderTableRows();
    }
    
    /**
     * Filter patients based on search and filter
     */
    function filterPatients() {
        const searchTerm = domElements.patientSearch.value.toLowerCase();
        const filterValue = domElements.patientFilter.value;
        
        state.filteredPatients = state.patients.filter(patient => {
            // Apply search filter
            const matchesSearch = patient.name.toLowerCase().includes(searchTerm) || 
                                patient.phone.includes(searchTerm) || 
                                (patient.email && patient.email.toLowerCase().includes(searchTerm));
            
            // Apply status filter
            const matchesFilter = filterValue === 'all' || 
                                (filterValue === 'active' && patient.status === 'Active') || 
                                (filterValue === 'discharged' && patient.status === 'Discharged');
            
            return matchesSearch && matchesFilter;
        });
    }
    
    /**
     * Calculate pagination values
     */
    function calculatePagination() {
        const totalPages = Math.ceil(state.filteredPatients.length / state.itemsPerPage);
        
        // Update pagination display
        domElements.pageInfo.textContent = `Page ${state.currentPage} of ${totalPages || 1}`;
        domElements.prevPageBtn.disabled = state.currentPage === 1;
        domElements.nextPageBtn.disabled = state.currentPage === totalPages || totalPages === 0;
    }
    
    /**
     * Create and append table rows
     */
    function renderTableRows() {
        // Get the tbody element
        const tbody = domElements.patientsTable.querySelector('tbody');
        
        // Clear the table
        tbody.innerHTML = '';
        
        // Get the patients to display
        const start = (state.currentPage - 1) * state.itemsPerPage;
        const end = start + state.itemsPerPage;
        const patientsToDisplay = state.filteredPatients.slice(start, end);
        
        // Show message if no patients
        if (patientsToDisplay.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td colspan="8" class="text-center">No patients found</td>`;
            tbody.appendChild(tr);
            return;
        }
        
        // Create table rows
        const fragment = document.createDocumentFragment();
        
        patientsToDisplay.forEach(patient => {
            const tr = createPatientRow(patient);
            fragment.appendChild(tr);
        });
        
        tbody.appendChild(fragment);
    }
    
    /**
     * Create a patient table row
     * @param {Object} patient - Patient data
     * @returns {HTMLElement} - Table row element
     */
    function createPatientRow(patient) {
        const tr = document.createElement('tr');
        tr.dataset.id = patient.id;
        
        tr.innerHTML = `
            <td>${patient.id.slice(0, 5)}</td>
            <td>${patient.name}</td>
            <td>${patient.age}</td>
            <td>${patient.gender}</td>
            <td>${patient.phone}</td>
            <td>${formatDate(patient.admissionDate)}</td>
            <td><span class="status-badge ${patient.status.toLowerCase()}">${patient.status}</span></td>
            <td class="actions">
                <button class="btn-icon edit" title="Edit Patient"><i class="fas fa-edit"></i></button>
                <button class="btn-icon delete" title="Delete Patient"><i class="fas fa-trash"></i></button>
            </td>
        `;
        
        return tr;
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
     * Get sample patients
     * @returns {Array} - Sample patient data
     */
    function getSamplePatients() {
        return [
            {
                id: 'p1001',
                name: 'John Smith',
                age: 45,
                gender: 'Male',
                phone: '(555) 123-4567',
                email: 'john.smith@example.com',
                address: '123 Main St, Anytown, USA',
                admissionDate: '2023-04-15',
                status: 'Active',
                medicalHistory: 'Hypertension, Type 2 Diabetes'
            },
            {
                id: 'p1002',
                name: 'Sarah Johnson',
                age: 32,
                gender: 'Female',
                phone: '(555) 234-5678',
                email: 'sarah.j@example.com',
                address: '456 Elm St, Othertown, USA',
                admissionDate: '2023-05-20',
                status: 'Active',
                medicalHistory: 'Asthma'
            },
            {
                id: 'p1003',
                name: 'Robert Davis',
                age: 58,
                gender: 'Male',
                phone: '(555) 345-6789',
                email: 'robert.d@example.com',
                address: '789 Oak Ave, Sometown, USA',
                admissionDate: '2023-03-10',
                status: 'Discharged',
                medicalHistory: 'Coronary Artery Disease, Post-Surgery Recovery'
            }
        ];
    }
}); 