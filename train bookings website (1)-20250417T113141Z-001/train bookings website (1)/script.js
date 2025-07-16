// Sample train data (in a real application, this would come from a backend)
const trains = [
    {
        id: 1,
        name: "Express 101",
        from: "New York",
        to: "Boston",
        departure: "08:00 AM",
        arrival: "12:00 PM",
        price: 85,
        seats: 45
    },
    {
        id: 2,
        name: "Bullet 202",
        from: "Boston",
        to: "Washington DC",
        departure: "10:30 AM",
        arrival: "03:30 PM",
        price: 120,
        seats: 32
    },
    {
        id: 3,
        name: "Regional 303",
        from: "Washington DC",
        to: "Philadelphia",
        departure: "02:00 PM",
        arrival: "04:30 PM",
        price: 65,
        seats: 58
    }
];

// Sample schedule data
const schedules = [
    {
        trainNo: "EXP101",
        name: "Express 101",
        departure: "08:00 AM",
        arrival: "12:00 PM",
        duration: "4h 0m",
        status: "On Time"
    },
    {
        trainNo: "BUL202",
        name: "Bullet 202",
        departure: "10:30 AM",
        arrival: "03:30 PM",
        duration: "5h 0m",
        status: "Delayed"
    },
    {
        trainNo: "REG303",
        name: "Regional 303",
        departure: "02:00 PM",
        arrival: "04:30 PM",
        duration: "2h 30m",
        status: "On Time"
    }
];

// DOM Elements
const searchForm = document.getElementById('searchForm');
const trainList = document.getElementById('trainList');
const scheduleBody = document.getElementById('scheduleBody');
const bookingModal = document.getElementById('bookingModal');
const bookingForm = document.getElementById('bookingForm');
const closeModal = document.querySelector('.close-modal');

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Set minimum date for the date input
    const dateInput = document.getElementById('date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    
    // Populate schedule table
    populateScheduleTable();
    
    // Add smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});

// Search form submission
searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const from = document.getElementById('from').value;
    const to = document.getElementById('to').value;
    const date = document.getElementById('date').value;
    const passengers = document.getElementById('passengers').value;

    // Filter trains based on search criteria
    const filteredTrains = trains.filter(train => 
        train.from.toLowerCase().includes(from.toLowerCase()) &&
        train.to.toLowerCase().includes(to.toLowerCase())
    );

    displaySearchResults(filteredTrains, passengers);
    document.getElementById('results').classList.remove('hidden');
    document.getElementById('results').scrollIntoView({ behavior: 'smooth' });
});

// Display search results
function displaySearchResults(filteredTrains, passengers) {
    trainList.innerHTML = '';
    
    if (filteredTrains.length === 0) {
        trainList.innerHTML = `
            <div class="no-results">
                <h3>No trains found for your search criteria</h3>
                <p>Please try different dates or destinations</p>
            </div>
        `;
        return;
    }

    filteredTrains.forEach(train => {
        const totalPrice = train.price * parseInt(passengers);
        const card = document.createElement('div');
        card.className = 'train-card';
        card.innerHTML = `
            <h3>${train.name}</h3>
            <div class="train-details">
                <p><strong>From:</strong> ${train.from}</p>
                <p><strong>To:</strong> ${train.to}</p>
                <p><strong>Departure:</strong> ${train.departure}</p>
                <p><strong>Arrival:</strong> ${train.arrival}</p>
                <p><strong>Available Seats:</strong> ${train.seats}</p>
                <p><strong>Price:</strong> $${totalPrice} (${passengers} passengers)</p>
                <button onclick="openBooking(${train.id})" class="search-btn">Book Now</button>
            </div>
        `;
        trainList.appendChild(card);
    });
}

// Populate schedule table
function populateScheduleTable() {
    scheduleBody.innerHTML = '';
    schedules.forEach(schedule => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${schedule.trainNo}</td>
            <td>${schedule.name}</td>
            <td>${schedule.departure}</td>
            <td>${schedule.arrival}</td>
            <td>${schedule.duration}</td>
            <td><span class="status ${schedule.status.toLowerCase().replace(' ', '-')}">${schedule.status}</span></td>
        `;
        scheduleBody.appendChild(row);
    });
}

// Booking modal functions
function openBooking(trainId) {
    const train = trains.find(t => t.id === trainId);
    if (train) {
        bookingModal.classList.remove('hidden');
        // Pre-fill some booking information if needed
    }
}

closeModal.addEventListener('click', () => {
    bookingModal.classList.add('hidden');
});

bookingModal.addEventListener('click', (e) => {
    if (e.target === bookingModal) {
        bookingModal.classList.add('hidden');
    }
});

// Booking form submission
bookingForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = {
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        seatType: document.getElementById('seatType').value
    };

    // Here you would typically send this data to a server
    alert('Booking successful! Confirmation will be sent to your email.');
    bookingModal.classList.add('hidden');
    bookingForm.reset();
});

// Add some interactivity to the navigation
window.addEventListener('scroll', () => {
    const nav = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        nav.style.background = 'rgba(44, 62, 80, 0.95)';
    } else {
        nav.style.background = 'var(--primary-color)';
    }
});

// Form validation
const inputs = document.querySelectorAll('input');
inputs.forEach(input => {
    input.addEventListener('invalid', (e) => {
        e.preventDefault();
        input.classList.add('error');
    });
    
    input.addEventListener('input', () => {
        input.classList.remove('error');
    });
});

// Add autocomplete for stations (sample data)
const stations = [
    "New York", "Boston", "Washington DC", "Philadelphia", "Chicago",
    "Los Angeles", "San Francisco", "Seattle", "Miami", "Dallas"
];

const fromInput = document.getElementById('from');
const toInput = document.getElementById('to');

function setupAutocomplete(input, stations) {
    let currentFocus;
    
    input.addEventListener('input', function(e) {
        let val = this.value;
        closeAllLists();
        
        if (!val) return false;
        currentFocus = -1;
        
        const list = document.createElement('div');
        list.setAttribute('id', this.id + 'autocomplete-list');
        list.setAttribute('class', 'autocomplete-items');
        this.parentNode.appendChild(list);
        
        stations.forEach(station => {
            if (station.toLowerCase().includes(val.toLowerCase())) {
                const item = document.createElement('div');
                item.innerHTML = station;
                item.addEventListener('click', function(e) {
                    input.value = this.innerHTML;
                    closeAllLists();
                });
                list.appendChild(item);
            }
        });
    });
    
    function closeAllLists(elmnt) {
        const x = document.getElementsByClassName('autocomplete-items');
        for (let i = 0; i < x.length; i++) {
            if (elmnt != x[i] && elmnt != input) {
                x[i].parentNode.removeChild(x[i]);
            }
        }
    }
    
    document.addEventListener('click', function (e) {
        closeAllLists(e.target);
    });
}

setupAutocomplete(fromInput, stations);
setupAutocomplete(toInput, stations); 