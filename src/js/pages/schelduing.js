class SchedulingManager {
    constructor() {
        this.API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
            ? 'http://localhost:3001'
            : '';
        this.schedules = [];
        this.selectedDate = new Date();
        this.init();
    }

    async init() {
        if (!window.authManager?.isAuthenticated()) {
            window.location.href = '/login.html';
            return;
        }

        await this.loadSchedules();
        this.bindEvents();
        this.renderCalendar();
    }

    async loadSchedules() {
        try {
            const token = window.authManager?.token;
            const response = await fetch(`${this.API_BASE}/schelduing`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });

            if (response.ok) {
                this.schedules = await response.json();
                this.renderSchedules();
            } else {
                console.error('Failed to load schedules:', response.status);
            }
        } catch (error) {
            console.error('Load schedules error:', error);
            this.showError('Failed to load schedules');
        }
    }

    async createSchedule(scheduleData) {
        try {
            const token = window.authManager?.token;
            const response = await fetch(`${this.API_BASE}/schelduing`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify(scheduleData)
            });

            if (response.ok) {
                const newSchedule = await response.json();
                this.schedules.push(newSchedule);
                this.renderSchedules();
                this.renderCalendar();
                this.showSuccess('Schedule created successfully!');
                return newSchedule;
            } else {
                throw new Error('Failed to create schedule');
            }
        } catch (error) {
            console.error('Create schedule error:', error);
            this.showError('Failed to create schedule');
        }
    }

    async updateSchedule(id, scheduleData) {
        try {
            const token = window.authManager?.token;
            const response = await fetch(`${this.API_BASE}/schelduing/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {})
                },
                body: JSON.stringify(scheduleData)
            });

            if (response.ok) {
                const updatedSchedule = await response.json();
                const index = this.schedules.findIndex(s => s.id === id);
                if (index !== -1) {
                    this.schedules[index] = updatedSchedule;
                }
                this.renderSchedules();
                this.renderCalendar();
                this.showSuccess('Schedule updated successfully!');
                return updatedSchedule;
            } else {
                throw new Error('Failed to update schedule');
            }
        } catch (error) {
            console.error('Update schedule error:', error);
            this.showError('Failed to update schedule');
        }
    }

    async deleteSchedule(id) {
        try {
            const token = window.authManager?.token;
            const response = await fetch(`${this.API_BASE}/schelduing/${id}`, {
                method: 'DELETE',
                headers: token ? { Authorization: `Bearer ${token}` } : {}
            });

            if (response.ok) {
                this.schedules = this.schedules.filter(s => s.id !== id);
                this.renderSchedules();
                this.renderCalendar();
                this.showSuccess('Schedule deleted successfully!');
            } else {
                throw new Error('Failed to delete schedule');
            }
        } catch (error) {
            console.error('Delete schedule error:', error);
            this.showError('Failed to delete schedule');
        }
    }

    renderSchedules() {
        const container = document.getElementById('schedulesContainer');
        if (!container) return;

        if (this.schedules.length === 0) {
            container.innerHTML = `
        <div class="text-center py-5">
          <i class="bi bi-calendar-plus fs-1 text-muted mb-3"></i>
          <h5>No schedules yet</h5>
          <p class="text-muted">Create your first outfit schedule</p>
          <button class="btn btn-primary" id="createFirstScheduleBtn">
            <i class="bi bi-plus-circle me-1"></i>Create Schedule
          </button>
        </div>
      `;
            container.querySelector('#createFirstScheduleBtn')?.addEventListener('click', () => this.openCreateModal());
            return;
        }

        container.innerHTML = this.schedules.map(schedule => this.createScheduleCard(schedule)).join('');
    }

    createScheduleCard(schedule) {
        const isActive = schedule.isActive ? 'active' : '';
        const nextDate = schedule.nextOccurrence ? new Date(schedule.nextOccurrence).toLocaleDateString() : 'N/A';

        return `
      <div class="col-md-6 col-lg-4">
        <div class="card schedule-card ${isActive}">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h6 class="card-title mb-0">${schedule.name}</h6>
              <div class="dropdown">
                <button class="btn btn-sm btn-outline-secondary" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  <i class="bi bi-three-dots"></i>
                </button>
                <ul class="dropdown-menu dropdown-menu-end">
                  <li><a class="dropdown-item" href="#" data-action="edit" data-id="${schedule.id}">
                    <i class="bi bi-pencil me-2"></i>Edit
                  </a></li>
                  <li><a class="dropdown-item" href="#" data-action="toggle" data-id="${schedule.id}">
                    <i class="bi bi-${schedule.isActive ? 'pause' : 'play'} me-2"></i>${schedule.isActive ? 'Pause' : 'Resume'}
                  </a></li>
                  <li><hr class="dropdown-divider"></li>
                  <li><a class="dropdown-item text-danger" href="#" data-action="delete" data-id="${schedule.id}">
                    <i class="bi bi-trash me-2"></i>Delete
                  </a></li>
                </ul>
              </div>
            </div>
            
            <p class="card-text text-muted">${schedule.description || 'No description'}</p>
            
            <div class="schedule-details">
              <div class="mb-2">
                <small class="text-muted">Outfit:</small>
                <span class="ms-1">${schedule.outfit?.name || 'Not assigned'}</span>
              </div>
              <div class="mb-2">
                <small class="text-muted">Recurrence:</small>
                <span class="ms-1 badge bg-light text-dark">${schedule.recurrenceType}</span>
              </div>
              <div class="mb-2">
                <small class="text-muted">Next:</small>
                <span class="ms-1">${nextDate}</span>
              </div>
            </div>
            
            <div class="schedule-status mt-3">
              <span class="badge ${schedule.isActive ? 'bg-success' : 'bg-secondary'}">
                ${schedule.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>
      </div>
    `;
    }

    renderCalendar() {
        const calendarContainer = document.getElementById('calendarContainer');
        if (!calendarContainer) return;

        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        let calendarHTML = `
      <div class="calendar-header mb-3">
        <h5>${today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h5>
      </div>
      <div class="calendar-grid">
        <div class="calendar-weekdays">
          <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
        </div>
        <div class="calendar-days">
    `;

        for (let i = 0; i < startingDayOfWeek; i++) {
            calendarHTML += '<div class="calendar-day empty"></div>';
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentYear, currentMonth, day);
            const dateStr = date.toISOString().split('T')[0];
            const hasSchedule = this.schedules.some(s => s.scheduledDates?.includes(dateStr));
            const isToday = day === today.getDate();

            calendarHTML += `
        <div class="calendar-day ${isToday ? 'today' : ''} ${hasSchedule ? 'has-schedule' : ''}" 
             data-date="${dateStr}">
          <button type="button" class="calendar-day-btn" data-date="${dateStr}">
            <span class="calendar-day-number">${day}</span>
            ${hasSchedule ? '<span class="schedule-indicator"></span>' : ''}
          </button>
        </div>
      `;
        }

        calendarHTML += '</div></div>';
        calendarContainer.innerHTML = calendarHTML;

        calendarContainer.querySelectorAll('.calendar-day-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectDate(e.currentTarget.dataset.date));
        });
    }

    selectDate(dateStr) {
        document.querySelectorAll('.calendar-day.selected').forEach(day => {
            day.classList.remove('selected');
        });
        document.querySelector(`[data-date="${dateStr}"]`)?.classList.add('selected');
        this.showSchedulesForDate(dateStr);
    }

    showSchedulesForDate(dateStr) {
        const daySchedules = this.schedules.filter(s =>
            s.scheduledDates?.includes(dateStr) || this.isScheduledForDate(s, dateStr)
        );

        const dayContainer = document.getElementById('daySchedulesContainer');
        if (!dayContainer) return;

        if (daySchedules.length === 0) {
            dayContainer.innerHTML = `
        <div class="text-center py-3">
          <p class="text-muted mb-2">No schedules for ${new Date(dateStr).toLocaleDateString()}</p>
          <button class="btn btn-sm btn-outline-primary" id="addScheduleForDayBtn">Add Schedule</button>
        </div>
      `;
            dayContainer.querySelector('#addScheduleForDayBtn')?.addEventListener('click', () => this.openCreateModal(dateStr));
            return;
        }

        dayContainer.innerHTML = `
      <h6>Schedules for ${new Date(dateStr).toLocaleDateString()}</h6>
      <div class="list-group">
        ${daySchedules.map(schedule => `
          <div class="list-group-item d-flex justify-content-between align-items-center">
            <div>
              <h6 class="mb-1">${schedule.name}</h6>
              <p class="mb-1 text-muted">${schedule.outfit?.name || 'No outfit'}</p>
            </div>
            <span class="badge bg-primary">${schedule.scheduledTime || 'All day'}</span>
          </div>
        `).join('')}
      </div>
    `;
    }

    isScheduledForDate(schedule, dateStr) {
        const date = new Date(dateStr);
        const startDate = new Date(schedule.startDate);
        if (isNaN(startDate) || date < startDate) return false;

        switch (schedule.recurrenceType) {
            case 'daily':
                return true;
            case 'weekly':
                return date.getDay() === startDate.getDay();
            case 'monthly':
                return date.getDate() === startDate.getDate();
            default:
                return false;
        }
    }

    openCreateModal(selectedDate = null) {
        const existing = document.getElementById('createScheduleModal');
        if (!existing) this.createScheduleModal();
        if (selectedDate) {
            const dateInput = document.getElementById('scheduleDate');
            if (dateInput) dateInput.value = selectedDate;
        }
        const modalInstance = new bootstrap.Modal(document.getElementById('createScheduleModal'));
        modalInstance.show();
    }

    createScheduleModal() {
        const modalHTML = `
      <div class="modal fade" id="createScheduleModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Create Schedule</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form id="createScheduleForm">
                <div class="mb-3">
                  <label for="scheduleName" class="form-label">Schedule Name</label>
                  <input type="text" class="form-control" id="scheduleName" required>
                </div>
                <div class="mb-3">
                  <label for="scheduleDescription" class="form-label">Description</label>
                  <textarea class="form-control" id="scheduleDescription" rows="2"></textarea>
                </div>
                <div class="mb-3">
                  <label for="scheduleOutfit" class="form-label">Outfit</label>
                  <select class="form-control" id="scheduleOutfit">
                    <option value="">Select outfit...</option>
                  </select>
                </div>
                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="scheduleDate" class="form-label">Start Date</label>
                      <input type="date" class="form-control" id="scheduleDate" required>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="scheduleTime" class="form-label">Time</label>
                      <input type="time" class="form-control" id="scheduleTime">
                    </div>
                  </div>
                </div>
                <div class="mb-3">
                  <label for="recurrenceType" class="form-label">Recurrence</label>
                  <select class="form-control" id="recurrenceType">
                    <option value="once">Once</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-primary" id="saveScheduleBtn">Save Schedule</button>
            </div>
          </div>
        </div>
      </div>
    `;
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.getElementById('saveScheduleBtn').addEventListener('click', () => this.saveSchedule());
    }

    async saveSchedule() {
        const scheduleData = {
            name: document.getElementById('scheduleName').value.trim(),
            description: document.getElementById('scheduleDescription').value.trim(),
            outfitId: document.getElementById('scheduleOutfit').value || null,
            startDate: document.getElementById('scheduleDate').value,
            scheduledTime: document.getElementById('scheduleTime').value,
            recurrenceType: document.getElementById('recurrenceType').value,
            isActive: true
        };
        if (!scheduleData.name || !scheduleData.startDate) {
            this.showError('Please fill required fields');
            return;
        }

        await this.createSchedule(scheduleData);
        const modal = bootstrap.Modal.getInstance(document.getElementById('createScheduleModal'));
        modal.hide();
        document.getElementById('createScheduleForm')?.reset();
    }

    async editSchedule(id) {
        const schedule = this.schedules.find(s => s.id === id);
        if (!schedule) return;

        this.openCreateModal();
        document.querySelector('#createScheduleModal .modal-title').textContent = 'Edit Schedule';
        document.getElementById('scheduleName').value = schedule.name || '';
        document.getElementById('scheduleDescription').value = schedule.description || '';
        document.getElementById('scheduleOutfit').value = schedule.outfitId || '';
        document.getElementById('scheduleDate').value = (schedule.startDate || '').split('T')[0] || '';
        document.getElementById('scheduleTime').value = schedule.scheduledTime || '';
        document.getElementById('recurrenceType').value = schedule.recurrenceType || 'once';

        const saveBtn = document.getElementById('saveScheduleBtn');
        const handler = async () => {
            const scheduleData = {
                name: document.getElementById('scheduleName').value.trim(),
                description: document.getElementById('scheduleDescription').value.trim(),
                outfitId: document.getElementById('scheduleOutfit').value || null,
                startDate: document.getElementById('scheduleDate').value,
                scheduledTime: document.getElementById('scheduleTime').value,
                recurrenceType: document.getElementById('recurrenceType').value
            };
            await this.updateSchedule(id, scheduleData);
            const modal = bootstrap.Modal.getInstance(document.getElementById('createScheduleModal'));
            modal.hide();
            saveBtn.removeEventListener('click', handler);
        };
        saveBtn.addEventListener('click', handler);
    }

    async toggleSchedule(id) {
        const schedule = this.schedules.find(s => s.id === id);
        if (!schedule) return;
        await this.updateSchedule(id, { isActive: !schedule.isActive });
    }

    bindEvents() {
        const addBtn = document.getElementById('addScheduleBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.openCreateModal());
        }

        const refreshBtn = document.getElementById('refreshSchedules');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadSchedules());
        }

        const schedulesContainer = document.getElementById('schedulesContainer');
        schedulesContainer?.addEventListener('click', (e) => {
            const actionEl = e.target.closest('[data-action]');
            if (!actionEl) return;
            const action = actionEl.getAttribute('data-action');
            const id = Number(actionEl.getAttribute('data-id'));
            if (action === 'edit') this.editSchedule(id);
            if (action === 'toggle') this.toggleSchedule(id);
            if (action === 'delete') this.deleteSchedule(id);
        });
    }

    showError(message) {
        const alertContainer = document.getElementById('alertContainer');
        if (alertContainer) {
            alertContainer.innerHTML = `
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
          <i class="bi bi-exclamation-triangle-fill me-2"></i>
          ${message}
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
      `;
        }
    }

    showSuccess(message) {
        const alertContainer = document.getElementById('alertContainer');
        if (alertContainer) {
            alertContainer.innerHTML = `
        <div class="alert alert-success alert-dismissible fade show" role="alert">
          <i class="bi bi-check-circle-fill me-2"></i>
          ${message}
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
      `;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.schedulingManager = new SchedulingManager();
});