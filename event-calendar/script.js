// Event Calendar JavaScript
class EventCalendar {
    constructor() {
        this.events = [];
        this.currentDate = new Date();
        this.selectedDate = null;
        this.init();
    }

    init() {
        this.loadEvents();
        this.renderCalendar();
        this.bindEvents();
        this.updateEventsList();
    }

    bindEvents() {
        // Navigation buttons
        document.getElementById('prevBtn').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.renderCalendar();
        });

        document.getElementById('nextBtn').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.renderCalendar();
        });

        // Add event button
        document.getElementById('addEventBtn').addEventListener('click', () => {
            this.openModal();
        });

        // Modal close button
        document.querySelector('.close').addEventListener('click', () => {
            this.closeModal();
        });

        // Form submission
        document.getElementById('eventForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addEvent();
        });

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('eventModal');
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }

    renderCalendar() {
        const grid = document.getElementById('calendarGrid');
        const monthYear = document.getElementById('monthYear');
        
        // Clear previous calendar (except headers)
        const cells = grid.querySelectorAll('.day-cell');
        cells.forEach(cell => cell.remove());

        // Set month/year display
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        monthYear.textContent = `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;

        // Get calendar data
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        // Add previous month's trailing days
        for (let i = firstDay - 1; i >= 0; i--) {
            this.createDayCell(daysInPrevMonth - i, true, month - 1, year);
        }

        // Add current month days
        for (let day = 1; day <= daysInMonth; day++) {
            this.createDayCell(day, false, month, year);
        }

        // Add next month's leading days
        const totalCells = grid.children.length - 7; // Subtract headers
        const remainingCells = 42 - totalCells; // 6 rows x 7 days
        for (let day = 1; day <= remainingCells; day++) {
            this.createDayCell(day, true, month + 1, year);
        }
    }

    createDayCell(day, isOtherMonth, month, year) {
        const grid = document.getElementById('calendarGrid');
        const cell = document.createElement('div');
        cell.className = 'day-cell';
        
        if (isOtherMonth) {
            cell.classList.add('other-month');
        }
        
        // Check if it's today
        const today = new Date();
        const cellDate = new Date(year, month, day);
        if (cellDate.toDateString() === today.toDateString()) {
            cell.classList.add('today');
        }

        const dayNumber = document.createElement('div');
        dayNumber.className = 'day-number';
        dayNumber.textContent = day;
        cell.appendChild(dayNumber);

        // Add events for this day
        const dayEvents = this.getEventsForDate(cellDate);
        dayEvents.forEach(event => {
            const eventEl = document.createElement('div');
            eventEl.className = 'event';
            eventEl.textContent = event.title;
            eventEl.addEventListener('click', () => {
                this.showEventDetails(event);
            });
            cell.appendChild(eventEl);
        });

        // Click handler for adding events
        cell.addEventListener('click', (e) => {
            if (e.target.classList.contains('day-number')) {
                this.selectedDate = cellDate;
                this.openModal(cellDate);
            }
        });

        grid.appendChild(cell);
    }

    openModal(date = null) {
        const modal = document.getElementById('eventModal');
        const form = document.getElementById('eventForm');
        
        form.reset();
        
        if (date) {
            const dateInput = document.getElementById('eventDate');
            dateInput.value = date.toISOString().split('T')[0];
        }
        
        modal.style.display = 'block';
    }

    closeModal() {
        const modal = document.getElementById('eventModal');
        modal.style.display = 'none';
    }

    addEvent() {
        const title = document.getElementById('eventTitle').value;
        const date = document.getElementById('eventDate').value;
        const time = document.getElementById('eventTime').value;
        const description = document.getElementById('eventDescription').value;

        if (!title || !date || !time) {
            alert('Please fill in all required fields');
            return;
        }

        const event = {
            id: Date.now(),
            title,
            date,
            time,
            description,
            datetime: new Date(`${date}T${time}`)
        };

        this.events.push(event);
        this.saveEvents();
        this.renderCalendar();
        this.updateEventsList();
        this.closeModal();
    }

    getEventsForDate(date) {
        return this.events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.toDateString() === date.toDateString();
        });
    }

    updateEventsList() {
        const eventsList = document.getElementById('eventsList');
        eventsList.innerHTML = '';

        // Get upcoming events (next 30 days)
        const now = new Date();
        const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
        
        const upcomingEvents = this.events
            .filter(event => {
                const eventDate = new Date(event.datetime);
                return eventDate >= now && eventDate <= thirtyDaysFromNow;
            })
            .sort((a, b) => new Date(a.datetime) - new Date(b.datetime))
            .slice(0, 5); // Show only next 5 events

        if (upcomingEvents.length === 0) {
            eventsList.innerHTML = '<p>No upcoming events</p>';
            return;
        }

        upcomingEvents.forEach(event => {
            const eventItem = document.createElement('div');
            eventItem.className = 'event-item';
            
            const eventDate = new Date(event.datetime);
            const dateStr = eventDate.toLocaleDateString();
            const timeStr = eventDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            eventItem.innerHTML = `
                <h4>${event.title}</h4>
                <div class="event-time">${dateStr} at ${timeStr}</div>
                <div class="event-desc">${event.description || 'No description'}</div>
            `;
            
            eventsList.appendChild(eventItem);
        });
    }

    showEventDetails(event) {
        const eventDate = new Date(event.datetime);
        const dateStr = eventDate.toLocaleDateString();
        const timeStr = eventDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        alert(`${event.title}\n${dateStr} at ${timeStr}\n\n${event.description || 'No description'}`);
    }

    loadEvents() {
        const savedEvents = localStorage.getItem('calendarEvents');
        if (savedEvents) {
            this.events = JSON.parse(savedEvents);
        }
    }

    saveEvents() {
        localStorage.setItem('calendarEvents', JSON.stringify(this.events));
    }
}

// Initialize calendar when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new EventCalendar();
});
